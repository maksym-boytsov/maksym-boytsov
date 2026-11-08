import { cyrb128 } from "./random";

/**
 * A visitor's seed: today's date, their time zone, and an anonymous hash of
 * browser details. Nothing is stored or sent anywhere; the same browser gets
 * the same piece all day and a new one tomorrow.
 */
export interface SeedParts {
  day: string;
  timeZone: string;
  hash: string;
}

const SEED_RE = /^(\d{4}-\d{2}-\d{2})\|([A-Za-z0-9_+\-/]{1,64})\|([0-9a-f]{1,8})$/;

export function makeSeed(day: string, timeZone: string, browser: string): string {
  return `${day}|${timeZone}|${cyrb128(browser)[0].toString(16)}`;
}

/** Validates a seed from a shared link. Anything else is ignored. */
export function parseSeed(seed: string | null | undefined): SeedParts | null {
  const m = seed ? SEED_RE.exec(seed) : null;
  return m ? { day: m[1], timeZone: m[2], hash: m[3] } : null;
}

/** Edition number shown in the caption, 0001–9999. */
export const edition = (seed: string) => String((cyrb128(seed)[1] % 9999) + 1).padStart(4, "0");
