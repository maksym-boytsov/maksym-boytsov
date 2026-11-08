"use client";

import { useEffect, useRef, useState } from "react";
import { generate } from "@/lib/art/generate";
import { orderedStrokes, paintPaper, paintStrokes } from "@/lib/art/paint";
import { edition, makeSeed, parseSeed } from "@/lib/art/seed";

const W = 1040;
const H = 1300;
const DRAW_MS = 2600;
const DOWNLOAD_W = 2400;

interface Info {
  seed: string;
  mine: boolean;
  edition: string;
  family: string;
}

function mySeed(): string {
  const day = new Date().toLocaleDateString("en-CA"); // the visitor's local date, YYYY-MM-DD
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const browser = [navigator.userAgent, navigator.language, screen.width, screen.height, devicePixelRatio].join("|");
  return makeSeed(day, timeZone, browser);
}

function infoFor(seed: string, mine: boolean, family: string): Info {
  return { seed, mine, family, edition: edition(seed) };
}

/**
 * A drawing generated for each visitor, different every day. It's seeded by the
 * date, time zone and an anonymous browser hash, drawn in the browser (no
 * server, no AI, nothing stored), and shareable: the link carries the seed.
 */
export function MadeForYou() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState<string | null>(null);

  // Pick the seed after mount: it depends on the visitor's browser.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const shared = new URLSearchParams(window.location.search).get("art");
      setSeed(parseSeed(shared) ? shared : mySeed());
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!seed || !canvas || !ctx) return;
    const art = generate(seed, W, H);
    const strokes = orderedStrokes(art);
    const mine = seed === mySeed();
    paintPaper(ctx, W, H, seed);
    delete canvas.dataset.ready;

    let raf = requestAnimationFrame(() => setInfo(infoFor(seed, mine, art.family.name)));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paintStrokes(ctx, strokes);
      canvas.dataset.ready = "";
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    let drawn = 0;
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
    paintStrokes(ctx, orderedStrokes(generate(info.seed, W, H)));
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `maksym-page-no-${info.edition}.png`;
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
    setSeed(mySeed());
  }

  const label = info
    ? `A drawing generated ${info.mine ? "for you today" : "for someone else, shared with you"}: ${info.family}, number ${info.edition}`
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
              No. {info.edition} · <b>{info.family}</b> ·{" "}
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
