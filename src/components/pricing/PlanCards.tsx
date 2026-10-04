"use client";

import { Check, Cloud, Minus, Server } from "lucide-react";
import {
  ctaLabel,
  featureInfo,
  formatLimit,
  formatPrice,
  hostingLabels,
  limitLabels,
  plans,
  type Feature,
  type Limits,
  type Plan,
  type PriceTable,
} from "@/lib/plans";
import { cn } from "@/lib/utils";
import { ButtonLink } from "../landing/primitives";
import { useCurrency } from "./currency";

const allFeatures = Object.keys(featureInfo) as Feature[];

/**
 * Four plans side by side; they overlap the bottom of the pricing hero and flow into the page. The cards share the
 * grid's rows (subgrid), so prices, buttons, limits and features line up across cards whatever the text length.
 */
export function PlanCards({ links, prices }: { links: Record<Plan["cta"], string>; prices: PriceTable }) {
  return (
    <div className="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => (
        <PlanCard key={plan.tier} plan={plan} href={links[plan.cta]} prices={prices} />
      ))}
    </div>
  );
}

function PlanCard({ plan, href, prices }: { plan: Plan; href: string; prices: PriceTable }) {
  const currency = useCurrency();
  const highlighted = plan.tier === "Professional";

  return (
    <article
      aria-labelledby={`plan-${plan.tier}`}
      className={cn(
        "relative row-span-5 mb-4 grid grid-rows-subgrid rounded-lg border bg-surface/90 p-6 backdrop-blur-xl",
        highlighted ? "border-brand shadow-[0_0_60px_-20px_var(--brand-glow)]" : "border-border",
      )}
    >
      {highlighted && (
        <span className="absolute -top-2.5 right-5 rounded-sm bg-brand px-2 py-0.5 font-mono text-[10px] whitespace-nowrap uppercase tracking-wider text-brand-foreground">
          Deploy with agents
        </span>
      )}
      <div>
        <h2 id={`plan-${plan.tier}`} className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {plan.tier}
        </h2>
        <p className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
          {plan.hosting === "cloud" ? <Cloud className="size-3.5" aria-hidden /> : <Server className="size-3.5" aria-hidden />}
          {hostingLabels[plan.hosting]}
        </p>
      </div>

      <div className="pt-4">
        <p className="flex items-baseline gap-1.5 font-display text-4xl font-semibold tracking-[-0.03em]">
          <span>{formatPrice(plan, currency, prices)}</span>
          {plan.price.kind === "monthly" && <span className="text-base font-normal tracking-normal text-muted-foreground">/ month</span>}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
      </div>

      <div className="pt-6">
        <ButtonLink
          href={href}
          variant={highlighted ? "primary" : plan.cta === "self-host" ? "light" : "ghost"}
          arrow
          className="w-full justify-center"
        >
          {ctaLabel(plan)}
        </ButtonLink>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-border bg-border">
        {(Object.keys(limitLabels) as (keyof Limits)[]).map((key) => (
          <div key={key} className="bg-background px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint-foreground">{limitLabels[key]}</dt>
            <dd className="mt-1 font-mono text-sm text-foreground">{formatLimit(plan.limits[key])}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-6 space-y-2.5 text-sm">
        {allFeatures.map((feature) => {
          const included = plan.features.includes(feature);
          const info = featureInfo[feature];
          return (
            <li key={feature} className={cn("flex items-center gap-2.5", included ? "text-foreground" : "text-faint-foreground")}>
              {included ? (
                <Check className="size-4 shrink-0 text-brand" aria-label="Included" />
              ) : (
                <Minus className="size-4 shrink-0" aria-label="Not included" />
              )}
              <span>{info.label}</span>
              {included && !info.available && (
                <span className="ml-auto rounded-sm border border-warning/40 px-1.5 font-mono text-[10px] uppercase tracking-wider text-warning">
                  soon
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
