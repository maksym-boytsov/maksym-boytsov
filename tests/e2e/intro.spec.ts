import { expect, test } from "@playwright/test";

// Tests decide for themselves whether Send is available (a real RESEND_API_KEY in .env.local
// must not change them), and no test may ever reach the real send endpoint.
test.beforeEach(async ({ page }) => {
  await page.route("**/api/message", (route) =>
    route.request().method() === "GET" ? route.fulfill({ json: { available: false } }) : route.abort(),
  );
});

const MINE = "hey, I'm Ana, backend eng in Lisbon getting into security, would love your take on where to start";
const WORDED = "Hi Maksym, I'm Ana, a backend engineer in Lisbon moving into security. Would you be open to a short call?";

test("the section starts as an invitation; the form opens on request and can be closed", async ({ page }) => {
  await page.goto("/");
  const room = page.getByTestId("intro");
  await expect(room.getByRole("heading", { name: /Want to talk\?/ })).toBeVisible();
  await expect(page.getByLabel("Your message")).toHaveCount(0);
  await room.getByRole("button", { name: "Write a message" }).click();
  await expect(page.getByLabel("Your message")).toBeFocused();
  // The form replaces the invitation on screen; the heading remains for screen readers.
  await expect(room.getByText("Write it your way and send it however you like.", { exact: false })).not.toBeInViewport();
  await expect(room.getByRole("heading", { name: /Want to talk\?/ })).toBeAttached();
  await expect(room.getByRole("button", { name: "Write a message" })).toHaveCount(0);
  await room.getByRole("button", { name: "Close" }).click();
  await expect(page.getByLabel("Your message")).toHaveCount(0);
  await expect(room.getByRole("button", { name: "Write a message" })).toBeVisible();
});

test("once open, everything is visible; actions wait for a message", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
  const room = page.getByTestId("intro");
  await expect(room.getByRole("button", { name: "Send by email" })).toBeDisabled();
  await expect(room.getByRole("button", { name: /Copy for X/ })).toBeDisabled();
  await expect(room.getByRole("button", { name: /Copy for LinkedIn/ })).toBeDisabled();
  await expect(room.getByRole("button", { name: "Help me word it" })).toBeDisabled();
  await expect(room.getByText("0/500")).toBeVisible();

  await page.getByLabel("Your message").fill("Hi");
  await expect(room.getByRole("link", { name: "Send by email" })).toBeVisible();
  await expect(room.getByRole("button", { name: /Copy for X/ })).toBeEnabled();
});

test("the visitor's own words are sent as written, no AI involved", async ({ page, context }) => {
  let aiCalls = 0;
  await page.route("**/api/intro", (route) => {
    aiCalls++;
    return route.abort();
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
  await page.getByLabel("Your message").fill(MINE);

  const href = await page.getByRole("link", { name: "Send by email" }).getAttribute("href");
  expect(href).toMatch(/^mailto:maksym\.boytsov@gmail\.com\?subject=Hi%20from%20maksym\.page&body=/);
  expect(decodeURIComponent(href!.split("body=")[1])).toBe(MINE);

  await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
  const popup = context.waitForEvent("page");
  await page.getByRole("button", { name: /Copy for X/ }).click();
  expect((await popup).url()).toContain("x.com/maksym_boytsov");
  await expect(page.getByText("Copied. Paste it into a message on X.")).toBeVisible();
  expect(aiCalls).toBe(0);
});

test("help with the wording is optional, rewrites in place, and can be undone", async ({ page }) => {
  let sent: unknown = null;
  await page.route("**/api/intro", async (route) => {
    sent = JSON.parse(route.request().postData()!);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ note: WORDED }) });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
  const box = page.getByLabel("Your message");
  await box.fill("too short");
  await expect(page.getByRole("button", { name: "Help me word it" })).toBeDisabled();

  await box.fill(MINE);
  await page.getByRole("button", { name: "Help me word it" }).click();
  expect(sent).toEqual({ about: MINE });
  await expect(box).toHaveValue(WORDED);
  const href = await page.getByRole("link", { name: "Send by email" }).getAttribute("href");
  expect(decodeURIComponent(href!.split("body=")[1])).toBe(WORDED);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(box).toHaveValue(MINE);
  await expect(page.getByRole("button", { name: "Undo" })).toHaveCount(0);
});

test("if wording help fails, the message stays and can still be sent", async ({ page }) => {
  let reply = { status: 422, error: "unclear" };
  await page.route("**/api/intro", (route) =>
    route.fulfill({ status: reply.status, contentType: "application/json", body: JSON.stringify({ error: reply.error }) }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
  const box = page.getByLabel("Your message");
  await box.fill("write me a poem about cats please");
  await page.getByRole("button", { name: "Help me word it" }).click();
  await expect(page.getByText(/couldn't find a message to work with/)).toBeVisible();
  await expect(box).toHaveValue("write me a poem about cats please");
  await expect(page.getByRole("link", { name: "Send by email" })).toBeVisible();

  reply = { status: 429, error: "rate_limited" };
  await page.getByRole("button", { name: "Help me word it" }).click();
  await expect(page.getByText("Give it a minute.")).toBeVisible();

  reply = { status: 503, error: "budget" };
  await page.getByRole("button", { name: "Help me word it" }).click();
  await expect(page.getByText(/You can still send your message as it is/)).toBeVisible();
});

test("the box stops at 500 characters", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
  const box = page.getByLabel("Your message");
  await box.fill("x".repeat(600));
  await expect(box).toHaveValue("x".repeat(500));
  await expect(page.getByText("500/500")).toBeVisible();
});

test("the footer has the credit and the ways to find Maksym", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Say hi." })).toHaveCount(0);
  const footer = page.locator("footer");
  await expect(footer).toContainText("© 2026 Maksym Boytsov");
  await expect(footer.getByRole("link", { name: /^X/ })).toHaveAttribute("href", "https://x.com/maksym_boytsov");
  await expect(footer.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/maksym-boytsov");
  await expect(footer.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", "https://github.com/maksym-boytsov");
  await expect(footer.getByRole("link", { name: "Email" })).toHaveAttribute("href", "mailto:maksym.boytsov@gmail.com");
});

test.describe("with email sending set up", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/message", async (route) => {
      if (route.request().method() === "GET") return route.fulfill({ json: { available: true } });
      return route.fallback();
    });
  });

  test("sends the message from the page, with the visitor's email for replies", async ({ page }) => {
    let sent: unknown = null;
    await page.route("**/api/message", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
    await page.getByLabel("Your message").fill("Hi Maksym, I'm Ana from Lisbon. Fancy a call?");
    const sendBtn = page.getByRole("button", { name: "Send", exact: true });
    await expect(sendBtn).toBeEnabled();
    await expect(page.getByRole("link", { name: "Send by email" })).toHaveCount(0);

    const emailBox = page.getByLabel(/Your email \(optional/);
    await emailBox.fill("ana@example");
    await expect(sendBtn).toBeDisabled();
    await emailBox.fill("ana@example.com");
    await sendBtn.click();

    expect(sent).toEqual({ email: "ana@example.com", message: "Hi Maksym, I'm Ana from Lisbon. Fancy a call?", website: "" });
    await expect(page.getByText("Sent. Thank you.")).toBeVisible();
    await expect(page.getByText("I'll reply to ana@example.com.")).toBeVisible();
    // The confirmation is centred under its heading.
    const centre = async (text: string) =>
      page.getByText(text).evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        const b = r.getBoundingClientRect();
        return b.left + b.width / 2;
      });
    expect(Math.abs((await centre("Sent. Thank you.")) - (await centre("I'll reply to ana@example.com.")))).toBeLessThan(4);
    // And evenly spaced: the gap above the reply line equals the gap below it.
    const box = (loc: import("@playwright/test").Locator) => loc.evaluate((el) => el.getBoundingClientRect().toJSON());
    const [title, line, links] = await Promise.all([
      box(page.getByText("Sent. Thank you.")),
      box(page.getByText("I'll reply to ana@example.com.")),
      box(page.locator(".intro-sent .intro-links")),
    ]);
    expect(Math.abs(line.top - title.bottom - (links.top - line.bottom))).toBeLessThan(2);
    await page.getByRole("button", { name: "Write another" }).click();
    await expect(page.getByLabel("Your message")).toHaveValue("");
  });

  test("the email is optional", async ({ page }) => {
    let sent: unknown = null;
    await page.route("**/api/message", async (route) => {
      if (route.request().method() !== "POST") return route.fallback();
      sent = JSON.parse(route.request().postData()!);
      await route.fulfill({ json: { ok: true } });
    });
    await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
    await page.getByLabel("Your message").fill("Love the drawing, keep going.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    expect(sent).toEqual({ email: "", message: "Love the drawing, keep going.", website: "" });
    await expect(page.getByText("Thanks for the note.")).toBeVisible();
  });

  test("a failed send keeps the message and points to email", async ({ page }) => {
    await page.route("**/api/message", (route) =>
      route.request().method() === "POST" ? route.fulfill({ status: 502, json: { error: "error" } }) : route.fallback(),
    );
    await page.goto("/");
  await page.getByRole("button", { name: "Write a message" }).click();
    await page.getByLabel("Your message").fill("Hi Maksym, quick question about ChainPatrol.");
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await expect(page.getByText(/Couldn't send right now\. You can email me at maksym\.boytsov@gmail\.com/)).toBeVisible();
    await expect(page.getByLabel("Your message")).toHaveValue("Hi Maksym, quick question about ChainPatrol.");
  });
});
