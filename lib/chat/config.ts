/** Limits and model settings for the intro writer. Shared by the API route and the panel. */
/** Rewording a short message is light work: Sonnet is plenty, at about half Opus's price. */
export const INTRO_MODEL = "claude-sonnet-5-5";
export const MAX_OUTPUT_TOKENS = 500;

/** The visitor's message (or notes) in the box. */
export const MIN_ABOUT_CHARS = 10;
export const MAX_ABOUT_CHARS = 500;
/** The reworded message is cut to the same length as the box, so it always fits back in it. */
export const MAX_NOTE_CHARS = 500;
export const MAX_BODY_BYTES = 4 * 1024;

export const DEFAULT_DAILY_BUDGET_USD = 3;
