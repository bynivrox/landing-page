"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Container, Panel, PanelHeader, SectionHeading, StatusMark } from "./primitives";

const stages = [
  { name: "Desired", detail: "Visual topology" },
  { name: "Simulate", detail: "Every layer, explained" },
  { name: "Plan", detail: "Only the required changes" },
  { name: "Approve", detail: "Human review" },
  { name: "Deploy", detail: "Typed agent commands" },
  { name: "Verify", detail: "Actual state" },
];

/** A horizontal process that bleeds past the page edges and fills as the section scrolls through. */
export function DeploymentSection() {
  const section = useRef<HTMLElement>(null);
  const [reached, setReached] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 75%", "end 70%"] });
  const width = useTransform(scrollYProgress, [0, 0.8], ["0%", "100%"]);

  useMotionValueEvent(scrollYProgress, "change", (value) => setReached(Math.floor(Math.min(1, value / 0.8) * stages.length + 0.0001)));

  return (
    <section id="deployment" ref={section} className="relative pt-[var(--section-gap)]">
      <Container>
        <SectionHeading
          eyebrow="Deployment"
          title={
            <>
              From desired state <span className="text-brand-gradient">to verified state.</span>
            </>
          }
        >
          Nivrox does not jump from a diagram to shell commands. Every change is planned, approved, backed up, applied and verified, and
          stays reversible.
        </SectionHeading>
      </Container>

      <div className="relative mt-16">
        <div aria-hidden className="absolute top-[1.4rem] right-0 left-0 h-px bg-border" />
        <motion.div aria-hidden className="absolute top-[1.4rem] left-0 h-px bg-brand" style={{ width }} />
        <Container>
          <ol className="relative grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {stages.map((stage, index) => {
              const passed = index < reached;
              return (
                <li key={stage.name}>
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-md border bg-background font-mono text-xs transition-colors duration-500",
                      passed ? "border-brand text-brand" : "border-border-strong text-faint-foreground",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p
                    className={cn(
                      "mt-5 text-lg font-medium tracking-tight transition-colors",
                      passed ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {stage.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stage.detail}</p>
                </li>
              );
            })}
          </ol>
        </Container>
      </div>

      <Container className="mt-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader title="Deployment #14 · prod-eu-01" meta={<StatusMark status="passed" label="Succeeded" />} />
            <ul className="divide-y divide-border font-mono text-xs">
              {[
                ["Preflight", "nft -c passes · wg0 running", "passed"],
                ["Backup", "3 files → backups/d14", "passed"],
                ["Apply", "compose.yaml · wg0.conf · nivrox.nft", "passed"],
                ["Verify", "tcp 8000 from relay01 reachable", "passed"],
                ["Complete", "rollback stays available", "passed"],
              ].map(([name, detail, status]) => (
                <li key={name} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 px-4 py-3">
                  <StatusMark status={status as "passed"} label={name} />
                  <span className="truncate text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel>
            <PanelHeader
              title="If something fails"
              meta={<span className="font-mono text-[11px] text-faint-foreground">example data</span>}
            />
            <div className="space-y-4 p-4 text-sm text-muted-foreground">
              <p>
                <StatusMark status="failed" label="Apply failed" />{" "}
                <span className="ml-2 font-mono text-xs">wg syncconf: invalid peer</span>
              </p>
              <p>
                <StatusMark status="warning" label="Rolling back" />{" "}
                <span className="ml-2 font-mono text-xs">restore backups/d14 · re-apply previous wg0.conf</span>
              </p>
              <p>
                <StatusMark status="passed" label="Rolled back" />{" "}
                <span className="ml-2 font-mono text-xs">server matches the previous state</span>
              </p>
              <p className="border-t border-border pt-4">
                One active deployment per agent, commands expire after ten minutes, and every action is written to the audit log.
              </p>
            </div>
          </Panel>
        </div>
      </Container>
    </section>
  );
}
