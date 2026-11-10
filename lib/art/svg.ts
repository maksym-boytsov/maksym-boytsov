import { COLORS } from "@/lib/site";
import type { Stroke } from "./families";

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * The strokes as an SVG on paper, for places a canvas can't go (the share image).
 * Strokes that look alike share one path, which keeps the file small; ink goes
 * first and green accents last, as on screen.
 */
export function strokesToSvg(strokes: readonly Stroke[], W: number, H: number): string {
  const groups = new Map<string, string[]>();
  for (const s of [...strokes.filter((s) => !s.accent), ...strokes.filter((s) => s.accent)]) {
    const key = `${s.accent ? COLORS.forest : COLORS.ink}|${r1(s.w)}|${r1(s.a)}`;
    const d = `M${s.pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join("L")}`;
    const list = groups.get(key);
    if (list) list.push(d);
    else groups.set(key, [d]);
  }
  const paths = [...groups].map(([key, ds]) => {
    const [color, w, a] = key.split("|");
    return `<path d="${ds.join("")}" stroke="${color}" stroke-width="${w}" stroke-opacity="${a}"/>`;
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">` +
    `<rect width="${W}" height="${H}" fill="${COLORS.paper}"/>` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${paths.join("")}</g></svg>`
  );
}
