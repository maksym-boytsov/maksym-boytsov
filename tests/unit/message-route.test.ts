import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  hasResend: vi.fn(() => true),
  checkSendLimit: vi.fn<(key: string) => { ok: true } | { ok: false; retryAfterSeconds: number }>(() => ({ ok: true })),
}));

vi.mock("@/lib/chat/mail", () => ({
  getResend: () => (mocks.hasResend() ? { emails: { send: mocks.send } } : null),
  mailFrom: () => "maksym.page <onboarding@resend.dev>",
  mailTo: () => "maksym.boytsov@gmail.com",
}));
vi.mock("@/lib/chat/guard", () => ({ checkSendLimit: mocks.checkSendLimit }));

const { GET, POST } = await import("@/app/api/message/route");

const BODY = { email: "ana@example.com", message: "Hi Maksym, I'm Ana from Lisbon. Fancy a call?", website: "" };

function request(body: unknown, headers: Record<string, string> = {}) {
  return new Request("https://www.maksym.page/api/message", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.maksym.page", "x-forwarded-for": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.hasResend.mockReturnValue(true);
  mocks.checkSendLimit.mockReturnValue({ ok: true });
  mocks.send.mockResolvedValue({ data: { id: "email_1" }, error: null });
});

describe("GET /api/message", () => {
  it("says whether Send is available", async () => {
    expect(await GET().json()).toEqual({ available: true });
    mocks.hasResend.mockReturnValue(false);
    expect(await GET().json()).toEqual({ available: false });
  });
});

describe("POST /api/message", () => {
  it("sends to Maksym's inbox, plain text, with the visitor as reply-to", async () => {
    const res = await POST(request({ ...BODY, email: "  ana@example.com ", message: `  ${BODY.message}  ` }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.send).toHaveBeenCalledWith({
      from: "maksym.page <onboarding@resend.dev>",
      to: "maksym.boytsov@gmail.com",
      replyTo: "ana@example.com",
      subject: "New message from maksym.page",
      text: `${BODY.message}\n\n— ana@example.com, via maksym.page`,
    });
    expect(mocks.send.mock.calls[0][0]).not.toHaveProperty("html");
  });

  it("sends without an email too, marked as having no reply address", async () => {
    for (const body of [{ message: BODY.message }, { ...BODY, email: "" }, { ...BODY, email: "   " }]) {
      mocks.send.mockClear();
      expect((await POST(request(body))).status).toBe(200);
      const payload = mocks.send.mock.calls[0][0];
      expect(payload).not.toHaveProperty("replyTo");
      expect(payload.subject).toBe("New message from maksym.page (no reply address)");
      expect(payload.text).toBe(`${BODY.message}\n\n— no reply address, via maksym.page`);
    }
  });

  it("rejects other origins", async () => {
    expect((await POST(request(BODY, { origin: "https://evil.example" }))).status).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each([
    ["invalid JSON", "{nope"],
    ["a bad email", { ...BODY, email: "not-an-email" }],
    ["an email with a newline", { ...BODY, email: "ana@example.com\nBcc: everyone@example.com" }],
    ["an empty message", { ...BODY, message: "   " }],
    ["a message over 500 characters", { ...BODY, message: "x".repeat(501) }],
    ["extra fields", { ...BODY, to: "someone@else.com" }],
    ["a body over 4 KB", JSON.stringify({ ...BODY, pad: "x".repeat(5000) })],
  ])("returns 400 for %s", async (_name, body) => {
    const res = await POST(request(body));
    expect(res.status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("quietly drops bots that fill in the hidden field", async () => {
    const res = await POST(request({ ...BODY, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.checkSendLimit).not.toHaveBeenCalled();
  });

  it("is unavailable without a Resend key", async () => {
    mocks.hasResend.mockReturnValue(false);
    const res = await POST(request(BODY));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  it("limits how often one visitor can send", async () => {
    mocks.checkSendLimit.mockReturnValue({ ok: false, retryAfterSeconds: 900 });
    const res = await POST(request(BODY));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("900");
    expect(mocks.checkSendLimit).toHaveBeenCalledWith("203.0.113.7");
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("reports a Resend failure without details", async () => {
    mocks.send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "from not verified" } });
    const res = await POST(request(BODY));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "error" });
    mocks.send.mockRejectedValue(new Error("network down"));
    expect((await POST(request(BODY))).status).toBe(502);
  });

  it("never logs the message or the visitor's address", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    await POST(request(BODY));
    const logged = spy.mock.calls.flat().join("\n");
    expect(logged).toContain('"event":"sent"');
    expect(logged).not.toContain("ana@example.com");
    expect(logged).not.toContain("Lisbon");
    spy.mockRestore();
  });
});
