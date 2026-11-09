/** Limits and model settings for the message form. Shared by the API routes and the form. */
/** Rewording a short message is light work: Sonnet is plenty, at about half Opus's price. */
export const INTRO_MODEL = "claude-sonnet-5-5";
export const MAX_OUTPUT_TOKENS = 500;

/** The message box. The reworded message is cut to the same length, so it always fits back in. */
export const MIN_MESSAGE_CHARS = 2;
export const MAX_MESSAGE_CHARS = 500;
/** Wording help needs a little more to work with than a bare "hi". */
export const MIN_WORDING_CHARS = 10;
export const MAX_EMAIL_CHARS = 254;
export const MAX_BODY_BYTES = 4 * 1024;

export const DEFAULT_DAILY_BUDGET_USD = 3;
