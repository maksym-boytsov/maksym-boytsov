import { describe, expect, it } from "vitest";
import { UNKNOWN_MODEL_PRICE, priceFor, usageCostMicroUsd } from "@/lib/chat/pricing";

describe("pricing", () => {
  it("prices Opus 5.5 at $4 / $20 per million tokens", () => {
    const cost = usageCostMicroUsd({ input_tokens: 1000, output_tokens: 200 }, "claude-opus-5-5", "claude-opus-5-5");
    expect(cost).toBe(1000 * 4 + 200 * 20);
  });

  it("includes cache reads and writes", () => {
    const cost = usageCostMicroUsd(
      { input_tokens: 10, output_tokens: 10, cache_read_input_tokens: 1000, cache_creation_input_tokens: 100 },
      "claude-opus-5-5",
    );
    expect(cost).toBe(10 * 4 + 10 * 20 + Math.ceil(1000 * 0.2) + 100 * 5);
  });

  it("prices each iteration on the model that ran it, so fallbacks are counted", () => {
    const cost = usageCostMicroUsd(
      {
        input_tokens: 0,
        output_tokens: 0,
        iterations: [
          { type: "message", model: null, input_tokens: 500, output_tokens: 20 },
          { type: "fallback_message", model: "claude-opus-4-8", input_tokens: 520, output_tokens: 100 },
        ],
      },
      "claude-opus-5-5",
      "claude-opus-4-8",
    );
    expect(cost).toBe(500 * 4 + 20 * 20 + 520 * 5 + 100 * 25);
  });

  it("prices Sonnet 5.5 at $2 / $10 per million tokens", () => {
    expect(usageCostMicroUsd({ input_tokens: 1000, output_tokens: 200 }, "claude-sonnet-5-5")).toBe(1000 * 2 + 200 * 10);
    expect(priceFor("claude-sonnet-5").output).toBe(10);
  });

  it("matches the longest model id and prices unknown models conservatively", () => {
    expect(priceFor("claude-opus-5-5").input).toBe(4);
    expect(priceFor("claude-opus-5").input).toBe(5);
    expect(priceFor("claude-opus-5-20260101").input).toBe(5);
    expect(priceFor("some-new-model")).toEqual(UNKNOWN_MODEL_PRICE);
    expect(priceFor(null)).toEqual(UNKNOWN_MODEL_PRICE);
  });
});
