"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Container, Eyebrow } from "./primitives";

const layers = [
  "network reachability",
  "routes",
  "firewall rules",
  "DNS",
  "Docker networking",
  "published ports",
  "reverse proxies",
  "WireGuard peers",
  "service listeners",
  "existing applications",
];

/** The question from the positioning, with the layers one small change can touch lighting up as you scroll. */
export function ProblemSection() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start 80%", "end 60%"] });

  return (
    <section id="problem" ref={section} className="relative pt-[var(--section-gap)]">
      <Container>
        <Eyebrow>The problem</Eyebrow>
        <h2 className="mt-6 max-w-5xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-balance sm:text-5xl lg:text-[4.25rem]">
          The hard part is not deploying something. It is knowing{" "}
          <span className="text-brand-gradient">what happens when you change something that already exists.</span>
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            Real environments mix servers, Docker, WireGuard, firewalls, DNS, reverse proxies, monitoring and years of manual configuration.
            A small change can ripple through all of it.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Layers a single change can affect">
            {layers.map((layer, index) => (
              <Layer key={layer} index={index} count={layers.length} progress={scrollYProgress}>
                {layer}
              </Layer>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function Layer({
  children,
  index,
  count,
  progress,
}: {
  children: string;
  index: number;
  count: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const start = (index / count) * 0.8;
  const opacity = useTransform(progress, [start, start + 0.12], [0.28, 1]);
  const borderColor = useTransform(progress, [start, start + 0.12], ["var(--border)", "var(--brand)"]);

  return (
    <motion.li style={{ opacity, borderColor }} className="rounded-md border bg-surface px-3.5 py-2 font-mono text-sm text-foreground">
      {children}
    </motion.li>
  );
}
