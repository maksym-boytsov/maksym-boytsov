import "server-only";
import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/** The Anthropic client, or null when no API key is configured. */
export function getAnthropic(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  client ??= new Anthropic({ apiKey, maxRetries: 1, timeout: 30_000 });
  return client;
}
