import type { Artwork } from "./generate";
import { rngFor } from "./random";

export const PAPER = "#f1eee7";
const INK = "18,18,18";
const FOREST = "31,81,53";

/** Paper colour plus a faint, seeded grain. */
export function paintPaper(ctx: CanvasRenderingContext2D, W: number, H: number, seed: string) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const r = rngFor(`${seed}:grain`);
  const count = Math.floor((W * H) / 55);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = r() < 0.5 ? `rgba(${INK},${0.02 + r() * 0.03})` : `rgba(255,255,255,${0.08 + r() * 0.1})`;
    ctx.fillRect(r() * W, r() * H, 1, 1);
  }
}

/** Ink strokes first, green accents last so they sit on top. */
export function orderedStrokes(art: Artwork) {
  return [...art.strokes.filter((s) => !s.accent), ...art.strokes.filter((s) => s.accent)];
}

export function paintStrokes(ctx: CanvasRenderingContext2D, strokes: Artwork["strokes"], from = 0, to = strokes.length) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = from; i < to; i++) {
    const s = strokes[i];
    ctx.strokeStyle = `rgba(${s.accent ? FOREST : INK},${s.a})`;
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(s.pts[0][0], s.pts[0][1]);
    for (let j = 1; j < s.pts.length; j++) ctx.lineTo(s.pts[j][0], s.pts[j][1]);
    ctx.stroke();
  }
}
