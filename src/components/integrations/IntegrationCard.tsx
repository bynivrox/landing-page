import { Check, CircleDashed, Minus } from "lucide-react";
import { capabilities, type Depth, type Integration } from "@/lib/integrations";
import { cn } from "@/lib/utils";

const depthStyles = {
  built: { icon: Check, tone: "text-brand", label: "Built" },
  partial: { icon: CircleDashed, tone: "text-warning", label: "Partial" },
  missing: { icon: Minus, tone: "text-faint-foreground", label: "Not yet" },
} as const;

const styleOf = (depth: Depth | undefined) => depthStyles[depth === true ? "built" : depth === "partial" ? "partial" : "missing"];

/** A state is always icon + text + color, never color alone. */
export function DepthMark({ depth, className }: { depth: Depth | undefined; className?: string }) {
  const style = styleOf(depth);
  return <style.icon className={cn("size-3.5 shrink-0", style.tone, className)} aria-label={style.label} />;
}

export function DepthLegend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {([true, "partial", undefined] as const).map((depth) => (
        <li key={String(depth)} className="flex items-center gap-1.5">
          <DepthMark depth={depth} />
          {styleOf(depth).label}
        </li>
      ))}
    </ul>
  );
}

export function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <article className="flex h-full flex-col bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h4 className="font-display text-xl font-medium tracking-[-0.02em] text-foreground">{integration.name}</h4>
        {integration.resourceTypes && (
          <span className="font-mono text-[11px] text-faint-foreground">{[...new Set(integration.resourceTypes)].join(" · ")}</span>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{integration.summary}</p>

      <div className="mt-auto pt-6">
        <ul className="grid grid-cols-5 gap-px overflow-hidden rounded-md border border-border bg-border" aria-label={`${integration.name} capabilities`}>
          {capabilities.map((capability) => {
            const depth = integration.depth[capability.key];
            return (
              <li
                key={capability.key}
                className={cn("flex flex-col items-center gap-1.5 px-1 py-2.5", depth ? "bg-background/60" : "bg-surface")}
                title={`${capability.label}: ${styleOf(depth).label}`}
              >
                <DepthMark depth={depth} />
                <span className={cn("font-mono text-[9px] uppercase tracking-wider sm:text-[10px]", depth ? "text-foreground" : "text-faint-foreground")}>
                  {capability.label}
                </span>
              </li>
            );
          })}
        </ul>
        {integration.note && <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{integration.note}</p>}
      </div>
    </article>
  );
}
