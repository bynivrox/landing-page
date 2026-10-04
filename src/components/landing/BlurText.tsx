"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Text that resolves out of a blur, letter by letter, when it first comes into view. Words never break apart;
 * screen readers get the plain text once.
 */
export function BlurText({
  text,
  className,
  delay = 0,
  stagger = 0.028,
  onView = false,
}: {
  text: string;
  className?: string;
  /** Seconds before the first letter. */
  delay?: number;
  stagger?: number;
  /** Start when scrolled into view instead of on load. */
  onView?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  let index = 0;
  const words = text.split(" ");
  const hidden = { opacity: 0, filter: "blur(12px)", y: "0.12em" };
  const shown = { opacity: 1, filter: "blur(0px)", y: "0em" };

  return (
    <span className={cn("inline", className)} aria-label={text} role="text">
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((letter) => {
            const at = delay + index++ * stagger;
            return (
              <motion.span
                key={`${letter}-${at}`}
                className="inline-block"
                initial={hidden}
                {...(onView ? { whileInView: shown, viewport: { once: true, margin: "-10% 0px" } } : { animate: shown })}
                transition={{ duration: 0.55, delay: at, ease: [0.22, 1, 0.36, 1] }}
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
