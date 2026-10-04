"use client";

import { FileCode2 } from "lucide-react";
import { useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { generatedFiles } from "@/lib/generated";
import { cn } from "@/lib/utils";
import { Container, Panel, PanelHeader, SectionHeading } from "./primitives";

/** Where each file comes from in the model: the left half of the split screen. */
const sources: Record<string, { from: string; to: string; via: string }[]> = {
  WireGuard: [
    { from: "dokploy", to: "wg-platform", via: "10.50.0.1 · endpoint 203.0.113.10:51820" },
    { from: "relay01", to: "wg-platform", via: "10.50.0.2 · behind NAT, keepalive" },
  ],
  "Docker Compose": [
    { from: "checkmk", to: "monitoring", via: "agent receiver 8000 → 10.50.0.1:8000" },
    { from: "monitoring", to: "docker", via: "compose project on dokploy" },
  ],
  nftables: [
    { from: "fw-dokploy", to: "dokploy", via: "3 rules · default deny" },
    { from: "rule 3", to: "tcp 8000", via: "from 10.50.0.0/24 only" },
  ],
  "Checkmk agent": [
    { from: "relay01", to: "checkmk", via: "tcp 8000 · hostname" },
    { from: "simulation", to: "reachable", via: "checkmk.example.internal:8000" },
  ],
};

export function ConfigurationSection() {
  const [selected, setSelected] = useState(0);
  const file = generatedFiles[selected];
  const code = useRef<HTMLDivElement>(null);
  const inView = useInView(code, { once: false, margin: "-20% 0px" });
  const reduceMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);
  // Without motion the whole file shows at once.
  const shown = reduceMotion ? file.content.length : typed;

  useEffect(() => {
    if (!inView || reduceMotion) {
      return;
    }

    const length = file.content.length;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const next = Math.min(length, Math.round(((now - started) / 1400) * length));
      setTyped(next);
      if (next < length) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [file, inView, reduceMotion]);

  return (
    <section id="configuration" className="relative pt-[var(--section-gap)]">
      <Container>
        <SectionHeading
          eyebrow="Configuration"
          title={
            <>
              From visual model <span className="text-brand-gradient">to real configuration.</span>
            </>
          }
        >
          Generated from the same model the simulation used: deterministic, additive and free of secrets. Keys and passwords are injected at
          deployment, never stored in the topology.
        </SectionHeading>

        <div role="tablist" aria-label="Generated files" className="mt-12 flex flex-wrap gap-2">
          {generatedFiles.map((candidate, index) => (
            <button
              key={candidate.path}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-controls="generated-file"
              onClick={() => setSelected(index)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors",
                index === selected
                  ? "border-brand bg-brand/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <FileCode2 className="size-4" aria-hidden />
              {candidate.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <Panel className="bg-grid">
            <PanelHeader title="Topology" meta={<span className="font-mono text-[11px] text-faint-foreground">{file.source}</span>} />
            <ul className="space-y-3 p-4">
              {sources[file.label].map((link) => (
                <li key={`${link.from}-${link.to}`} className="rounded-md border border-border bg-background/70 p-3">
                  <div className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-foreground">{link.from}</span>
                    <span aria-hidden className="h-px flex-1 bg-brand/60" />
                    <span className="text-foreground">{link.to}</span>
                  </div>
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">{link.via}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="theme-dark bg-background">
            <PanelHeader
              title={file.path}
              meta={<span className="font-mono text-[11px] text-faint-foreground">generated · LF · deterministic</span>}
            />
            <div ref={code} id="generated-file" role="tabpanel" className="max-h-[26rem] overflow-auto p-4">
              <pre className="font-mono text-[12.5px] leading-6">
                <code>
                  {highlight(file.content.slice(0, shown))}
                  {shown < file.content.length && <span className="animate-caret inline-block h-4 w-2 translate-y-0.5 bg-brand" />}
                </code>
              </pre>
            </div>
          </Panel>
        </div>
      </Container>
    </section>
  );
}

/** Enough highlighting to read the files: comments, sections, keys and injected placeholders. */
function highlight(text: string): ReactNode[] {
  return text.split("\n").map((line, index, lines) => {
    const newline = index < lines.length - 1 ? "\n" : "";
    if (/^\s*#/.test(line)) {
      return (
        <span key={index} className="text-faint-foreground">
          {line}
          {newline}
        </span>
      );
    }

    if (/^\s*\[.+\]\s*$/.test(line)) {
      return (
        <span key={index} className="text-brand">
          {line}
          {newline}
        </span>
      );
    }

    const parts = line.split(/(<injected:[^>]*>|\$CMK_AUTOMATION_SECRET|"[^"]*"|'[^']*')/g);
    const key = /^(\s*[\w.-]+\s*[=:])/.exec(parts[0] ?? "");
    return (
      <span key={index}>
        {parts.map((part, partIndex) => {
          if (part.startsWith("<injected:") || part === "$CMK_AUTOMATION_SECRET") {
            return (
              <span key={partIndex} className="rounded-sm bg-brand/15 text-brand-soft">
                {part}
              </span>
            );
          }

          if (partIndex === 0 && key) {
            return (
              <span key={partIndex}>
                <span className="text-foreground">{key[1]}</span>
                <span className="text-muted-foreground">{part.slice(key[1].length)}</span>
              </span>
            );
          }

          return (
            <span key={partIndex} className={/^["']/.test(part) ? "text-foreground/80" : "text-muted-foreground"}>
              {part}
            </span>
          );
        })}
        {newline}
      </span>
    );
  });
}
