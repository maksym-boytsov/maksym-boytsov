import "server-only";
import { DEFAULT_DAILY_BUDGET_USD } from "./config";

/**
 * Rate limits and the daily spending cap, kept in memory. No external store.
 *
 * Each server instance keeps its own counts, so on Vercel (several short-lived
 * instances) these are approximate. The hard backstop is the monthly spend
 * limit on the API key's workspace in the Claude Console.
 */

interface Window {
  limit: number;
  ms: number;
}

/** Across all visitors: stops floods even when they come from many addresses. */
export const SITE_LIMIT: Window = { limit: 30, ms: 60_000 };
/** Per visitor: 8 requests per 10 minutes and 40 per day. */
const VISITOR_LIMITS: readonly Window[] = [
  { limit: 8, ms: 10 * 60_000 },
  { limit: 40, ms: 24 * 60 * 60_000 },
];
/** Sending real email is stricter: 3 per visitor per hour, 6 per day, and 40 a day for the whole site. */
const SEND_SITE_LIMIT: Window = { limit: 40, ms: 24 * 60 * 60_000 };
const SEND_VISITOR_LIMITS: readonly Window[] = [
  { limit: 3, ms: 60 * 60_000 },
  { limit: 6, ms: 24 * 60 * 60_000 },
];
const MAX_TRACKED_VISITORS = 10_000;

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

const secondsUntil = (ms: number) => Math.max(1, Math.ceil(ms / 1000));

/** A sliding-window limiter with one site-wide window and per-visitor windows. */
function createLimiter(site: Window, visitor: readonly Window[]) {
  const longest = Math.max(...visitor.map((w) => w.ms));
  let siteHits: number[] = [];
  const visitorHits = new Map<string, number[]>();
  return {
    /** Checks and, if allowed, counts one request. */
    check(key: string, now = Date.now()): RateLimitResult {
      siteHits = siteHits.filter((t) => t > now - site.ms);
      if (siteHits.length >= site.limit) {
        return { ok: false, retryAfterSeconds: secondsUntil(siteHits[0] + site.ms - now) };
      }
      const hits = (visitorHits.get(key) ?? []).filter((t) => t > now - longest);
      for (const w of visitor) {
        const inWindow = hits.filter((t) => t > now - w.ms);
        if (inWindow.length >= w.limit) {
          return { ok: false, retryAfterSeconds: secondsUntil(inWindow[0] + w.ms - now) };
        }
      }
      siteHits.push(now);
      hits.push(now);
      // Re-insert so the Map stays in least-recently-seen order, then trim the oldest.
      visitorHits.delete(key);
      visitorHits.set(key, hits);
      if (visitorHits.size > MAX_TRACKED_VISITORS) visitorHits.delete(visitorHits.keys().next().value as string);
      return { ok: true };
    },
    reset() {
      siteHits = [];
      visitorHits.clear();
    },
  };
}

const wordingLimiter = createLimiter(SITE_LIMIT, VISITOR_LIMITS);
const sendLimiter = createLimiter(SEND_SITE_LIMIT, SEND_VISITOR_LIMITS);

let spendDay = "";
let spendMicroUsd = 0;

/** Wording help: checks and, if allowed, counts one request. */
export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  return wordingLimiter.check(key, now);
}

/** Sending a message by email: checks and, if allowed, counts one send. */
export function checkSendLimit(key: string, now = Date.now()): RateLimitResult {
  return sendLimiter.check(key, now);
}

function rollDay(now: Date) {
  const day = now.toISOString().slice(0, 10);
  if (day !== spendDay) {
    spendDay = day;
    spendMicroUsd = 0;
  }
}

/** Today's (UTC) spend in micro-dollars, on this instance. */
export function spentTodayMicroUsd(now = new Date()): number {
  rollDay(now);
  return spendMicroUsd;
}

export function recordSpend(microUsd: number, now = new Date()): void {
  rollDay(now);
  if (microUsd > 0) spendMicroUsd += Math.ceil(microUsd);
}

export function dailyBudgetMicroUsd(env: Record<string, string | undefined> = process.env): number {
  const raw = env.CHAT_DAILY_BUDGET_USD;
  const usd = raw === undefined || raw.trim() === "" ? DEFAULT_DAILY_BUDGET_USD : Number(raw);
  return Number.isFinite(usd) && usd >= 0 ? Math.round(usd * 1_000_000) : DEFAULT_DAILY_BUDGET_USD * 1_000_000;
}

/** Test helper: clears all counters. */
export function resetGuard(): void {
  wordingLimiter.reset();
  sendLimiter.reset();
  spendDay = "";
  spendMicroUsd = 0;
}
