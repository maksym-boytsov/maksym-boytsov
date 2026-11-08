/** Request helpers for /api/chat: origin allowlist, client key, capped body read. */

type Env = Record<string, string | undefined>;

export function allowedOrigins(env: Env = process.env): Set<string> {
  const origins = new Set(["https://www.maksym.page", "https://maksym.page"]);
  // Vercel preview and deployment URLs (hostnames without a scheme).
  for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
    if (host) origins.add(`https://${host}`);
  }
  if (env.NODE_ENV === "development") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }
  return origins;
}

/** In development, any port on localhost or 127.0.0.1 (the dev server isn't always on 3000). */
const LOCAL_DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d{1,5})?$/;

export function isAllowedOrigin(origin: string | null, env: Env = process.env): boolean {
  if (origin === null) return false;
  if (env.NODE_ENV === "development" && LOCAL_DEV_ORIGIN.test(origin)) return true;
  return allowedOrigins(env).has(origin);
}

/** Expands an IPv6 address and keeps its /64 prefix, so one visitor can't rotate addresses. */
function ipv6Prefix(ip: string): string {
  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail !== undefined && tail !== "" ? tail.split(":") : [];
  const groups =
    tail === undefined ? left : [...left, ...Array(Math.max(0, 8 - left.length - right.length)).fill("0"), ...right];
  return `${groups
    .slice(0, 4)
    .map((g) => g.toLowerCase().replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}

/**
 * The rate-limit key for a request. On Vercel `x-forwarded-for` is set by the
 * platform (the client can't spoof it), with the client address first.
 */
export function clientKey(headers: Headers): string {
  const raw =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "anonymous";
  if (raw.includes(":") && !raw.includes(".")) return ipv6Prefix(raw.replace(/^\[|\]$/g, "").split("%")[0]);
  return raw;
}

/** Reads the body as text, or returns null if it's larger than `maxBytes`. */
export async function readBodyCapped(req: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(req.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}
