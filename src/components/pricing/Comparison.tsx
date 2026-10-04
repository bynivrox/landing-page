"use client";

import { Check, Minus } from "lucide-react";
import { Fragment } from "react";
import {
  featureInfo,
  formatLimit,
  formatPrice,
  hostingLabels,
  limitLabels,
  plans,
  type Feature,
  type Limits,
  type PriceTable,
} from "@/lib/plans";
import { cn } from "@/lib/utils";
import { useCurrency } from "./currency";

const groups: { title: string; rows: { label: string; detail?: string; values: (string | boolean)[]; soon?: boolean }[] }[] = [
  {
    title: "Hosting",
    rows: [
      {
        label: "Where it runs",
        detail: "Hosted plans: agents on your servers connect out to the Nivrox cloud",
        values: plans.map((plan) => hostingLabels[plan.hosting]),
      },
    ],
  },
  {
    title: "Limits",
    rows: (Object.keys(limitLabels) as (keyof Limits)[]).map((key) => ({
      label: limitLabels[key],
      detail: key === "users" ? "Includes pending invitations" : undefined,
      values: plans.map((plan) => formatLimit(plan.limits[key])),
    })),
  },
  {
    title: "Capabilities",
    rows: (Object.keys(featureInfo) as Feature[]).map((feature) => ({
      label: featureInfo[feature].label,
      detail: featureInfo[feature].detail,
      values: plans.map((plan) => plan.features.includes(feature)),
      soon: !featureInfo[feature].available,
    })),
  },
];

/** A real table: the plan header sticks below the navigation while the rows scroll past. */
export function Comparison({ prices }: { prices: PriceTable }) {
  const currency = useCurrency();

  return (
    <div className="overflow-x-auto rounded-lg border border-border lg:overflow-visible">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">Plan comparison</caption>
        <thead className="lg:sticky lg:top-16 lg:z-10">
          <tr className="bg-background/85 backdrop-blur-xl">
            <th
              scope="col"
              className="w-[34%] border-b border-border px-5 py-4 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-faint-foreground"
            >
              Plan
            </th>
            {plans.map((plan) => (
              <th
                key={plan.tier}
                scope="col"
                className={cn(
                  "border-b px-5 py-4 text-base font-medium tracking-tight",
                  plan.tier === "Professional" ? "border-brand text-foreground" : "border-border text-foreground",
                )}
              >
                {plan.tier}
                <span className="mt-0.5 block font-mono text-xs font-normal text-muted-foreground">
                  {formatPrice(plan, currency, prices)}
                  {plan.price.kind === "monthly" && " / month"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.title}>
              <tr>
                <th
                  colSpan={plans.length + 1}
                  scope="colgroup"
                  className="bg-surface px-5 pt-6 pb-2 font-mono text-[11px] font-normal uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {group.title}
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label} className="border-t border-border transition-colors hover:bg-surface/60">
                  <th scope="row" className="px-5 py-4 font-normal">
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      {row.label}
                      {row.soon && (
                        <span className="rounded-sm border border-warning/40 px-1.5 font-mono text-[10px] uppercase tracking-wider text-warning">
                          in development
                        </span>
                      )}
                    </span>
                    {row.detail && <span className="mt-0.5 block text-xs text-muted-foreground">{row.detail}</span>}
                  </th>
                  {row.values.map((value, index) => (
                    <td key={plans[index].tier} className="px-5 py-4">
                      {typeof value === "string" ? (
                        <span className="font-mono text-sm text-foreground">{value}</span>
                      ) : value ? (
                        <Check className="size-4 text-brand" aria-label="Included" />
                      ) : (
                        <Minus className="size-4 text-faint-foreground" aria-label="Not included" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
