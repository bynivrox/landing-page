import { currencies, defaultPrices, type PriceTable, type PricedTier } from "./plans";

const tiers: PricedTier[] = ["Professional", "Business"];

/**
 * The monthly prices, from the management center (MANAGEMENT_URL/api/public/pricing). Cached for
 * PRICING_REVALIDATE seconds (default 60; 0 = every request). If the management center is unset, unreachable or
 * answers something unexpected, the defaults are shown, so the pricing page never breaks.
 */
export async function loadPrices(): Promise<PriceTable> {
  const base = process.env.MANAGEMENT_URL;
  if (!base) {
    return defaultPrices;
  }

  const revalidate = Number(process.env.PRICING_REVALIDATE ?? 60);
  try {
    const response = await fetch(new URL("/api/public/pricing", base), {
      next: { revalidate: Number.isFinite(revalidate) && revalidate >= 0 ? revalidate : 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      return defaultPrices;
    }

    return parsePrices(await response.json()) ?? defaultPrices;
  } catch {
    return defaultPrices;
  }
}

/** Only accepts a complete table of positive whole minor units. */
export function parsePrices(body: unknown): PriceTable | null {
  const prices = (body as { prices?: unknown } | null)?.prices as Record<string, Record<string, unknown>> | undefined;
  if (!prices) {
    return null;
  }

  const table = structuredClone(defaultPrices);
  for (const tier of tiers) {
    for (const currency of currencies) {
      const amount = prices[tier]?.[currency];
      if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
        return null;
      }

      table[tier][currency] = amount;
    }
  }

  return table;
}
