"use client";

import { motion, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { useMotionValueChange } from "./useMotionValueChange";
import { cn } from "@/lib/utils";
import { Container, Panel, PanelHeader, SectionHeading, StatusMark } from "./primitives";

const rows = [
  { key: "address", desired: "10.50.0.1", actual: "10.50.0.1" },
  { key: "agent receiver", desired: "tcp 8000", actual: "tcp 9000", drifts: true },
  { key: "tunnel", desired: "wg0 · 2 peers", actual: "wg0 · 2 peers" },
  { key: "runtime", desired: "compose: monitoring", actual: "compose: monitoring" },
];

const actions = ["Review change", "Import", "Restore", "Ignore"];

/** Desired vs actual; the actual port changes as the section scrolls into view. Drift detection is in development. */
export function DriftSection() {
  const section = useRef<HTMLElement>(null);
  const [changed, setChanged] = useState(false);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 70%", "end 60%"] });
  useMotionValueChange(scrollYProgress, (value) => setChanged(value > 0.45));

  return (
    <section id="drift" ref={section} className="relative pt-[var(--section-gap)]">
      <Container>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <SectionHeading
            eyebrow="Verification & drift"
            title={
              <>
                Know when reality <span className="text-brand-gradient">changes.</span>
              </>
            }
          >
            Nivrox keeps desired state and actual state apart and shows the difference, so you can review, import, restore or ignore it.
            Nothing is changed back silently.
          </SectionHeading>
          <span className="rounded-sm border border-warning/40 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-warning">
            Drift detection · in development
          </span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {(["desired", "actual"] as const).map((side) => (
            <Panel key={side}>
              <PanelHeader
                title={side === "desired" ? "Desired state" : "Actual state"}
                meta={
                  side === "actual" ? (
                    changed ? (
                      <StatusMark status="warning" label="1 difference" />
                    ) : (
                      <StatusMark status="passed" label="In sync" />
                    )
                  ) : (
                    <span className="font-mono text-[11px] text-faint-foreground">topology v14</span>
                  )
                }
              />
              <ul className="divide-y divide-border">
                {rows.map((row) => {
                  const value = side === "desired" || !row.drifts || !changed ? row.desired : row.actual;
                  const highlighted = side === "actual" && row.drifts && changed;
                  return (
                    <li
                      key={row.key}
                      className={cn("flex items-center justify-between px-4 py-3.5 transition-colors", highlighted && "bg-warning/5")}
                    >
                      <span className="text-sm text-muted-foreground">{row.key}</span>
                      <motion.span
                        key={value}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("font-mono text-sm", highlighted ? "text-warning" : "text-foreground")}
                      >
                        {value}
                      </motion.span>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          ))}
        </div>

        <div
          className={cn("mt-6 flex flex-wrap items-center gap-3 transition-opacity duration-500", changed ? "opacity-100" : "opacity-30")}
        >
          <StatusMark status="warning" label="Port changed" />
          <span className="font-mono text-sm text-foreground">8000 → 9000</span>
          <span className="mx-2 h-4 w-px bg-border" aria-hidden />
          {actions.map((action, index) => (
            <span
              key={action}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                index === 0 ? "border-brand bg-brand/10 text-foreground" : "border-border text-muted-foreground",
              )}
            >
              {action}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
