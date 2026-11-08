import { describe, expect, it } from "vitest";
import { FAMILIES, INSET } from "@/lib/art/families";
import { generate } from "@/lib/art/generate";
import { rngFor } from "@/lib/art/random";
import { edition, makeSeed, parseSeed } from "@/lib/art/seed";

const W = 400;
const H = 500;

describe("seeded randomness", () => {
  it("is deterministic per seed and differs between seeds", () => {
    const a = rngFor("x");
    const b = rngFor("x");
    const c = rngFor("y");
    const seqA = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(seqA);
    expect([c(), c(), c()]).not.toEqual(seqA);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("generate", () => {
  it("gives the exact same artwork for the same seed", () => {
    const seed = makeSeed("2026-11-08", "Europe/Warsaw", "browser");
    expect(generate(seed, W, H)).toEqual(generate(seed, W, H));
  });

  it("gives different visitors and different days different pieces", () => {
    const a = generate(makeSeed("2026-11-08", "Europe/Warsaw", "browser-a"), W, H);
    const b = generate(makeSeed("2026-11-08", "Europe/Warsaw", "browser-b"), W, H);
    const c = generate(makeSeed("2026-11-09", "Europe/Warsaw", "browser-a"), W, H);
    expect(a.strokes).not.toEqual(b.strokes);
    expect(a.strokes).not.toEqual(c.strokes);
  });

  it.each(FAMILIES.map((f) => [f.name, f] as const))("%s stays inside the print margin and passes its quality check", (_name, fam) => {
    let rerolled = 0;
    for (let i = 0; i < 12; i++) {
      const art = generate(`check-${fam.key}-${i}`, W, H, fam);
      if (art.attempt > 0) rerolled++;
      expect(art.strokes.length).toBeGreaterThan(0);
      // Everything stays inside the 5% inset (a hair of tolerance for line width).
      const m = (INSET - 0.005) * Math.min(W, H);
      let outside = 0;
      for (const s of art.strokes) for (const [x, y] of s.pts) if (x <= m || x >= W - m || y <= m || y >= H - m) outside++;
      expect(outside).toBe(0);
    }
    // The quality check should only catch outliers, not most results.
    expect(rerolled).toBeLessThanOrEqual(6);
  });

  it("keeps the same family at every size, even when the quality check re-rolls", () => {
    for (let i = 0; i < 40; i++) {
      const seed = `size-${i}`;
      const names = [[1040, 1300], [1179, 2556], [2560, 1600], [400, 500]].map(([w, h]) => generate(seed, w, h).family.key);
      expect(new Set(names).size).toBe(1);
    }
  });

  it("spreads seeds across all eight families", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 80; i++) seen.add(generate(`spread-${i}`, 120, 150).family.key);
    expect(seen.size).toBe(FAMILIES.length);
    expect(FAMILIES.map((f) => f.key)).toEqual(["currents", "eddies", "contours", "rings", "frames", "mesh", "harmonograph", "spirograph"]);
  });
});

describe("seeds", () => {
  it("round-trips and rejects anything that isn't a seed", () => {
    const seed = makeSeed("2026-11-08", "America/New_York", "ua");
    expect(parseSeed(seed)).toEqual({ day: "2026-11-08", timeZone: "America/New_York", hash: expect.any(String) });
    for (const bad of [null, "", "hello", "2026-11-08|<script>|ab", "2026-11-08|Europe/Warsaw|xyz", `${seed}|extra`]) {
      expect(parseSeed(bad)).toBeNull();
    }
  });

  it("formats the caption parts", () => {
    expect(edition("anything")).toMatch(/^\d{4}$/);
  });
});
