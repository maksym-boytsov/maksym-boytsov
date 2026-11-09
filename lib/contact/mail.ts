import "server-only";
import { Resend } from "resend";
import { EMAIL } from "@/lib/site";

/**
 * Email delivery through Resend. Messages from the site go to Maksym's inbox,
 * with the visitor's address as reply-to, so replying in Gmail goes to them.
 */
let client: Resend | null = null;

/** The Resend client, or null when RESEND_API_KEY isn't set (the site then falls back to a mailto link). */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

/** Who the email comes from: maksym.page is verified in Resend. Override with RESEND_FROM if needed. */
export const mailFrom = () => process.env.RESEND_FROM || "maksym.page <hello@maksym.page>";

/** Where messages land. */
export const mailTo = () => process.env.MESSAGE_TO || EMAIL;
