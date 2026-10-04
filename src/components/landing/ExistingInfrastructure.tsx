import { Container as DockerIcon, BrickWall, FileCode2, Network, Server, Shield, Split } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Panel, PanelHeader, SectionHeading } from "./primitives";
import { Reveal } from "./Reveal";

type Ownership = "Existing" | "Unknown" | "Imported" | "Managed";

const inventory: { icon: typeof Server; name: string; detail: string; ownership: Ownership }[] = [
  { icon: Network, name: "Network interfaces", detail: "eth0 · wg0 · docker0", ownership: "Existing" },
  { icon: DockerIcon, name: "Docker", detail: "legacy-app, postgres, redis", ownership: "Unknown" },
  { icon: Shield, name: "WireGuard", detail: "/etc/wireguard/wg0.conf", ownership: "Existing" },
  { icon: BrickWall, name: "Firewall", detail: "table inet filter", ownership: "Existing" },
  { icon: Split, name: "Traefik", detail: "dynamic.yml · 4 routers", ownership: "Imported" },
  { icon: FileCode2, name: "Monitoring", detail: "compose: monitoring", ownership: "Managed" },
];

const ownershipTone: Record<Ownership, string> = {
  Existing: "border-border-strong text-foreground",
  Unknown: "border-border text-muted-foreground",
  Imported: "border-warning/40 text-warning",
  Managed: "border-brand/60 text-brand",
};

const flow = ["Discover", "Understand", "Plan", "Change only what is required", "Verify"];

/** Positioning: Nivrox does not assume ownership of infrastructure just because it can see it. */
export function ExistingInfrastructure() {
  return (
    <section id="existing" className="relative pt-[var(--section-gap)]">
      <Container>
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            eyebrow="Existing infrastructure"
            title={
              <>
                Your servers <span className="text-brand-gradient">are not empty.</span>
              </>
            }
          >
            <p>
              Nivrox treats every server as existing infrastructure. Only resources marked <span className="text-brand">Managed</span> may
              change automatically; everything else is left alone unless you explicitly adopt it.
            </p>
            <p className="mt-4">
              Files Nivrox did not write are never overwritten. A deployment that would touch one is blocked and shown to you instead.
            </p>
          </SectionHeading>

          <Reveal>
            <Panel>
              <PanelHeader
                title="prod-eu-01 · discovered"
                meta={<span className="font-mono text-[11px] text-faint-foreground">example data</span>}
              />
              <ul className="divide-y divide-border">
                {inventory.map((item) => (
                  <li key={item.name} className="flex items-center gap-4 px-4 py-3.5">
                    <item.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-foreground">{item.name}</span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">{item.detail}</span>
                    </span>
                    <span
                      className={cn(
                        "rounded-sm border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider",
                        ownershipTone[item.ownership],
                      )}
                    >
                      {item.ownership}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>
        </div>

        <ol
          className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5"
          aria-label="How Nivrox changes existing servers"
        >
          {flow.map((step, index) => (
            <li key={step} className={cn("bg-background px-5 py-6", index === 3 && "bg-surface")}>
              <span className={cn("font-mono text-xs", index === 3 ? "text-brand" : "text-faint-foreground")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-lg font-medium tracking-tight">{step}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
