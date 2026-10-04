import { ArrowRight, AtSign, BrickWall, Container as DockerIcon, Layers, Radar, Shield, Split, Terminal } from "lucide-react";
import Link from "next/link";
import { BlurText } from "./BlurText";
import { DiscoveryDrawing, LayersDrawing, PlanDrawing, VerifyDrawing } from "./IsoIllustrations";
import { Container } from "./primitives";

/** The stack Nivrox understands today: capability labels, not customer logos. */
const stack = [
  { icon: Terminal, name: "Linux" },
  { icon: DockerIcon, name: "Docker" },
  { icon: Layers, name: "Compose" },
  { icon: Shield, name: "WireGuard" },
  { icon: Split, name: "Traefik" },
  { icon: BrickWall, name: "nftables" },
  { icon: AtSign, name: "DNS" },
  { icon: Radar, name: "Checkmk" },
];

const principles = [
  {
    Drawing: LayersDrawing,
    title: "Every layer, evaluated",
    copy: "DNS, routing, WireGuard, firewall, Docker and the listener. A connection only counts as reachable when every layer passes.",
  },
  {
    Drawing: DiscoveryDrawing,
    title: "Discovered, not assumed",
    copy: "Agents report what really runs on a server. Nothing found there is treated as free to overwrite.",
  },
  {
    Drawing: PlanDrawing,
    title: "Only what must change",
    copy: "A plan touches resources Nivrox manages and nothing else. A file it did not write blocks the plan instead.",
  },
  {
    Drawing: VerifyDrawing,
    title: "Verified afterwards",
    copy: "Every deployment ends by checking the result, with a backup underneath so rollback stays possible.",
  },
];

/** The first light section: four principles, each with an isometric drawing that draws itself in. */
export function LayersSection() {
  return (
    <section id="layers" data-theme="light" className="relative isolate pt-24 pb-12">
      <div aria-hidden className="haze-from-hero absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <Container>
        <div className="mb-24 flex flex-wrap items-center gap-x-10 gap-y-4 border-b border-border pb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Built for the stack you already run</p>
          <ul className="flex flex-wrap gap-x-8 gap-y-3" aria-label="Supported stack">
            {stack.map((item) => (
              <li key={item.name} className="flex items-center gap-2 text-foreground/80">
                <item.icon className="size-4" aria-hidden />
                <span className="text-base font-medium tracking-tight">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <h2 className="max-w-3xl font-display text-4xl font-medium leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
          <BlurText text="Every change, understood" className="block" onView />
          <BlurText text="before it reaches a server." className="text-brand-gradient block" onView delay={0.5} />
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Nivrox models what you run, simulates what you plan, and verifies what happened.
        </p>

        <div className="mt-16 grid border-y border-border sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <article
              key={principle.title}
              className="flex flex-col border-border p-6 sm:border-l sm:first:border-l-0 sm:[&:nth-child(3)]:border-l-0 lg:[&:nth-child(3)]:border-l"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand/70">
                Layer {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-6 px-4">
                <principle.Drawing delay={index * 0.25} />
              </div>
              <h3 className="mt-8 text-lg font-medium tracking-tight">{principle.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{principle.copy}</p>
            </article>
          ))}
        </div>

        <Link href="#workflow" className="group mt-10 inline-flex items-center gap-2 text-sm font-medium text-foreground">
          See the workflow <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Container>
    </section>
  );
}
