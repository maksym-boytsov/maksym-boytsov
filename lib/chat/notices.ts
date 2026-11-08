/** Error codes the intro endpoint returns, and what the panel says for each. */
export type IntroErrorCode =
  | "bad_request"
  | "forbidden"
  | "rate_limited"
  | "budget"
  | "unavailable"
  | "unclear"
  | "refusal"
  | "error";

export const NOTICES: Record<IntroErrorCode, string> = {
  unclear: "I couldn't find a message to work with. Add who you are and why you'd like to talk.",
  refusal: "I can't help word that one, but you can still send it as it is.",
  rate_limited: "Give it a minute.",
  budget: "Wording help is resting for today. You can still send your message as it is.",
  unavailable: "Wording help isn't available right now. You can still send your message as it is.",
  bad_request: "Something went wrong. Try again in a bit.",
  forbidden: "Something went wrong. Try again in a bit.",
  error: "Something went wrong. Try again in a bit.",
};

export const isIntroErrorCode = (v: unknown): v is IntroErrorCode => typeof v === "string" && v in NOTICES;
