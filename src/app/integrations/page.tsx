import type { Metadata } from "next";
import { BlurText } from "@/components/landing/BlurText";
import { CtaSection } from "@/components/landing/CtaSection";
import { Container, Eyebrow, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/Reveal";
import { DepthLegend, IntegrationCard } from "@/components/integrations/IntegrationCard";
import { available, capabilities, planned, platform } from "@/lib/integrations";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Integrations · Nivrox",
  description:
    "What Nivrox models, simulates, generates, deploys and discovers today (Linux, Docker, WireGuard, nftables, DNS, Checkmk, Traefik) and what is planned.",
};

export default function IntegrationsPage() {
  return (
    <main>
      <section data-theme="dark" className="relative isolate overflow-hidden pt-40 pb-40">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -bottom-[55%] left-[5%] h-[100%] w-[70%] rounded-[50%] bg-brand-deep blur-[90px]" />
          <div className="absolute -bottom-[70%] left-[30%] h-[80%] w-[50%] rounded-[50%] bg-brand blur-[80px]" />
          <div className="absolute -bottom-[80%] right-[5%] h-[60%] w-[35%] rounded-[50%] bg-sky/70 blur-[90px]" />
        </div>
        <div aria-hidden className="fade-to-light absolute inset-x-0 bottom-0 -z-10 h-[55%]" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">Integrations</p>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            <BlurText text="Deep on the stack" className="block text-foreground/55" />
            <BlurText text="you already run." className="block" delay={0.5} />
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-muted-foreground text-pretty">
            Nivrox goes deep on a focused stack instead of wide on everything. Each integration shows exactly how far it goes, from the
            canvas to a verified deployment, and the simulator never reports success for a layer it cannot check.
          </p>
        </div>
      </section>

      <div data-theme="light" className="theme-light">
        <section id="depth" className="relative">
          <Container>
            <ol className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
              {capabilities.map((capability, index) => (
                <li key={capability.key} className="bg-surface p-5">
                  <Reveal delay={index * 0.05}>
                    <span className="font-mono text-[11px] text-faint-foreground">{String(index + 1).padStart(2, "0")}</span>
                    <p className="mt-2 font-display text-lg font-medium tracking-[-0.02em] text-foreground">{capability.label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{capability.description}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section id="available" className="relative pt-[var(--section-gap)]">
          <Container>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Available"
                title={
                  <>
                    Built and <span className="text-brand-gradient">in the product.</span>
                  </>
                }
              >
                Every integration here is part of the one canonical model, so validation, simulation, generated configuration and
                deployment plans all agree.
              </SectionHeading>
              <DepthLegend />
            </div>

            <div className="mt-16 grid gap-16">
              {available.map((group) => (
                <div key={group.title} className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
                  <div>
                    <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-foreground">{group.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                  </div>
                  <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
                    {group.integrations.map((integration, index) => (
                      <li key={integration.name} className="bg-surface md:odd:last:col-span-2">
                        <Reveal delay={(index % 2) * 0.05} className="h-full">
                          <IntegrationCard integration={integration} />
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-[-0.03em] text-foreground">Access & identity</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">How Nivrox reaches servers, and who signs in.</p>
                </div>
                <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2">
                  {platform.map((item) => (
                    <li key={item.name} className="bg-surface p-6">
                      <h4 className="font-display text-xl font-medium tracking-[-0.02em] text-foreground">{item.name}</h4>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{item.summary}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>

        <section id="roadmap" className="relative pt-[var(--section-gap)]">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionHeading
                eyebrow="Planned"
                title={
                  <>
                    Next, <span className="text-brand-gradient">not yet built.</span>
                  </>
                }
              >
                Nivrox sits above the tools you already use rather than replacing them. These are planned; what comes first follows
                what customers run. No dates are promised.
              </SectionHeading>
              <dl className="divide-y divide-border border-y border-border">
                {planned.map((group) => (
                  <div key={group.title} className="grid gap-3 py-5 sm:grid-cols-[11rem_1fr]">
                    <dt>
                      <Eyebrow>{group.title}</Eyebrow>
                    </dt>
                    <dd className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span key={item} className="rounded-sm border border-border-strong px-2 py-1 font-mono text-xs text-muted-foreground">
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </section>

        <CtaSection
          title="Missing what you run?"
          tagline="Tell us about your environment"
          primary={{ href: site.contactUrl, label: "Request an integration" }}
        />
      </div>
    </main>
  );
}
