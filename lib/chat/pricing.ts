/** USD per million tokens. Cache writes are the 5-minute TTL rate (1.25x input). */
export interface ModelPrice {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const PRICES: Record<string, ModelPrice> = {
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  // Sonnet 5.5's refusal fallback can finish on Sonnet 5, at the same per-token price.
  "claude-sonnet-5": { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-opus-5": { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
  "claude-opus-4-8": { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
};

/** Anything not in the table is priced conservatively, so the daily cap still holds. */
export const UNKNOWN_MODEL_PRICE: ModelPrice = { input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 };

const KEYS_LONGEST_FIRST = Object.keys(PRICES).sort((a, b) => b.length - a.length);

export function priceFor(model: string | null | undefined): ModelPrice {
  if (!model) return UNKNOWN_MODEL_PRICE;
  const key = KEYS_LONGEST_FIRST.find((k) => model === k || model.startsWith(`${k}-`) || model.startsWith(`${k}@`));
  return key ? PRICES[key] : UNKNOWN_MODEL_PRICE;
}

export interface TokenCounts {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
}

export interface IterationUsage extends TokenCounts {
  type: string;
  model?: string | null;
}

export interface UsageWithIterations extends TokenCounts {
  iterations?: readonly IterationUsage[] | null;
}

const costOf = (u: TokenCounts, price: ModelPrice) =>
  u.input_tokens * price.input +
  u.output_tokens * price.output +
  (u.cache_read_input_tokens ?? 0) * price.cacheRead +
  (u.cache_creation_input_tokens ?? 0) * price.cacheWrite;

/**
 * Cost of one response in micro-dollars, rounded up. Uses `usage.iterations`
 * when present, because a refusal fallback can finish the answer on a
 * different model at a different price. Iterations without a model ran on
 * the requested model.
 */
export function usageCostMicroUsd(usage: UsageWithIterations, requestedModel: string, servedModel?: string): number {
  const iterations = usage.iterations ?? [];
  const total =
    iterations.length > 0
      ? iterations.reduce((sum, it) => sum + costOf(it, priceFor(it.model ?? requestedModel)), 0)
      : costOf(usage, priceFor(servedModel ?? requestedModel));
  return Math.ceil(total);
}
