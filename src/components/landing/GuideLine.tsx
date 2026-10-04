"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sectionNames } from "@/lib/sections";
import { cn } from "@/lib/utils";

interface Stop {
  name: string;
  x: number;
  y: number;
}

interface Route {
  d: string;
  height: number;
  stops: Stop[];
}

interface Dot {
  x: number;
  y: number;
  travelled: number;
}

/** Where in the viewport the dot sits: the line is "here" at this height. */
const READING_LINE = 0.5;
/** Sections closer together than this share a turn (the wave would kink). */
const MIN_STEP = 240;

/**
 * A line that meanders through the landing page from under the hero to the closing card: one continuous wave that
 * turns beside each section heading, alternating sides. It runs behind the content and is kept faint so it never
 * competes with text (cards cover it, so it reads as flowing underneath). The part already travelled is a little
 * stronger than the dashed way ahead; a dot marks "You're here" and the next section is named at its turn. Labels
 * are bare brand-blue text with a soft halo in the page colour, so they stay legible where the line crosses content;
 * where the gutter is too narrow they show only while scrolling.
 *
 * Render it as the first child of a `relative isolate` wrapper: the line sits at -z-10 inside it, the markers on top.
 */
export function GuideLine() {
  const layer = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);
  const [moving, setMoving] = useState(false);
  const [width, setWidth] = useState(0);

  // Lay out the route in the wrapper's coordinates.
  useEffect(() => {
    const wrapper = layer.current?.parentElement;
    if (!wrapper) {
      return;
    }
    const measure = () => {
      const pageWidth = wrapper.clientWidth;
      setWidth(pageWidth);
      const origin = wrapper.getBoundingClientRect().top;
      const end = wrapper.querySelector<HTMLElement>("#contact > *");
      if (!end || pageWidth < 1024) {
        setRoute(null);
        return;
      }

      // Turns sit just outside the content column (max-w-7xl with px-6), beside each section's heading.
      const contentLeft = Math.max(0, (pageWidth - 1280) / 2) + 24;
      const inset = Math.max(14, contentLeft - 30);
      const sides = [inset, pageWidth - inset];
      const stops: Stop[] = [];
      let side = 0;
      let last = 0;
      for (const section of wrapper.querySelectorAll<HTMLElement>("section[id]")) {
        const name = sectionNames[section.id];
        if (!name || section.id === "contact") {
          continue;
        }
        const heading = section.querySelector("h2") ?? section;
        const y = heading.getBoundingClientRect().top - origin;
        if (y - last < MIN_STEP) {
          continue;
        }
        stops.push({ name, x: sides[side], y });
        side = 1 - side;
        last = y;
      }
      const card = end.getBoundingClientRect().top - origin;
      stops.push({ name: sectionNames.contact, x: pageWidth / 2, y: card });

      // Start centred just under the hero, then one smooth S between every pair of turns.
      let previous = { x: pageWidth / 2, y: 0 };
      let d = `M ${previous.x} ${previous.y}`;
      for (const stop of stops) {
        d += ` ${wave(previous, stop)}`;
        previous = stop;
      }
      setRoute(stops.length > 1 ? { d, height: card + 24, stops } : null);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Find the point on the route at the reading line (the route only ever runs downwards, so search by length).
  const follow = useCallback(() => {
    const element = path.current;
    const wrapper = layer.current?.parentElement;
    if (!element || !wrapper || !route) {
      return;
    }
    const target = window.innerHeight * READING_LINE - wrapper.getBoundingClientRect().top;
    let low = 0;
    let high = element.getTotalLength();
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (element.getPointAtLength(mid).y < target) {
        low = mid;
      } else {
        high = mid;
      }
    }
    const point = element.getPointAtLength(low);
    setDot({ x: point.x, y: point.y, travelled: low });
  }, [route]);

  useEffect(() => {
    let frame = 0;
    let idle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(follow);
      setMoving(true);
      clearTimeout(idle);
      idle = setTimeout(() => setMoving(false), 1400);
    };

    frame = requestAnimationFrame(follow);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(idle);
    };
  }, [follow]);

  // The section is the last turn passed; the next turn is named unless the dot is about to reach it (its label would sit on the dot's).
  const current = dot ? route?.stops.findLast((stop) => stop.y <= dot.y + 1)?.name : undefined;
  const next = dot ? route?.stops.find((stop) => stop.y > dot.y + 80) : undefined;
  const onLeft = dot ? dot.x < width / 2 : true;
  const roomy = dot ? Math.min(dot.x, width - dot.x) > 170 : false;

  return (
    <>
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden lg:block"
        style={{ height: route?.height ?? 0 }}
      >
        {route && (
          <svg className="absolute inset-0 size-full overflow-visible" fill="none">
            <path d={route.d} stroke="var(--brand)" strokeOpacity={0.09} strokeWidth={1.5} strokeDasharray="3 7" strokeLinecap="round" />
            <path
              ref={path}
              d={route.d}
              stroke="var(--brand)"
              strokeOpacity={0.2}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${dot?.travelled ?? 0} 1000000`}
            />
          </svg>
        )}
      </div>

      {route && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden lg:block" style={{ height: route.height }}>
          <svg className="absolute inset-0 size-full overflow-visible" fill="none">
            {route.stops.map((stop) => (
              <circle
                key={stop.name}
                cx={stop.x}
                cy={stop.y}
                r={3}
                fill={dot && stop.y <= dot.y ? "var(--brand)" : "var(--background)"}
                stroke="var(--brand)"
                strokeOpacity={0.6}
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {next && (
            <span
              className="absolute font-mono text-[10px] uppercase tracking-[0.18em] whitespace-nowrap text-brand/60 [text-shadow:0_0_2px_var(--background),0_0_8px_var(--background),0_0_14px_var(--background)]"
              style={{
                top: next.y,
                left: next.x,
                transform:
                  next.x === width / 2 ? "translate(-50%, calc(-100% - 10px))" : next.x < width / 2 ? "translate(12px, -50%)" : "translate(calc(-100% - 12px), -50%)",
              }}
            >
              Next · {next.name}
            </span>
          )}

          {dot && (
            <div className="absolute" style={{ top: dot.y, left: dot.x }}>
              <span className="absolute top-0 left-0 size-2.5 -translate-1/2 rounded-full bg-brand shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_25%,transparent)]" />
              <span className="absolute top-0 left-0 size-2.5 -translate-1/2 animate-ping rounded-full bg-brand/60 motion-reduce:hidden" />
              <span
                className={cn(
                  "absolute top-0 -translate-y-1/2 whitespace-nowrap transition-opacity duration-300 [text-shadow:0_0_2px_var(--background),0_0_8px_var(--background),0_0_14px_var(--background)]",
                  roomy || moving ? "opacity-100" : "opacity-0",
                  onLeft === roomy ? "right-4 text-right" : "left-4",
                )}
              >
                <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-brand/70">You&apos;re here</span>
                {current && <span className="block text-xs font-medium text-brand">{current}</span>}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/**
 * One S from a turn to the next: it leaves and arrives vertically (so every turn is round, never a corner) and the
 * control arms span half the drop, which spreads the bend evenly like a sine wave instead of bunching it at the ends.
 */
function wave(from: { x: number; y: number }, to: { x: number; y: number }) {
  const reach = (to.y - from.y) * 0.5;
  return `C ${from.x} ${from.y + reach} ${to.x} ${to.y - reach} ${to.x} ${to.y}`;
}
