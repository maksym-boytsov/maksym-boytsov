import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { COLORS } from "@/lib/site";

export const alt = "Maksym Boytsov, Head of Engineering at ChainPatrol. A drawing made for every visitor, new each day.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// WOFF, because the image renderer can't read WOFF2.
const font = (weight: 300 | 500) =>
  readFile(
    join(process.cwd(), `node_modules/@fontsource/inter-tight/files/inter-tight-latin-${weight}-normal.woff`),
  ).then((data) => ({ name: "Inter Tight", data, weight, style: "normal" as const }));

export default async function Image() {
  const fonts = await Promise.all([font(300), font(500)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 72px",
          background: COLORS.paper,
          color: COLORS.ink,
          fontFamily: "Inter Tight",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: 3, color: COLORS.muted, textTransform: "uppercase" }}>
            Head of Engineering · ChainPatrol
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 22, fontSize: 150, fontWeight: 300, lineHeight: 0.86, letterSpacing: -8 }}>
            <span>Maksym</span>
            <span>Boytsov</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: `2px solid ${COLORS.ink}`, paddingTop: 22, fontSize: 30, fontWeight: 500, letterSpacing: -0.5 }}>
          <span>A drawing made for you, new every day.</span>
          <span style={{ color: COLORS.forest }}>maksym.page</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
