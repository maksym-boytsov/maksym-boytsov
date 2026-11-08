import { describe, expect, it } from "vitest";
import { clientKey, isAllowedOrigin, readBodyCapped } from "@/lib/chat/request";

describe("isAllowedOrigin", () => {
  const prod = { NODE_ENV: "production" };
  it("allows the site and rejects everything else", () => {
    expect(isAllowedOrigin("https://www.maksym.page", prod)).toBe(true);
    expect(isAllowedOrigin("https://maksym.page", prod)).toBe(true);
    expect(isAllowedOrigin("https://evil.example", prod)).toBe(false);
    expect(isAllowedOrigin("https://www.maksym.page.evil.example", prod)).toBe(false);
    expect(isAllowedOrigin(null, prod)).toBe(false);
    expect(isAllowedOrigin("http://localhost:3000", prod)).toBe(false);
  });
  it("allows the Vercel preview URL and localhost in development", () => {
    expect(isAllowedOrigin("https://maksym-git-redesign.vercel.app", { ...prod, VERCEL_BRANCH_URL: "maksym-git-redesign.vercel.app" })).toBe(true);
    expect(isAllowedOrigin("http://localhost:3000", { NODE_ENV: "development" })).toBe(true);
    expect(isAllowedOrigin("http://localhost:4949", { NODE_ENV: "development" })).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:4949", { NODE_ENV: "development" })).toBe(true);
    expect(isAllowedOrigin("http://localhost:4949", prod)).toBe(false);
    expect(isAllowedOrigin("http://localhost.evil.example:4949", { NODE_ENV: "development" })).toBe(false);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    expect(clientKey(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientKey(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientKey(new Headers())).toBe("anonymous");
  });
  it("groups IPv6 visitors by /64", () => {
    const a = clientKey(new Headers({ "x-forwarded-for": "2001:db8:abcd:12:1::1" }));
    const b = clientKey(new Headers({ "x-forwarded-for": "2001:0db8:abcd:0012:ffff:1:2:3" }));
    expect(a).toBe("2001:db8:abcd:12::/64");
    expect(b).toBe(a);
    expect(clientKey(new Headers({ "x-forwarded-for": "2001:db8::1" }))).toBe("2001:db8:0:0::/64");
  });
});

describe("readBodyCapped", () => {
  const post = (body: string, headers: Record<string, string> = {}) =>
    new Request("https://www.maksym.page/api/chat", { method: "POST", body, headers });

  it("returns the body when it fits", async () => {
    expect(await readBodyCapped(post("hello"), 16)).toBe("hello");
  });
  it("rejects bodies over the limit, declared or not", async () => {
    expect(await readBodyCapped(post("x".repeat(17)), 16)).toBeNull();
    expect(await readBodyCapped(post("x", { "content-length": "99999" }), 16)).toBeNull();
  });
});
