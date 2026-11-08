import { createNoise2D, createNoise3D } from "simplex-noise";
import type { Rng } from "./random";

export type Point = [number, number];

export interface Stroke {
  pts: Point[];
  /** Line width in pixels. */
  w: number;
  accent: boolean;
  /** Opacity, 0..1. */
  a: number;
}

export interface Family {
  key: string;
  name: string;
  /**
   * Accepted ink density (stroke length per area, see inkPerArea). Each range is
   * the family's measured 5th–95th percentile over 40 seeds; results outside it
   * are re-rolled so no visitor gets an empty or overcrowded piece.
   */
  ink: [number, number];
  make(rng: Rng, W: number, H: number, u: number, m: number): Stroke[];
}

/** Space between the drawing and the paper's edge, as a share of the short side. */
export const INSET = 0.05;

const TAU = Math.PI * 2;
const stroke = (pts: Point[], w: number, accent = false, a = 0.85): Stroke => ({ pts, w, accent, a });

/**
 * Splits one long line into consecutive pieces (sharing their end points), so a
 * single continuous line still draws itself gradually on screen.
 */
function chunked(pts: Point[], w: number, accent: boolean, a: number, size = 240): Stroke[] {
  const out: Stroke[] = [];
  for (let i = 0; i < pts.length - 1; i += size) out.push(stroke(pts.slice(i, i + size + 1), w, accent, a));
  return out;
}

interface StreamlineOptions {
  rng: Rng;
  W: number;
  H: number;
  m: number;
  angle: (x: number, y: number) => number;
  sep: number;
  step: number;
  maxSteps: number;
  minSteps: number;
  attempts: number;
  width: number;
  accent: number;
}

/** Evenly spaced streamlines through an angle field (a simplified Jobard–Lefer). */
function streamlines(o: StreamlineOptions): Stroke[] {
  const { rng, W, H, m, angle, sep, step } = o;
  const cols = Math.ceil(W / sep);
  const rows = Math.ceil(H / sep);
  const grid: Point[][] = Array.from({ length: cols * rows }, () => []);
  const inside = (x: number, y: number) => x > m && x < W - m && y > m && y < H - m;
  const free = (x: number, y: number, d: number) => {
    const cx = Math.floor(x / sep);
    const cy = Math.floor(y / sep);
    for (let j = cy - 1; j <= cy + 1; j++) {
      for (let i = cx - 1; i <= cx + 1; i++) {
        if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
        for (const p of grid[j * cols + i]) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < d * d) return false;
      }
    }
    return true;
  };
  const trace = (x: number, y: number, dir: number) => {
    const pts: Point[] = [];
    for (let s = 0; s < o.maxSteps; s++) {
      const a = angle(x, y);
      x += Math.cos(a) * step * dir;
      y += Math.sin(a) * step * dir;
      if (!inside(x, y) || !free(x, y, sep * 0.75)) break;
      pts.push([x, y]);
    }
    return pts;
  };
  const out: Stroke[] = [];
  for (let n = 0; n < o.attempts; n++) {
    const x = m + rng() * (W - 2 * m);
    const y = m + rng() * (H - 2 * m);
    if (!free(x, y, sep)) continue;
    const pts: Point[] = [...trace(x, y, -1).reverse(), [x, y], ...trace(x, y, 1)];
    if (pts.length < o.minSteps) continue;
    for (const p of pts) grid[Math.floor(p[1] / sep) * cols + Math.floor(p[0] / sep)]?.push(p);
    out.push(stroke(pts, o.width, rng() < o.accent));
  }
  return out;
}

/** A closed ring of `count` points around (cx, cy), radius set per angle. */
function loop(cx: number, cy: number, count: number, radius: (c: number, s: number) => [number, number]): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= count; i++) {
    const t = (i / count) * TAU;
    const [rx, ry] = radius(Math.cos(t), Math.sin(t));
    pts.push([cx + Math.cos(t) * rx, cy + Math.sin(t) * ry]);
  }
  return pts;
}

export const FAMILIES: readonly Family[] = [
  {
    key: "currents",
    name: "Currents",
    ink: [3.75, 4.1],
    make(rng, W, H, u, m) {
      const n = createNoise2D(rng);
      const f = 0.9 + rng() * 0.8;
      const turn = 1.2 + rng() * 1.2;
      const base = rng() * TAU;
      return streamlines({
        rng, W, H, m,
        angle: (x, y) => base + n((x / u) * f, (y / u) * f) * turn,
        sep: 0.016 * u, step: 0.004 * u, maxSteps: 900, minSteps: 30, attempts: 2600,
        width: 0.0016 * u, accent: 0.02,
      });
    },
  },
  {
    key: "eddies",
    name: "Eddies",
    ink: [4.41, 6.25],
    make(rng, W, H, u, m) {
      const vortices = Array.from({ length: 3 + Math.floor(rng() * 4) }, () => ({
        x: m + rng() * (W - 2 * m),
        y: m + rng() * (H - 2 * m),
        s: (rng() < 0.5 ? -1 : 1) * (0.6 + rng()),
      }));
      const drift = rng() * TAU;
      const angle = (x: number, y: number) => {
        let vx = Math.cos(drift) * 0.35;
        let vy = Math.sin(drift) * 0.35;
        for (const v of vortices) {
          const dx = (x - v.x) / u;
          const dy = (y - v.y) / u;
          const r2 = dx * dx + dy * dy + 0.004;
          vx += ((v.s * -dy) / r2) * 0.22;
          vy += ((v.s * dx) / r2) * 0.22;
        }
        return Math.atan2(vy, vx);
      };
      return streamlines({
        rng, W, H, m, angle,
        sep: 0.015 * u, step: 0.0035 * u, maxSteps: 1400, minSteps: 30, attempts: 3000,
        width: 0.0015 * u, accent: 0.02,
      });
    },
  },
  {
    key: "contours",
    name: "Contours",
    ink: [2.96, 5.68],
    make(rng, W, H, u, m) {
      const n = createNoise2D(rng);
      const f = 1.1 + rng() * 0.9;
      const res = 0.006 * u;
      const cols = Math.floor((W - 2 * m) / res);
      const rows = Math.floor((H - 2 * m) / res);
      const v = new Float32Array((cols + 1) * (rows + 1));
      for (let j = 0; j <= rows; j++) {
        for (let i = 0; i <= cols; i++) {
          const x = (m + i * res) / u;
          const y = (m + j * res) / u;
          v[j * (cols + 1) + i] = n(x * f, y * f) * 0.75 + n(x * f * 2.3, y * f * 2.3) * 0.25;
        }
      }
      const levels = 26;
      const highlight = Math.floor(rng() * levels);
      const out: Stroke[] = [];
      for (let l = 0; l < levels; l++) {
        const t = -1 + (2 * (l + 0.5)) / levels;
        const hi = l === highlight;
        const w = (l % 5 === 0 ? 0.0024 : 0.0012) * u;
        // Marching squares: one or two segments per cell where the level crosses it.
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const a = v[j * (cols + 1) + i];
            const b = v[j * (cols + 1) + i + 1];
            const c = v[(j + 1) * (cols + 1) + i + 1];
            const d = v[(j + 1) * (cols + 1) + i];
            const P: Point[] = [];
            const edge = (p: number, q: number, x1: number, y1: number, x2: number, y2: number) => {
              if (p < t !== q < t) {
                const k = (t - p) / (q - p);
                P.push([m + (x1 + (x2 - x1) * k) * res, m + (y1 + (y2 - y1) * k) * res]);
              }
            };
            edge(a, b, i, j, i + 1, j);
            edge(b, c, i + 1, j, i + 1, j + 1);
            edge(d, c, i, j + 1, i + 1, j + 1);
            edge(a, d, i, j, i, j + 1);
            if (P.length >= 2) out.push(stroke([P[0], P[1]], w, hi, hi ? 1 : 0.8));
            if (P.length === 4) out.push(stroke([P[2], P[3]], w, hi, hi ? 1 : 0.8));
          }
        }
      }
      return out;
    },
  },
  {
    key: "rings",
    name: "Rings",
    ink: [4.02, 5.41],
    make(rng, W, H, u, m) {
      const n = createNoise3D(rng);
      const cx = W / 2 + (rng() - 0.5) * 0.04 * W;
      const cy = H / 2 + (rng() - 0.5) * 0.04 * H;
      const count = 40 + Math.floor(rng() * 16);
      const amp = 0.1 + rng() * 0.1;
      // Sized to the sheet: the outermost ring, at its widest, stays inside the inset.
      const maxR = (Math.min(W, H) / 2 - m - 0.02 * Math.max(W, H)) / (1 + amp);
      const highlight = 3 + Math.floor(rng() * (count - 6));
      const out: Stroke[] = [];
      for (let k = 1; k <= count; k++) {
        const r = (k / count) * maxR;
        const pts = loop(cx, cy, 260, (c, s) => {
          const rr = r * (1 + amp * n(c * 1.1, s * 1.1, k * 0.045));
          return [rr, rr];
        });
        out.push(stroke(pts, 0.0016 * u, k === highlight));
      }
      return out;
    },
  },
  {
    key: "frames",
    name: "Frames",
    ink: [4.34, 5.49],
    make(rng, W, H, u, m) {
      const n = createNoise3D(rng);
      const count = 30 + Math.floor(rng() * 10);
      const amp = 0.05 + rng() * 0.05;
      const a0 = (W / 2 - m) / (1 + amp);
      const b0 = (H / 2 - m) / (1 + amp);
      const p = 4 + rng() * 3;
      const highlight = 3 + Math.floor(rng() * (count - 6));
      const out: Stroke[] = [];
      for (let k = 1; k <= count; k++) {
        const s = k / count;
        const pts = loop(W / 2, H / 2, 320, (c, si) => {
          // A superellipse: a square with rounded corners, then bent by noise.
          const rr = Math.pow(Math.pow(Math.abs(c), p) + Math.pow(Math.abs(si), p), -1 / p);
          const wob = 1 + amp * n(c * 1.2, si * 1.2, k * 0.05);
          return [rr * a0 * s * wob, rr * b0 * s * wob];
        });
        out.push(stroke(pts, 0.0015 * u, k === highlight));
      }
      return out;
    },
  },
  {
    key: "mesh",
    name: "Mesh",
    ink: [4.95, 5.04],
    make(rng, W, H, u, m) {
      const n = createNoise2D(rng);
      const f = 0.9 + rng() * 0.8;
      const amp = (0.035 + rng() * 0.03) * u;
      const cols = 26;
      const rows = Math.round((cols * (H - 2 * m)) / (W - 2 * m));
      // Displacement fades out towards the border so the outer frame stays inside the inset.
      const at = (i: number, j: number): Point => {
        const x = m + (i / cols) * (W - 2 * m);
        const y = m + (j / rows) * (H - 2 * m);
        const k = Math.min(1, Math.min(i, cols - i, j, rows - j) / 4);
        return [x + n((x / u) * f, (y / u) * f) * amp * k, y + n((x / u) * f + 7, (y / u) * f + 7) * amp * k];
      };
      const highlight = Math.floor(rng() * rows);
      const out: Stroke[] = [];
      for (let j = 0; j <= rows; j++) {
        const pts: Point[] = [];
        for (let i = 0; i <= cols * 4; i++) pts.push(at(i / 4, j));
        out.push(stroke(pts, 0.0014 * u, j === highlight));
      }
      for (let i = 0; i <= cols; i++) {
        const pts: Point[] = [];
        for (let j = 0; j <= rows * 4; j++) pts.push(at(i, j / 4));
        out.push(stroke(pts, 0.0014 * u));
      }
      return out;
    },
  },
  {
    key: "harmonograph",
    name: "Harmonograph",
    ink: [18.2, 50.81],
    make(rng, W, H, u, m) {
      // Two decaying pendulums per axis, at near-simple frequency ratios.
      const ratios = [[2, 3], [3, 4], [1, 2], [3, 2], [2, 1], [4, 3]];
      const [a, b] = ratios[Math.floor(rng() * ratios.length)];
      const p = Array.from({ length: 4 }, () => rng() * TAU);
      const d = 0.0016 + rng() * 0.0016;
      const detune = (rng() - 0.5) * 0.02;
      const pts: Point[] = [];
      for (let t = 0; t < 1400; t += 0.04) {
        const decay = Math.exp(-d * t);
        const x = ((Math.sin(a * t + p[0]) + Math.sin((b + detune) * t + p[1]) * 0.6) * decay) / 1.6;
        const y = ((Math.sin(b * t + p[2]) + Math.sin((a - detune) * t + p[3]) * 0.6) * decay) / 1.6;
        pts.push([W / 2 + x * (W / 2 - m), H / 2 + y * (H / 2 - m)]);
      }
      return chunked(pts, 0.0011 * u, false, 0.55);
    },
  },
  {
    key: "spirograph",
    name: "Spirograph",
    ink: [9.72, 18.98],
    make(rng, W, H, u, m) {
      const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
      const pairs = [[13, 5], [11, 4], [17, 7], [19, 8], [15, 4], [16, 7], [21, 8]];
      const [R, r] = pairs[Math.floor(rng() * pairs.length)];
      const d0 = r * (0.6 + rng() * 0.6);
      const turns = r / gcd(R, r);
      const rot = rng() * TAU;
      // Several close passes with a slowly growing pen offset give the figure body.
      const passes = 14;
      const scale = (Math.min(W, H) / 2 - m) / (R - r + d0 * 1.35);
      const highlight = Math.floor(rng() * passes);
      const out: Stroke[] = [];
      for (let k = 0; k < passes; k++) {
        const d = d0 * (1 + k * 0.025);
        const pts: Point[] = [];
        for (let t = 0; t <= turns * TAU + 0.001; t += 0.004) {
          const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
          const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
          pts.push([
            W / 2 + (x * Math.cos(rot) - y * Math.sin(rot)) * scale,
            H / 2 + (x * Math.sin(rot) + y * Math.cos(rot)) * scale,
          ]);
        }
        out.push(...chunked(pts, 0.0011 * u, k === highlight, 0.7));
      }
      return out;
    },
  },
];
