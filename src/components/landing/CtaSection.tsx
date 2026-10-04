import { BlurText } from "./BlurText";
import { ButtonLink } from "./primitives";

interface Action {
  href: string;
  label: string;
}

/** The closing card: the hero's light again, on the light page. */
export function CtaSection({
  title = "Build infrastructure with confidence.",
  tagline = "Design it · Simulate it · Deploy it · Verify it",
  primary,
  secondary,
}: {
  title?: string;
  tagline?: string;
  primary: Action;
  secondary?: Action;
}) {
  return (
    <section id="contact" className="relative px-3 pt-[var(--section-gap)] pb-6 sm:px-5">
      <div
        data-theme="dark"
        className="theme-dark relative isolate mx-auto max-w-[1600px] overflow-hidden rounded-[var(--radius-card)] bg-background px-6 py-28 text-foreground sm:py-36"
      >
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -right-[15%] -bottom-[60%] h-[130%] w-[90%] rounded-[50%] bg-brand-deep blur-[90px]" />
          <div className="absolute -right-[5%] -bottom-[75%] h-[100%] w-[70%] rounded-[50%] bg-brand blur-[80px]" />
          <div className="absolute -bottom-[85%] left-[20%] h-[80%] w-[50%] rounded-[50%] bg-sky/70 blur-[90px]" />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-5xl font-medium leading-[1] tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            <BlurText text={title} onView />
          </h2>
          <p className="mt-8 font-mono text-sm uppercase tracking-[0.2em] text-foreground/70">{tagline}</p>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <ButtonLink href={primary.href} variant="light" arrow>
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="ghost">
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
