import { FAMILIES, INSET, type Family, type Stroke } from "./families";
import { rngFor } from "./random";
import { parseSeed } from "./seed";

export interface Artwork {
  family: Family;
  strokes: Stroke[];
  /** How many times the quality check re-rolled before accepting. */
  attempt: number;
}

/** Total stroke length per unit area, scale-independent. */
export function inkPerArea(strokes: readonly Stroke[], W: number, H: number): number {
  const u = Math.min(W, H);
  let len = 0;
  for (const s of strokes) {
    for (let i = 1; i < s.pts.length; i++) {
      len += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]);
    }
  }
  return len / u / ((W / u) * (H / u)) / 10;
}

const MAX_ATTEMPTS = 6;

const DAY_MS = 24 * 60 * 60 * 1000;
/** 1970-01-05, the first Monday after the epoch, in days. Weeks run Monday to Sunday. */
const FIRST_MONDAY = 4;

/** The visitor's own shuffled order of the seven styles for one week. */
function weekOrder(visitor: string, week: number): Family[] {
  const rng = rngFor(`${visitor}:week:${week}`);
  const order = [...FAMILIES];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * The style for a seed. Seven styles, seven days: each week (Monday to Sunday)
 * a visitor sees every style once, in their own shuffled order, and never the
 * same style two days running, even from Sunday to Monday. Seeds that aren't a
 * visitor's (date|zone|hash) just pick one at random.
 */
export function familyFor(seed: string): Family {
  const parts = parseSeed(seed);
  if (!parts) return FAMILIES[Math.floor(rngFor(`${seed}:family`)() * FAMILIES.length)];
  const day = Math.floor(Date.parse(`${parts.day}T00:00:00Z`) / DAY_MS) - FIRST_MONDAY;
  const week = Math.floor(day / 7);
  const visitor = `${parts.timeZone}|${parts.hash}`;
  const order = weekOrder(visitor, week);
  // Monday shouldn't repeat last Sunday's style.
  if (order[0] === weekOrder(visitor, week - 1)[6]) [order[0], order[1]] = [order[1], order[0]];
  return order[day - week * 7];
}

/**
 * Deterministic: the same seed and size always give the same artwork. The seed
 * picks the family; a quality check re-rolls compositions that are too sparse or
 * too dense, always within that same family.
 */
export function generate(seed: string, W: number, H: number, family?: Family): Artwork {
  const u = Math.min(W, H);
  // The family comes from the seed alone, so a re-roll (or a different size) never changes the style.
  const fam = family ?? familyFor(seed);
  let last: Artwork | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const rng = rngFor(`${seed}#${attempt}`);
    const strokes = fam.make(rng, W, H, u, INSET * u);
    const ink = inkPerArea(strokes, W, H);
    last = { family: fam, strokes, attempt };
    if (ink >= fam.ink[0] && ink <= fam.ink[1]) return last;
  }
  return last!;
}
