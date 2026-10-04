"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Panel, PanelHeader, StatusMark, type Status } from "./primitives";

interface Step {
  name: string;
  summary: string;
  panel: ReactNode;
}

const steps: Step[] = [
  {
    name: "Discover",
    summary: "Connect through a lightweight agent. Discovery is read-only: interfaces, routes, Docker, WireGuard, firewalls and services.",
    panel: (
      <Rows
        title="Inventory · prod-eu-01"
        rows={[
          ["Interfaces", "eth0 203.0.113.10 · wg0 10.50.0.1", "passed"],
          ["Docker", "6 containers · 3 networks", "passed"],
          ["WireGuard", "wg0 · 2 peers", "passed"],
          ["Firewall", "nftables · inet filter", "passed"],
          ["Reverse proxy", "traefik · :80 :443", "passed"],
        ]}
      />
    ),
  },
  {
    name: "Model",
    summary: "Everything lands in one canonical model with ownership. Nivrox never assumes it may change what it can see.",
    panel: (
      <Rows
        title="Ownership"
        rows={[
          ["/etc/wireguard/wg0.conf", "Existing", "warning"],
          ["compose: legacy-app", "Unknown", "unknown"],
          ["nftables table inet filter", "Existing", "warning"],
          ["compose: monitoring", "Managed", "passed"],
          ["table inet nivrox", "Managed", "passed"],
        ]}
      />
    ),
  },
  {
    name: "Design",
    summary:
      "Add what you need on the canvas: a Checkmk site, a WireGuard peer, a firewall rule, a DNS record. The design is desired state.",
    panel: (
      <Rows
        title="Desired changes"
        rows={[
          ["+ checkmk", "Docker Compose · monitoring", "passed"],
          ["+ agent receiver", "TCP 8000 → 10.50.0.1:8000", "passed"],
          ["+ peer relay01", "10.50.0.2/32", "passed"],
          ["+ rule", "allow tcp 8000 from 10.50.0.0/24", "passed"],
        ]}
      />
    ),
  },
  {
    name: "Simulate",
    summary:
      "Every connection is evaluated layer by layer, and every result explains itself. An edge on the canvas never implies connectivity.",
    panel: (
      <Rows
        title="relay01 → checkmk · tcp 8000"
        rows={[
          ["DNS", "checkmk.example.internal → 10.50.0.1", "passed"],
          ["Routing", "10.50.0.0/24 via wg0", "passed"],
          ["WireGuard", "AllowedIPs · handshake path", "passed"],
          ["Firewall", "rule 3 allows tcp 8000", "passed"],
          ["Docker", "10.50.0.1:8000 → checkmk:8000", "passed"],
        ]}
      />
    ),
  },
  {
    name: "Plan",
    summary: "The plan contains only what must change. Files Nivrox did not write are never overwritten: the plan is blocked instead.",
    panel: (
      <Rows
        title="Change plan · 3 steps"
        rows={[
          ["compose.yaml", "create · managed", "passed"],
          ["wg0.conf", "add peer · needs approval", "warning"],
          ["nftables", "additive table inet nivrox", "passed"],
          ["legacy-app", "untouched", "unknown"],
        ]}
      />
    ),
  },
  {
    name: "Deploy",
    summary: "An approved plan runs through the agent as typed commands, never arbitrary shell, with a backup before every change.",
    panel: (
      <Rows
        title="Deployment #14"
        rows={[
          ["Preflight", "nft -c · wg syncconf", "passed"],
          ["Backup", "backups/d14", "passed"],
          ["Apply", "3 of 3 files", "passed"],
          ["Verify", "tcp 8000 from relay01", "passed"],
          ["Rollback", "available", "unknown"],
        ]}
      />
    ),
  },
  {
    name: "Verify",
    summary: "After the change, Nivrox checks what actually happened and compares it with what was simulated.",
    panel: (
      <Rows
        title="Simulated vs actual"
        rows={[
          ["relay01 → checkmk", "reachable · reachable", "passed"],
          ["internet → checkmk", "blocked · blocked", "passed"],
          ["wg0 handshake", "expected · seen 14 s ago", "passed"],
        ]}
      />
    ),
  },
];

/**
 * Discover → Verify, driven by scrolling: the section pins and each viewport of scroll advances one step.
 * Without enough height (small screens) it simply lists the steps.
 */
export function WorkflowSection() {
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setActive(Math.min(steps.length - 1, Math.max(0, Math.floor(value * steps.length))));
  });

  return (
    <section id="workflow" ref={section} className="relative mt-[var(--section-gap)] lg:h-[calc(100svh*5)]">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-svh lg:items-center">
        <Container>
          <div>
            <div>
              <Eyebrow>One continuous workflow</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                See it. Understand it.
                <br />
                <span className="text-brand-gradient">Change it. Verify it.</span>
              </h2>
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ol className="flex flex-col">
              {steps.map((step, index) => (
                <li key={step.name} className="border-t border-border last:border-b">
                  <div
                    className={cn(
                      "flex items-baseline gap-5 py-3.5 transition-colors duration-300",
                      index === active ? "text-foreground" : "text-faint-foreground",
                    )}
                  >
                    <span className={cn("font-mono text-xs", index === active && "text-brand")}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xl font-medium tracking-tight sm:text-2xl">{step.name}</span>
                    <span
                      aria-hidden
                      className={cn("ml-auto h-px bg-brand transition-all duration-500", index === active ? "w-16" : "w-0")}
                    />
                  </div>
                  <p
                    className={cn(
                      "overflow-hidden pl-10 text-muted-foreground transition-all duration-500 lg:max-h-0 lg:opacity-0",
                      index === active && "lg:max-h-32 lg:pb-4 lg:opacity-100",
                      "pb-4 lg:pb-0",
                    )}
                  >
                    {step.summary}
                  </p>
                  <div className="pb-6 lg:hidden">{step.panel}</div>
                </li>
              ))}
            </ol>

            <div className="relative hidden lg:block">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {steps[active].panel}
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex gap-1" aria-hidden>
                {steps.map((step, index) => (
                  <span
                    key={step.name}
                    className={cn("h-[3px] flex-1 rounded-full transition-colors", index <= active ? "bg-brand" : "bg-foreground/10")}
                  />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}

function Rows({ title, rows }: { title: string; rows: [string, string, Status][] }) {
  return (
    <Panel className="bg-grid">
      <PanelHeader title={title} meta={<span className="font-mono text-[11px] text-faint-foreground">example data</span>} />
      <ul className="divide-y divide-border">
        {rows.map(([name, value, status], index) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 * index + 0.1 }}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]"
          >
            <span className="truncate text-sm text-foreground">{name}</span>
            <span className="col-span-2 row-start-2 truncate font-mono text-xs text-muted-foreground sm:col-span-1 sm:row-start-auto">
              {value}
            </span>
            <StatusMark
              status={status}
              label={statusLabel(status)}
              className="col-start-2 row-start-1 sm:col-start-auto sm:row-start-auto"
            />
          </motion.li>
        ))}
      </ul>
    </Panel>
  );
}

function statusLabel(status: Status) {
  return { passed: "ok", failed: "failed", warning: "review", unknown: "left alone", pending: "pending" }[status];
}
