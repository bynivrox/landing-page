"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { BadgeCheck, FileClock, Fingerprint, KeyRound, ListChecks, LockKeyhole, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { Container, SectionHeading } from "./primitives";
import { Reveal } from "./Reveal";

/** Only capabilities the product has today (no certifications, no unsupported claims). */
const capabilities = [
  {
    icon: Fingerprint,
    name: "Fingerprint-approved agents",
    detail: "An enrollment token alone never grants trust; an admin confirms the key fingerprint.",
  },
  { icon: KeyRound, name: "Signed agent requests", detail: "ECDSA P-256 signatures with single-use nonces instead of shared secrets." },
  {
    icon: ListChecks,
    name: "Typed commands only",
    detail: "Agents run a fixed set of operations, never arbitrary shell, and refuse expired commands.",
  },
  { icon: BadgeCheck, name: "Approval workflows", detail: "Engineers plan, administrators approve, operators deploy." },
  {
    icon: Users,
    name: "Role-based access",
    detail: "Five roles from Owner to Viewer, enforced on the server, plus OpenID Connect single sign-on.",
  },
  { icon: FileClock, name: "Audit log", detail: "Every plan, approval, deployment and rollback is recorded and exportable." },
  {
    icon: LockKeyhole,
    name: "No secrets in topologies",
    detail: "Keys are injected at deployment; private WireGuard keys never leave the server.",
  },
  { icon: RotateCcw, name: "Backups and rollback", detail: "Each deployment backs up what it changes and can restore it." },
];

const chain = ["You", "Control plane", "Approval", "Deployment plan", "Server agent", "Verification"];

export function SecuritySection() {
  // One trigger for the whole chain, so fast scrolling never leaves steps unlit.
  const chainRef = useRef<HTMLOListElement>(null);
  const inView = useInView(chainRef, { once: true, margin: "0px 0px -20% 0px" });

  return (
    <section id="security" className="relative pt-[var(--section-gap)]">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <SectionHeading
              eyebrow="Security & control"
              title={
                <>
                  Control <span className="text-brand-gradient">every change.</span>
                </>
              }
            >
              Nivrox is built to be trusted with production: every change is authenticated, reviewed, recorded and reversible.
            </SectionHeading>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
              {capabilities.map((capability, index) => (
                <li key={capability.name} className="bg-background p-5">
                  <Reveal delay={(index % 2) * 0.06}>
                    <capability.icon className="size-5 text-brand" aria-hidden />
                    <p className="mt-4 font-medium tracking-tight">{capability.name}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{capability.detail}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:pt-40">
            <ol ref={chainRef} className="relative flex flex-col gap-4" aria-label="Path of a change">
              <span aria-hidden className="absolute top-5 bottom-5 left-5 w-px bg-border" />
              <motion.span
                aria-hidden
                className="absolute top-5 left-5 w-px origin-top bg-brand"
                style={{ bottom: "1.25rem" }}
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
              />
              {chain.map((step, index) => (
                <li key={step} className="relative flex items-center gap-5">
                  <motion.span
                    className="relative z-10 grid size-10 place-items-center rounded-md border bg-background font-mono text-xs"
                    initial={{ borderColor: "var(--border-strong)", color: "var(--faint-foreground)" }}
                    animate={inView ? { borderColor: "var(--brand)", color: "var(--brand)" } : undefined}
                    transition={{ delay: 0.25 * index }}
                  >
                    {index === chain.length - 1 ? <ShieldCheck className="size-4" /> : String(index + 1).padStart(2, "0")}
                  </motion.span>
                  <span className="text-lg tracking-tight">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
