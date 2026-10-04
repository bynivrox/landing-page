"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BlurText } from "./BlurText";
import { HeroTopology } from "./HeroTopology";

/**
 * Dark, swept by Nivrox-blue light that dissolves into the light page below. The headline resolves out of a blur;
 * the platform drifts up and the light grows as the hero scrolls away.
 */
export function Hero({ trialUrl }: { trialUrl: string }) {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const platformY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const lightScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section id="top" ref={section} data-theme="dark" className="relative isolate min-h-[max(100svh,760px)] overflow-hidden">
      {/* Light: black, swept by brand blue from the lower right, settling into the page's light surface. */}
      <motion.div aria-hidden className="absolute inset-0 -z-10 origin-bottom-right" style={{ scale: lightScale }}>
        <div className="absolute inset-0 bg-background" />
        <div className="absolute -right-[20%] -bottom-[35%] h-[120%] w-[110%] rounded-[50%] bg-brand-deep blur-[90px]" />
        <div className="absolute -right-[10%] -bottom-[45%] h-[95%] w-[85%] rounded-[50%] bg-brand blur-[80px]" />
        <div className="absolute -right-[5%] -bottom-[55%] h-[70%] w-[70%] rounded-[50%] bg-sky/80 blur-[90px]" />
        <div className="absolute -bottom-[30%] -left-[20%] h-[60%] w-[50%] rounded-[50%] bg-brand/50 blur-[100px]" />
      </motion.div>
      <div aria-hidden className="fade-to-light absolute inset-x-0 bottom-0 -z-10 h-[55%]" />

      <motion.div
        style={{ y: platformY }}
        className="pointer-events-none absolute top-[16%] right-[-4%] hidden w-[60%] max-w-[980px] lg:block"
      >
        <HeroTopology className="w-full" />
      </motion.div>

      <motion.div style={{ opacity: contentOpacity }} className="relative mx-auto flex min-h-[inherit] max-w-7xl flex-col px-6 pt-36 pb-16">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-sm border border-border-strong bg-foreground/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">
            Visual infrastructure control plane
          </span>
          <span className="flex items-center gap-2 rounded-sm border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Simulation:
            <span className="size-1.5 bg-success" aria-hidden />
            <span className="text-foreground">relay01 → checkmk reachable</span>
          </span>
        </div>

        <h1 className="mt-8 max-w-[46rem] font-display text-5xl font-medium leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[3.9rem] xl:text-[4.25rem]">
          <BlurText text="Understand infrastructure" className="block text-foreground/55" delay={0.15} />
          <BlurText text="before you change it." className="block text-foreground" delay={0.75} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          Model the environments you already run, simulate every change layer by layer, deploy it through an approved plan and verify what
          actually happened.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.45 }}
          className="mt-10 flex flex-wrap items-center gap-6"
        >
          <Link
            href={trialUrl}
            className="group inline-flex h-12 items-stretch gap-1 rounded-md text-sm font-medium text-brand-foreground"
          >
            <span className="flex flex-col justify-center rounded-md bg-gradient-to-r from-brand-soft to-brand px-5 leading-tight transition-[filter] group-hover:brightness-110">
              Start your free trial
              <span className="text-xs font-normal opacity-80">One month of Business</span>
            </span>
            <span className="grid w-12 place-items-center rounded-md bg-brand transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" />
            </span>
          </Link>
          <Link
            href="#layers"
            className="text-sm text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Explore the platform
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
