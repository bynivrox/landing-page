import type { Metadata } from "next";
import { Check } from "lucide-react";
import { BlurText } from "@/components/landing/BlurText";
import { CtaSection } from "@/components/landing/CtaSection";
import { Container, SectionHeading } from "@/components/landing/primitives";
import { Reveal } from "@/components/landing/Reveal";
import { Comparison } from "@/components/pricing/Comparison";
import { CurrencySwitch } from "@/components/pricing/currency";
import { Faq } from "@/components/pricing/Faq";
import { PlanCards } from "@/components/pricing/PlanCards";
import { included } from "@/lib/plans";
import { loadPrices } from "@/lib/pricing-source";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing · Nivrox",
  description: "Nivrox plans: Community (self-hosted, free) and Professional, Business and Enterprise (hosted by Nivrox).",
};

export default async function PricingPage() {
  const prices = await loadPrices();

  return (
    <main>
      {/* Dark and lit like the home hero; the plan cards rise out of it into the light page. */}
      <section data-theme="dark" className="relative isolate overflow-hidden pt-40 pb-72">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-background" />
          <div className="absolute -bottom-[40%] left-[10%] h-[110%] w-[80%] rounded-[50%] bg-brand-deep blur-[90px]" />
          <div className="absolute -bottom-[60%] left-[25%] h-[90%] w-[55%] rounded-[50%] bg-brand blur-[80px]" />
          <div className="absolute -bottom-[75%] left-[35%] h-[70%] w-[35%] rounded-[50%] bg-sky/80 blur-[90px]" />
        </div>
        <div aria-hidden className="fade-to-light absolute inset-x-0 bottom-0 -z-10 h-[60%]" />
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/60">Pricing</p>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.02] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            <BlurText text="Plans that grow with" className="block text-foreground/55" />
            <BlurText text="your infrastructure." className="block" delay={0.5} />
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-muted-foreground text-pretty">
            Run Community on your own servers for free, or let us host Nivrox for you. Every plan includes the complete modeling, simulation
            and configuration engine.
          </p>
          <CurrencySwitch className="mt-8" />
        </div>
      </section>

      <div data-theme="light" className="theme-light">
        <div className="relative z-10 mx-auto -mt-56 max-w-7xl px-3 sm:px-6">
          <PlanCards links={{ "self-host": site.selfHostUrl, signup: site.signupUrl, contact: site.contactUrl }} prices={prices} />
        </div>

        <section id="included" className="relative pt-[var(--section-gap)]">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
              <SectionHeading
                eyebrow="In every plan"
                title={
                  <>
                    The product is never <span className="text-brand-gradient">held back.</span>
                  </>
                }
              >
                Plans differ in scale, hosting and the step from simulation to deployment, never in the engine. Community gets the same
                simulator as Enterprise.
              </SectionHeading>
              <ul className="grid content-start gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {included.map((item, index) => (
                  <li key={item} className="bg-surface p-5">
                    <Reveal delay={(index % 2) * 0.05}>
                      <Check className="size-4 text-brand" aria-hidden />
                      <p className="mt-3 text-sm leading-relaxed text-foreground">{item}</p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        <section id="compare" className="relative pt-[var(--section-gap)]">
          <Container>
            <SectionHeading
              eyebrow="Compare"
              title={
                <>
                  Every plan, <span className="text-brand-gradient">side by side.</span>
                </>
              }
            >
              Exactly what each plan enforces in the product.
            </SectionHeading>
            <div className="mt-12">
              <Comparison prices={prices} />
            </div>
          </Container>
        </section>

        <section id="faq" className="relative pt-[var(--section-gap)]">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionHeading
                eyebrow="Plans & hosting"
                title={
                  <>
                    Questions, <span className="text-brand-gradient">answered.</span>
                  </>
                }
              />
              <Faq />
            </div>
          </Container>
        </section>

        <CtaSection
          title="Not sure which plan fits?"
          tagline="Tell us about your environment"
          primary={{ href: site.signupUrl, label: "Start with Professional" }}
          secondary={{ href: site.contactUrl, label: "Contact sales" }}
        />
      </div>
    </main>
  );
}
