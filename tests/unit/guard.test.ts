import { beforeEach, describe, expect, it } from "vitest";
import {
  SITE_LIMIT,
  checkRateLimit,
  checkSendLimit,
  dailyBudgetMicroUsd,
  recordSpend,
  resetGuard,
  spentTodayMicroUsd,
} from "@/lib/chat/guard";

beforeEach(() => resetGuard());

describe("checkRateLimit", () => {
  const t0 = Date.UTC(2026, 10, 8, 12);

  it("allows 8 requests per visitor in 10 minutes, then says when to retry", () => {
    for (let i = 0; i < 8; i++) expect(checkRateLimit("a", t0 + i * 1000).ok).toBe(true);
    const blocked = checkRateLimit("a", t0 + 9000);
    expect(blocked).toEqual({ ok: false, retryAfterSeconds: 600 - 9 });
    expect(checkRateLimit("b", t0 + 9000).ok).toBe(true);
    expect(checkRateLimit("a", t0 + 10 * 60_000 + 1).ok).toBe(true);
  });

  it("allows 40 per visitor per day", () => {
    for (let i = 0; i < 40; i++) expect(checkRateLimit("a", t0 + i * 11 * 60_000).ok).toBe(true);
    expect(checkRateLimit("a", t0 + 40 * 11 * 60_000).ok).toBe(false);
  });

  it("caps requests across all visitors, so a flood from many addresses is stopped", () => {
    for (let i = 0; i < SITE_LIMIT.limit; i++) expect(checkRateLimit(`visitor-${i}`, t0).ok).toBe(true);
    const blocked = checkRateLimit("someone-new", t0 + 1000);
    expect(blocked).toEqual({ ok: false, retryAfterSeconds: 59 });
    expect(checkRateLimit("someone-new", t0 + SITE_LIMIT.ms + 1).ok).toBe(true);
  });

  it("doesn't count blocked requests", () => {
    for (let i = 0; i < 8; i++) checkRateLimit("a", t0);
    for (let i = 0; i < 50; i++) checkRateLimit("a", t0 + 1);
    expect(checkRateLimit("b", t0 + 2).ok).toBe(true);
  });
});

describe("checkSendLimit", () => {
  const t0 = Date.UTC(2026, 10, 9, 12);
  it("allows 3 sends per visitor per hour and keeps its own count", () => {
    for (let i = 0; i < 3; i++) expect(checkSendLimit("a", t0 + i).ok).toBe(true);
    expect(checkSendLimit("a", t0 + 10).ok).toBe(false);
    expect(checkSendLimit("a", t0 + 60 * 60_000 + 1).ok).toBe(true);
    // Wording help is counted separately.
    expect(checkRateLimit("a", t0 + 20).ok).toBe(true);
  });
  it("allows 6 per visitor per day", () => {
    for (let i = 0; i < 6; i++) expect(checkSendLimit("b", t0 + i * 61 * 60_000).ok).toBe(true);
    expect(checkSendLimit("b", t0 + 6 * 61 * 60_000).ok).toBe(false);
  });
});

describe("daily spend", () => {
  it("adds up within a UTC day and resets the next day", () => {
    recordSpend(1500.2, new Date("2026-11-08T10:00:00Z"));
    recordSpend(500, new Date("2026-11-08T23:59:00Z"));
    expect(spentTodayMicroUsd(new Date("2026-11-08T23:59:30Z"))).toBe(1501 + 500);
    expect(spentTodayMicroUsd(new Date("2026-11-09T00:00:01Z"))).toBe(0);
  });
});

describe("dailyBudgetMicroUsd", () => {
  it("defaults to $3", () => {
    expect(dailyBudgetMicroUsd({})).toBe(3_000_000);
    expect(dailyBudgetMicroUsd({ CHAT_DAILY_BUDGET_USD: "" })).toBe(3_000_000);
  });
  it("reads the env var and ignores nonsense", () => {
    expect(dailyBudgetMicroUsd({ CHAT_DAILY_BUDGET_USD: "1.5" })).toBe(1_500_000);
    expect(dailyBudgetMicroUsd({ CHAT_DAILY_BUDGET_USD: "0" })).toBe(0);
    expect(dailyBudgetMicroUsd({ CHAT_DAILY_BUDGET_USD: "lots" })).toBe(3_000_000);
    expect(dailyBudgetMicroUsd({ CHAT_DAILY_BUDGET_USD: "-5" })).toBe(3_000_000);
  });
});
