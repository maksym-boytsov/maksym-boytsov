import { z } from "zod";
import { MAX_ABOUT_CHARS, MIN_ABOUT_CHARS } from "./config";

const requestSchema = z.object({ about: z.string() }).strict();

export type ParseResult = { ok: true; about: string } | { ok: false };

/** Validates the request body: `{ about }`, 10–500 characters after trimming, nothing else. */
export function parseIntroRequest(input: unknown): ParseResult {
  const result = requestSchema.safeParse(input);
  if (!result.success) return { ok: false };
  const about = result.data.about.trim();
  if (about.length < MIN_ABOUT_CHARS || about.length > MAX_ABOUT_CHARS) return { ok: false };
  return { ok: true, about };
}

const messageSchema = z
  .object({
    email: z.string().optional(),
    message: z.string(),
    /** Hidden field people never see; bots tend to fill it in. */
    website: z.string().optional(),
  })
  .strict();

export type MessageParse =
  | { ok: true; email: string | null; message: string; bot: boolean }
  | { ok: false };

/**
 * Validates a message to send: 2–500 characters of text, and optionally an email
 * to reply to. If an email is given it must look real (≤254 characters).
 */
export function parseMessageRequest(input: unknown): MessageParse {
  const result = messageSchema.safeParse(input);
  if (!result.success) return { ok: false };
  const email = (result.data.email ?? "").trim() || null;
  const message = result.data.message.trim();
  if (email !== null && (email.length > 254 || !z.email().safeParse(email).success)) return { ok: false };
  if (message.length < 2 || message.length > MAX_ABOUT_CHARS) return { ok: false };
  return { ok: true, email, message, bot: Boolean(result.data.website) };
}
