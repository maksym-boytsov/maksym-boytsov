import { expect, test } from "@playwright/test";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the whole page is readable", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Maksym Boytsov" })).toBeVisible();
    await expect(page.getByText("I wanted this page to give you something, not just tell you about me.")).toBeVisible();
    await expect(page.getByText("Head of Engineering · Warsaw")).toBeVisible();
    await expect(page.getByText("Gym three times a week, plus the occasional cardio")).toBeVisible();
  });
});

test("security headers are set and the CSP doesn't break the page", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));
  page.on("pageerror", (err) => errors.push(err.message));
  const res = await page.goto("/");
  const h = res!.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("default-src 'self'");
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
  await expect(page.getByTestId("art")).toHaveAttribute("data-ready", "", { timeout: 8000 });
  // Vercel serves the analytics script only on its own platform, so it 404s on a local server.
  const unexpected = errors.filter((e) => !e.includes("_vercel/insights") && !e.includes("status of 404"));
  expect(unexpected).toEqual([]);
  expect(errors.filter((e) => /Content Security Policy/i.test(e))).toEqual([]);
});

test("the name is the header; the drawing is the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header").getByRole("heading", { level: 1, name: "Maksym Boytsov" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByTestId("art")).toBeVisible();
  // The drawing fits on the first screen, caption included.
  const bottom = await page.getByTestId("art-caption").evaluate((el) => el.getBoundingClientRect().bottom);
  expect(bottom).toBeLessThanOrEqual(await page.evaluate(() => window.innerHeight));
});

test.describe("made for you", () => {
  test("draws a piece for the visitor, with an edition caption", async ({ page }) => {
    await page.goto("/");
    const art = page.getByTestId("art");
    await expect(art).toHaveAttribute("data-ready", "", { timeout: 8000 });
    await expect(page.getByTestId("art-caption")).toHaveText(/^No\. \d{4} · (Currents|Eddies|Contours|Rings|Frames|Mesh|Harmonograph|Spirograph) · Made for you today$/);
    // Something was actually drawn: the canvas isn't a single flat colour.
    const distinct = await art.evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      const seen = new Set<number>();
      for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]);
      return seen.size;
    });
    expect(distinct).toBeGreaterThan(20);
  });

  test("the same browser gets the same piece on reload", async ({ page }) => {
    await page.goto("/");
    const caption = page.getByTestId("art-caption");
    await expect(caption).toHaveText(/^No\./);
    const first = await caption.textContent();
    await page.reload();
    await expect(caption).toHaveText(first!);
  });

  test("a shared link shows exactly that piece, with a way back to your own", async ({ page }) => {
    const seed = "2026-11-08|Europe/Lisbon|1a2b3c";
    await page.goto(`/?art=${encodeURIComponent(seed)}`);
    const caption = page.getByTestId("art-caption");
    await expect(caption).toHaveText(/^No\. \d{4}/);
    await expect(page.getByRole("button", { name: "Draw mine" })).toBeVisible();
    await expect(caption).toContainText("Shared with you");
    const shared = await caption.textContent();
    await page.reload();
    await expect(caption).toHaveText(shared!);
    await page.getByRole("button", { name: "Draw mine" }).click();
    await expect(page.getByRole("button", { name: "Draw mine" })).toHaveCount(0);
    await expect(caption).toContainText("Made for you today");
    expect(new URL(page.url()).search).toBe("");
  });

  test("a tampered link is ignored", async ({ page }) => {
    await page.goto("/?art=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
    await expect(page.getByTestId("art-caption")).toHaveText(/^No\. \d{4}/);
    await expect(page.getByRole("button", { name: "Draw mine" })).toHaveCount(0);
  });

  test("downloads the exact piece on screen, at high resolution", async ({ page }) => {
    await page.goto("/");
    const caption = page.getByTestId("art-caption");
    await expect(caption).toHaveText(/^No\./);
    await expect(page.getByTestId("art")).toHaveAttribute("data-ready", "", { timeout: 8000 });
    const no = (await caption.textContent())!.match(/No\. (\d{4})/)![1];
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: /Download/ }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(`maksym-page-no-${no}.png`);
    // The download is drawn from the same seed and strokes as the screen, just scaled.
    // Check it's full-size and actually has a drawing in it.
    const path = await file.path();
    const { readFileSync } = await import("node:fs");
    const dataUrl = `data:image/png;base64,${readFileSync(path).toString("base64")}`;
    const result = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, img.width, img.height).data;
      let dark = 0;
      for (let i = 0; i < d.length; i += 4 * 7) if (d[i] < 150) dark++;
      return { w: img.width, h: img.height, dark };
    }, dataUrl);
    expect(result.w).toBe(2400);
    expect(result.h).toBe(3000);
    expect(result.dark).toBeGreaterThan(200);
  });
});

test("the page never scrolls sideways", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("old URLs and unknown pages are a 404", async ({ page }) => {
  for (const path of ["/principles", "/no-such-page"]) {
    const res = await page.goto(path);
    expect(res!.status(), path).toBe(404);
    await expect(page.getByRole("heading", { name: "Nothing here." })).toBeVisible();
  }
});
