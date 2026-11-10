import { writeFile } from "node:fs/promises";
import { it } from "vitest";
import { FAMILIES } from "@/lib/art/families";
import { shareDrawing, shareImage } from "@/lib/share/image";

const OUT = process.env.OG_OUT!;
it.runIf(OUT)("renders share-image candidates", async () => {
  for (const f of FAMILIES) {
    const res = await shareImage(shareDrawing(f.key));
    await writeFile(`${OUT}/${f.key}.png`, Buffer.from(await res.arrayBuffer()));
  }
}, 120_000);
