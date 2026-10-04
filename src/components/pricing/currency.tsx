"use client";

import { useSyncExternalStore } from "react";
import { currencies, type Currency } from "@/lib/plans";
import { cn } from "@/lib/utils";

const storageKey = "nivrox.currency";
const listeners = new Set<() => void>();

/** The visitor's choice; otherwise EUR for European time zones and USD elsewhere. */
function read(): Currency {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "USD" || stored === "EUR") {
      return stored;
    }
  } catch {
    // Storage can be unavailable (private mode); fall back to the guess.
  }

  return Intl.DateTimeFormat().resolvedOptions().timeZone.startsWith("Europe/") ? "EUR" : "USD";
}

function choose(currency: Currency) {
  try {
    localStorage.setItem(storageKey, currency);
  } catch {
    // Not remembered, but still applied for this visit.
  }

  current = currency;
  listeners.forEach((listener) => listener());
}

let current: Currency | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Shared by every price on the page; the static HTML renders USD until the browser knows better. */
export function useCurrency(): Currency {
  return useSyncExternalStore(
    subscribe,
    () => (current ??= read()),
    () => "USD",
  );
}

export function CurrencySwitch({ className }: { className?: string }) {
  const currency = useCurrency();

  return (
    <div
      role="radiogroup"
      aria-label="Currency"
      className={cn("inline-flex rounded-md border border-border bg-background/60 p-1 backdrop-blur", className)}
    >
      {currencies.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={currency === option}
          onClick={() => choose(option)}
          className={cn(
            "rounded-sm px-3 py-1.5 font-mono text-xs transition-colors",
            currency === option ? "bg-surface-muted text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option === "USD" ? "USD $" : "EUR €"}
        </button>
      ))}
    </div>
  );
}
