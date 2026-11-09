"use client";

import { useEffect, useRef, useState } from "react";
import type { Stroke } from "@/lib/art/families";
import { familyFor, generate } from "@/lib/art/generate";
import { orderedStrokes, paintPaper, paintStrokes } from "@/lib/art/paint";
import { edition, makeSeed, parseSeed } from "@/lib/art/seed";

const W = 1040;
const H = 1300;
const DRAW_MS = 2600;
const DOWNLOAD_W = 2400;

function mySeed(): string {
  const day = new Date().toLocaleDateString("en-CA"); // the visitor's local date, YYYY-MM-DD
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const browser = [navigator.userAgent, navigator.language, screen.width, screen.height, devicePixelRatio].join("|");
  return makeSeed(day, timeZone, browser);
}

/**
 * A drawing generated for each visitor, different every day. It's seeded by the
 * date, time zone and an anonymous browser hash, drawn in the browser (no
 * server, no AI, nothing stored), and shareable: the link carries the seed.
 */
export function MadeForYou() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** The strokes on screen, kept so the download is the same piece without generating it again. */
  const strokesRef = useRef<Stroke[]>([]);
  const [copied, setCopied] = useState(false);
  // Picked after mount: it depends on the visitor's browser. `own` is this visitor's seed for today.
  const [state, setState] = useState<{ seed: string; own: string } | null>(null);
  const seed = state?.seed ?? null;
  const info = state && {
    seed: state.seed,
    mine: state.seed === state.own,
    edition: edition(state.seed),
    family: familyFor(state.seed),
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const own = mySeed();
      const shared = new URLSearchParams(window.location.search).get("art");
      setState({ seed: shared && parseSeed(shared) ? shared : own, own });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!seed || !canvas || !ctx) return;
    const strokes = orderedStrokes(generate(seed, W, H));
    strokesRef.current = strokes;
    paintPaper(ctx, W, H, seed);
    delete canvas.dataset.ready;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paintStrokes(ctx, strokes);
      canvas.dataset.ready = "";
      return;
    }
    const start = performance.now();
    let drawn = 0;
    let raf = 0;
    const tick = (now: number) => {
      // rAF timestamps can be a little earlier than `start`, so clamp to 0..1.
      const k = Math.min(1, Math.max(0, (now - start) / DRAW_MS));
      const target = Math.min(strokes.length, Math.max(drawn, Math.floor((1 - Math.pow(1 - k, 2.2)) * strokes.length)));
      paintStrokes(ctx, strokes, drawn, target);
      drawn = target;
      if (drawn < strokes.length) raf = requestAnimationFrame(tick);
      else canvas.dataset.ready = "";
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seed]);

  /** Downloads the exact piece on screen, redrawn at 2400×3000, with no watermark. */
  function download() {
    if (!info) return;
    const scale = DOWNLOAD_W / W;
    const c = document.createElement("canvas");
    c.width = DOWNLOAD_W;
    c.height = Math.round(H * scale);
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    paintPaper(ctx, W, H, info.seed);
    paintStrokes(ctx, strokesRef.current);
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${info.family.key}-${info.edition}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    }, "image/png");
  }

  async function copyLink() {
    if (!info) return;
    const url = `${window.location.origin}/?art=${encodeURIComponent(info.seed)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", url);
    }
  }

  function backToMine() {
    window.history.replaceState(null, "", window.location.pathname);
    setState((s) => s && { seed: s.own, own: s.own });
  }

  const label = info
    ? `A drawing generated ${info.mine ? "for you today" : "for someone else, shared with you"}: ${info.family.name}, number ${info.edition}`
    : "A drawing generated for you today";

  return (
    <figure className="art">
      <div className="art-frame">
        <canvas ref={canvasRef} width={W} height={H} role="img" aria-label={label} data-testid="art" />
      </div>
      <figcaption>
        <p className="art-cap" data-testid="art-caption">
          {info ? (
            <>
              No. {info.edition} · <b>{info.family.name}</b> ·{" "}
              <span className="art-note">{info.mine ? "Made for you today" : "Shared with you"}</span>
            </>
          ) : (
            <span className="art-note">Made for you today</span>
          )}
        </p>
        <p className="art-actions">
          {info && !info.mine && (
            <button type="button" onClick={backToMine}>
              Draw mine
            </button>
          )}
          <button type="button" onClick={download} disabled={!info}>
            Download <span aria-hidden="true">↓</span>
          </button>
          <button type="button" onClick={copyLink} disabled={!info}>
            {copied ? "Link copied" : "Copy link"}
          </button>
        </p>
      </figcaption>
    </figure>
  );
}
