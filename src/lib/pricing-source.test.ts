import { describe, expect, it } from "vitest";
import { defaultPrices, formatPrice, plans } from "./plans";
import { parsePrices } from "./pricing-source";

describe("prices from the management center", () => {
  it("accepts a complete table", () => {
    const prices = { Professional: { USD: 700, EUR: 650 }, Business: { USD: 3900, EUR: 3600 } };
    expect(parsePrices({ period: "month", prices, updatedAt: null })).toEqual(prices);
  });

  it.each([
    null,
    {},
    { prices: { Professional: { USD: 500 } } },
    { prices: { Professional: { USD: 5.5, EUR: 450 }, Business: { USD: 2900, EUR: 2500 } } },
  ])("rejects %j", (body) => {
    expect(parsePrices(body)).toBeNull();
  });

  it("formats per currency, with cents only when there are any", () => {
    const professional = plans.find((plan) => plan.tier === "Professional")!;
    expect(formatPrice(professional, "USD", defaultPrices)).toBe("$5");
    expect(formatPrice(professional, "EUR", defaultPrices)).toBe("€4.50");
    expect(formatPrice(plans[0], "EUR", defaultPrices)).toBe("Free");
  });
});
