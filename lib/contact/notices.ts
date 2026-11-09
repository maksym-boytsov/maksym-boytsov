import { EMAIL } from "@/lib/site";

/** Error codes the wording endpoint returns, and what the form says for each. */
export type IntroErrorCode =
  | "bad_request"
  | "forbidden"
  | "rate_limited"
  | "budget"
  | "unavailable"
  | "unclear"
  | "refusal"
  | "error";

const TRY_AGAIN = "Something went wrong. Try again in a bit.";

export const NOTICES: Record<IntroErrorCode, string> = {
  unclear: "I couldn't find a message to work with. Add who you are and why you'd like to talk.",
  refusal: "I can't help word that one, but you can still send it as it is.",
  rate_limited: "Give it a minute.",
  budget: "Wording help is resting for today. You can still send your message as it is.",
  unavailable: "Wording help isn't available right now. You can still send your message as it is.",
  bad_request: TRY_AGAIN,
  forbidden: TRY_AGAIN,
  error: TRY_AGAIN,
};

/** Error codes the send endpoint returns, and what the form says for each. */
export type MessageErrorCode = "bad_request" | "forbidden" | "rate_limited" | "unavailable" | "error";

const COULD_NOT_SEND = `Couldn't send right now. You can email me at ${EMAIL}.`;

export const SEND_NOTICES: Record<MessageErrorCode, string> = {
  bad_request: "Check your email address and message.",
  rate_limited: "You've sent a few already. Try again a little later.",
  forbidden: COULD_NOT_SEND,
  unavailable: COULD_NOT_SEND,
  error: COULD_NOT_SEND,
};

/** The error code in a failed response, if it's one of `notices`; otherwise a sensible fallback. */
export async function errorCodeOf<C extends string>(res: Response, notices: Record<C, string>): Promise<C | "error" | "rate_limited"> {
  try {
    const code = ((await res.json()) as { error?: unknown } | null)?.error;
    if (typeof code === "string" && Object.hasOwn(notices, code)) return code as C;
  } catch {
    // Not JSON: fall back on the status.
  }
  return res.status === 429 ? "rate_limited" : "error";
}
