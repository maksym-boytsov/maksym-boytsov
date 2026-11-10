import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { FAMILIES } from "@/lib/art/families";
import { generate } from "@/lib/art/generate";
import { strokesToSvg } from "@/lib/art/svg";
import { COLORS } from "@/lib/site";

export const SHARE_SIZE = { width: 1200, height: 630 };

/** The style and seed of the drawing in the share image. */
export const SHARE_STYLE = "harmonograph";
const SHARE_SEED = "maksym.page|share";

const ART_W = 1040;
const ART_H = 1300;

// WOFF, because the image renderer can't read WOFF2.
const font = (weight: 300 | 500) =>
  readFile(
    join(process.cwd(), `node_modules/@fontsource/inter-tight/files/inter-tight-latin-${weight}-normal.woff`),
  ).then((data) => ({ name: "Inter Tight", data, weight, style: "normal" as const }));

/** The drawing as an image the share-card renderer can place (it has no canvas). */
export function shareDrawing(style: string = SHARE_STYLE, seed: string = SHARE_SEED): string {
  const family = FAMILIES.find((f) => f.key === style) ?? FAMILIES[0];
  const svg = strokesToSvg(generate(seed, ART_W, ART_H, family).strokes, ART_W, ART_H);
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/** The link preview: name and line on the left, one of the site's drawings on the right. */
export async function shareImage(drawing: string = shareDrawing()): Promise<ImageResponse> {
  const fonts = await Promise.all([font(300), font(500)]);
  const artH = SHARE_SIZE.height - 2 * 48;
  const artW = Math.round((artH * ART_W) / ART_H);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "48px 64px 48px 72px",
          background: COLORS.paper,
          color: COLORS.ink,
          fontFamily: "Inter Tight",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", paddingTop: 14, paddingBottom: 6 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: 3, color: COLORS.muted, textTransform: "uppercase" }}>
              Head of Engineering · ChainPatrol
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 26, fontSize: 118, fontWeight: 300, lineHeight: 0.9, letterSpacing: -6 }}>
              <span>Maksym</span>
              <span>Boytsov</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 28, fontWeight: 500, letterSpacing: -0.4 }}>
            <span>A drawing made for you,</span>
            <span>new every day.</span>
            <span style={{ marginTop: 14, color: COLORS.forest }}>maksym.page</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to a PNG, not a page */}
        <img
          src={drawing}
          width={artW}
          height={artH}
          alt=""
          style={{ borderRadius: 4, boxShadow: "0 24px 48px -28px rgba(18,18,18,0.55)" }}
        />
      </div>
    ),
    { ...SHARE_SIZE, fonts },
  );
}
