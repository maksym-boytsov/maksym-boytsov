import { FAMILIES, INSET, type Family, type Stroke } from "./families";
import { rngFor } from "./random";

export interface Artwork {
  family: Family;
  strokes: Stroke[];
  /** How many times the quality check re-rolled before accepting. */
  attempt: number;
  ink: number;
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

export const familyFor = (seed: string): Family => FAMILIES[Math.floor(rngFor(`${seed}:family`)() * FAMILIES.length)];

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
    last = { family: fam, strokes, attempt, ink };
    if (ink >= fam.ink[0] && ink <= fam.ink[1]) return last;
  }
  return last!;
}
