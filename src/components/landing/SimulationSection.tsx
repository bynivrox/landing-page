"use client";

import { BrickWall, Layers, Play, Radar, RotateCcw, Server, Shield } from "lucide-react";
import { animate, motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { useMotionValueChange } from "./useMotionValueChange";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Panel, PanelHeader, StatusMark } from "./primitives";

/** The reference topology: relay01 behind NAT reaches the Checkmk Agent Receiver through WireGuard. */
const hops = [
  { icon: Server, kind: "Server", name: "relay01", value: "10.50.0.2" },
  { icon: Shield, kind: "WireGuard", name: "wg-platform", value: "udp 51820" },
  { icon: BrickWall, kind: "Firewall", name: "fw-dokploy", value: "nftables" },
  { icon: Layers, kind: "Compose", name: "monitoring", value: "10.50.0.1:8000" },
  { icon: Radar, kind: "Checkmk", name: "agent receiver", value: "tcp 8000" },
];

/** What the simulator reports for this run, per layer (wording as the product's trace). */
const layers = [
  { stage: "DNS", hop: 0, evidence: "checkmk.example.internal → 10.50.0.1 (zone example.internal)" },
  { stage: "Routing", hop: 1, evidence: "10.50.0.1 matches 10.50.0.0/24 on wg0 → dokploy (wg0 10.50.0.1)" },
  { stage: "WireGuard", hop: 1, evidence: "relay01 10.50.0.2 ⇄ dokploy 10.50.0.1 · handshake to 203.0.113.10:51820/udp" },
  { stage: "Firewall", hop: 2, evidence: "Rule 3 (allow tcp 8000 from 10.50.0.0/24) allows TCP 8000 from 10.50.0.2" },
  { stage: "Docker", hop: 3, evidence: "Host TCP 8000 (10.50.0.1) → Docker NAT → checkmk TCP 8000 in 'monitoring'" },
  { stage: "Service", hop: 4, evidence: "'checkmk' (agent-receiver) listens on 0.0.0.0:8000/TCP" },
];

/** Listed with every result: what the simulator could not verify (wording as the product's trace). */
const assumptions = [
  "'checkmk' is running (desired state; not verified against real infrastructure).",
  "Docker-published ports bypass the host INPUT chain; the firewall is assumed to filter them on the forward path.",
];

const blocked = {
  evidence: "No rule matches TCP 8000 from 10.50.0.2; default policy deny applies",
  code: "FIREWALL_DEFAULT_DENY",
  action: "Allow TCP 8000 from 10.50.0.2 on 'fw-dokploy'.",
};

type Scenario = "healthy" | "blocked";

/**
 * Scroll drives the run: the section pins, the packet moves hop by hop and every layer is checked as it is
 * reached. "Run simulation" replays it; the scenario switch shows how a failure is explained.
 */
export function SimulationSection() {
  const section = useRef<HTMLElement>(null);
  const [scenario, setScenario] = useState<Scenario>("healthy");
  const [replaying, setReplaying] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const scrolled = useTransform(scrollYProgress, [0.08, 0.85], [0, 1], { clamp: true });
  const played = useMotionValue(0);

  useMotionValueChange(scrolled, (value) => {
    if (!replaying) {
      setProgressValue(value);
    }
  });
  useMotionValueChange(played, (value) => {
    if (replaying) {
      setProgressValue(value);
    }
  });

  const replay = () => {
    setReplaying(true);
    played.set(0);
    void animate(played, 1, { duration: 3.2, ease: "linear" }).then(() => setReplaying(false));
  };

  const failedAt = scenario === "blocked" ? 3 : null;
  const reachedLayers = Math.floor(progressValue * layers.length + 0.0001);
  const stopped = failedAt !== null && reachedLayers > failedAt;
  const evaluated = failedAt !== null ? Math.min(reachedLayers, failedAt + 1) : reachedLayers;
  const done = progressValue >= 0.999 || stopped;
  // The packet never travels past the hop where the run fails.
  const travelled = progressValue * (hops.length - 1);
  const packetHop = failedAt !== null ? Math.min(travelled, layers[failedAt].hop) : travelled;

  return (
    <section id="simulation" ref={section} className="relative mt-24 lg:mt-0 lg:h-[calc(100svh*3)]">
      <div className="lg:sticky lg:top-0 lg:flex lg:min-h-svh lg:items-center lg:pt-24 lg:pb-8">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>Simulation</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Know it works <span className="text-brand-gradient">before you deploy it.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div role="radiogroup" aria-label="Scenario" className="flex rounded-md border border-border bg-surface p-1">
                {(["healthy", "blocked"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={scenario === option}
                    onClick={() => setScenario(option)}
                    className={cn(
                      "rounded-sm px-3 py-1.5 text-sm transition-colors",
                      scenario === option ? "bg-surface-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option === "healthy" ? "As designed" : "Firewall blocks"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={replay}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-hover"
              >
                {done ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                Run simulation
              </button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <Panel className="bg-grid relative flex flex-col overflow-hidden">
              <PanelHeader
                title="relay01 → checkmk · tcp 8000"
                meta={<span className="font-mono text-[11px] text-faint-foreground">reference topology</span>}
              />
              <Path hopsReached={packetHop} failedHop={stopped && failedAt !== null ? layers[failedAt].hop : null} />
              <div className="mt-auto border-t border-border bg-background/60 px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-faint-foreground">Assumptions</p>
                <ul
                  className={cn(
                    "mt-2 space-y-1.5 font-mono text-xs leading-5 transition-colors",
                    done && !stopped ? "text-muted-foreground" : "text-faint-foreground",
                  )}
                >
                  {assumptions.map((assumption) => (
                    <li key={assumption}>· {assumption}</li>
                  ))}
                </ul>
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Connection analysis"
                meta={
                  done ? (
                    stopped ? (
                      <StatusMark status="failed" label="Unreachable" />
                    ) : (
                      <StatusMark status="passed" label="Reachable" />
                    )
                  ) : (
                    <span className="font-mono text-[11px] text-faint-foreground">evaluating…</span>
                  )
                }
              />
              <ol className="divide-y divide-border">
                {layers.map((layer, index) => {
                  const failed = failedAt === index && stopped;
                  const status = index < evaluated ? (failed ? "failed" : "passed") : "pending";
                  return (
                    <li key={layer.stage} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-4 px-4 py-3">
                      <StatusMark status={status} label={layer.stage} />
                      <span
                        className={cn(
                          "font-mono text-xs leading-5 transition-colors",
                          status === "pending" ? "text-faint-foreground" : "text-muted-foreground",
                        )}
                      >
                        {status === "pending" ? "—" : failed ? blocked.evidence : layer.evidence}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {stopped && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-border px-4 py-3 font-mono text-xs"
                >
                  <span className="text-error">{blocked.code}</span>
                  <span className="text-muted-foreground"> → {blocked.action}</span>
                </motion.div>
              )}
            </Panel>
          </div>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Anything the simulator cannot evaluate is reported as unknown, never as reachable. Every assumption is listed.
          </p>
        </Container>
      </div>
    </section>
  );
}

function Path({ hopsReached, failedHop }: { hopsReached: number; failedHop: number | null }) {
  const percent = (hopsReached / (hops.length - 1)) * 100;

  return (
    <div className="relative px-6 py-12 sm:px-10">
      <div className="relative">
        <div aria-hidden className="absolute top-6 right-6 left-6 h-px bg-border-strong" />
        <div
          aria-hidden
          className={cn("absolute top-6 left-6 h-px transition-[width] duration-150", failedHop !== null ? "bg-error" : "bg-brand")}
          style={{ width: `calc((100% - 3rem) * ${percent / 100})` }}
        />
        <div
          aria-hidden
          className="absolute top-6 z-10 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-150"
          style={{ left: `calc(1.5rem + (100% - 3rem) * ${percent / 100})` }}
        >
          <span
            className={cn(
              "block size-3 rounded-full ring-4",
              failedHop !== null ? "bg-error ring-error/25" : "bg-foreground ring-brand/40",
            )}
          />
        </div>

        <ol className="relative flex justify-between">
          {hops.map((hop, index) => {
            const reached = index <= hopsReached + 0.001;
            const failed = failedHop === index;
            return (
              <li key={hop.name} className="flex w-12 flex-col items-center text-center">
                <span
                  className={cn(
                    "grid size-12 place-items-center rounded-md border bg-background transition-colors duration-300",
                    failed ? "border-error text-error" : reached ? "border-brand text-brand" : "border-border-strong text-muted-foreground",
                  )}
                >
                  <hop.icon className="size-5" aria-hidden />
                </span>
                <span className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-faint-foreground">{hop.kind}</span>
                <span className="mt-1 text-sm whitespace-nowrap text-foreground">{hop.name}</span>
                <span className="mt-0.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground">{hop.value}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
