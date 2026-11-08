import Anthropic from "@anthropic-ai/sdk";
import { getAnthropic } from "@/lib/chat/anthropic";
import { INTRO_MODEL, MAX_BODY_BYTES, MAX_NOTE_CHARS, MAX_OUTPUT_TOKENS } from "@/lib/chat/config";
import { checkRateLimit, dailyBudgetMicroUsd, recordSpend, spentTodayMicroUsd } from "@/lib/chat/guard";
import type { IntroErrorCode } from "@/lib/chat/notices";
import { usageCostMicroUsd } from "@/lib/chat/pricing";
import { INTRO_SYSTEM, NO_NOTE } from "@/lib/chat/prompt";
import { clientKey, isAllowedOrigin, readBodyCapped } from "@/lib/chat/request";
import { parseIntroRequest } from "@/lib/chat/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE = { "Cache-Control": "no-store" };

function fail(code: IntroErrorCode, status: number, headers: Record<string, string> = {}): Response {
  return Response.json({ error: code }, { status, headers: { ...NO_STORE, ...headers } });
}

/** Counts, status codes and token usage only. Never what visitors wrote. */
function log(entry: Record<string, unknown>) {
  console.info(JSON.stringify({ scope: "intro", ...entry }));
}

/**
 * Turns a visitor's few lines about themselves into a short first message to
 * Maksym, which they can edit and send by email, X or LinkedIn. Nothing is stored.
 */
export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req.headers.get("origin"))) return fail("forbidden", 403);

  const raw = await readBodyCapped(req, MAX_BODY_BYTES);
  if (raw === null) return fail("bad_request", 400);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("bad_request", 400);
  }
  const parsed = parseIntroRequest(body);
  if (!parsed.ok) return fail("bad_request", 400);

  const client = getAnthropic();
  if (!client) {
    log({ event: "unavailable" });
    return fail("unavailable", 503);
  }

  const limit = checkRateLimit(clientKey(req.headers));
  if (!limit.ok) return fail("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  if (spentTodayMicroUsd() >= dailyBudgetMicroUsd()) {
    log({ event: "budget_reached" });
    return fail("budget", 503);
  }

  try {
    const message = await client.beta.messages.create({
      model: INTRO_MODEL,
      max_tokens: MAX_OUTPUT_TOKENS,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      cache_control: { type: "ephemeral" },
      system: INTRO_SYSTEM,
      messages: [{ role: "user", content: parsed.about }],
    });

    const cost = usageCostMicroUsd(message.usage, INTRO_MODEL, message.model);
    recordSpend(cost);
    log({
      event: "note",
      stop_reason: message.stop_reason,
      model: message.model,
      input_tokens: message.usage.input_tokens,
      output_tokens: message.usage.output_tokens,
      cost_micro_usd: cost,
    });

    if (message.stop_reason === "refusal") return fail("refusal", 422);
    const text = message.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();
    if (!text || text === NO_NOTE || text.includes(NO_NOTE)) return fail("unclear", 422);
    return Response.json({ note: text.slice(0, MAX_NOTE_CHARS).trim() }, { headers: NO_STORE });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      log({ event: "upstream_rate_limited", status: 429 });
      return fail("rate_limited", 429, { "Retry-After": "30" });
    }
    log({ event: "upstream_error", status: err instanceof Anthropic.APIError ? (err.status ?? null) : null });
    return fail("error", 502);
  }
}
