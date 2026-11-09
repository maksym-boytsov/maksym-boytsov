import { MAX_BODY_BYTES } from "@/lib/contact/config";
import { checkSendLimit } from "@/lib/contact/guard";
import { getResend, mailFrom, mailTo } from "@/lib/contact/mail";
import type { MessageErrorCode } from "@/lib/contact/notices";
import { NO_STORE, clientKey, isAllowedOrigin, jsonError, logger, readJson } from "@/lib/contact/request";
import { parseMessageRequest } from "@/lib/contact/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const fail = (code: MessageErrorCode, status: number, headers?: Record<string, string>) =>
  jsonError(code, status, headers);
/** Counts and status codes only. Never the message or the visitor's address. */
const log = logger("message");

/** Lets the page know whether it can offer Send, or should fall back to a mailto link. */
export function GET(): Response {
  return Response.json({ available: getResend() !== null }, { headers: NO_STORE });
}

/** Sends the visitor's message to Maksym's inbox through Resend, with their address (if given) as reply-to. */
export async function POST(req: Request): Promise<Response> {
  if (!isAllowedOrigin(req.headers.get("origin"))) return fail("forbidden", 403);

  const parsed = parseMessageRequest(await readJson(req, MAX_BODY_BYTES));
  if (!parsed.ok) return fail("bad_request", 400);

  // A filled-in spam trap: pretend it worked, send nothing.
  if (parsed.bot) {
    log({ event: "trap" });
    return Response.json({ ok: true }, { headers: NO_STORE });
  }

  const resend = getResend();
  if (!resend) return fail("unavailable", 503);

  const limit = checkSendLimit(clientKey(req.headers));
  if (!limit.ok) return fail("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });

  try {
    const { error } = await resend.emails.send({
      from: mailFrom(),
      to: mailTo(),
      ...(parsed.email ? { replyTo: parsed.email } : {}),
      subject: parsed.email ? "New message from maksym.page" : "New message from maksym.page (no reply address)",
      // Plain text only: nothing the visitor writes is ever rendered as HTML.
      text: `${parsed.message}\n\n— ${parsed.email ?? "no reply address"}, via maksym.page`,
    });
    if (error) {
      log({ event: "send_failed", name: error.name ?? null });
      return fail("error", 502);
    }
    log({ event: "sent" });
    return Response.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    log({ event: "send_error", error: err instanceof Error ? err.name : "unknown" });
    return fail("error", 502);
  }
}
