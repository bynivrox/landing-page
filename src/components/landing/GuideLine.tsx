"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sectionNames } from "@/lib/sections";

interface Point {
  x: number;
  y: number;
}

interface Route {
  d: string;
  height: number;
}

interface Dot extends Point {
  travelled: number;
}

/** Where in the viewport the dot sits: the line is "here" at this height. */
const READING_LINE = 0.5;
/** Sections closer together than this share a turn (the wave would kink). */
const MIN_STEP = 240;

/**
 * A line that meanders through the landing page from under the hero to the closing card: one continuous wave that
 * turns beside each section heading, alternating sides. The part already travelled is a little stronger than the
 * dashed way ahead, and a dot marks where you are. It all runs behind the content and is kept faint so it never
 * competes with text (cards cover it, so it reads as flowing underneath).
 *
 * Render it as the first child of a `relative isolate` wrapper: it sits at -z-10 inside it, under every section.
 */
export function GuideLine() {
  const layer = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [dot, setDot] = useState<Dot | null>(null);

  // Lay out the route in the wrapper's coordinates.
  useEffect(() => {
    const wrapper = layer.current?.parentElement;
    if (!wrapper) {
      return;
    }
    const measure = () => {
      const width = wrapper.clientWidth;
      const origin = wrapper.getBoundingClientRect().top;
      const end = wrapper.querySelector<HTMLElement>("#contact > *");
      if (!end || width < 1024) {
        setRoute(null);
        return;
      }

      // Turns sit just outside the content column (max-w-7xl with px-6), beside each section's heading.
      const contentLeft = Math.max(0, (width - 1280) / 2) + 24;
      const inset = Math.max(14, contentLeft - 30);
      const sides = [inset, width - inset];
      const turns: Point[] = [];
      let last = 0;
      for (const section of wrapper.querySelectorAll<HTMLElement>("section[id]")) {
        if (!sectionNames[section.id] || section.id === "contact") {
          continue;
        }
        const y = (section.querySelector("h2") ?? section).getBoundingClientRect().top - origin;
        if (y - last < MIN_STEP) {
          continue;
        }
        turns.push({ x: sides[turns.length % 2], y });
        last = y;
      }
      const card = end.getBoundingClientRect().top - origin;
      turns.push({ x: width / 2, y: card });

      // Start centred just under the hero, then one smooth S between every pair of turns.
      let previous: Point = { x: width / 2, y: 0 };
      let d = `M ${previous.x} ${previous.y}`;
      for (const turn of turns) {
        d += ` ${wave(previous, turn)}`;
        previous = turn;
      }
      setRoute(turns.length > 1 ? { d, height: card + 24 } : null);
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
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(follow);
    };

    frame = requestAnimationFrame(follow);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [follow]);

  return (
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
      {route && dot && (
        <div className="absolute opacity-20" style={{ top: dot.y, left: dot.x }}>
          <span className="absolute top-0 left-0 size-2.5 -translate-1/2 rounded-full bg-brand shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_25%,transparent)]" />
          <span className="absolute top-0 left-0 size-2.5 -translate-1/2 animate-ping rounded-full bg-brand/60 motion-reduce:hidden" />
        </div>
      )}
    </div>
  );
}

/**
 * One S from a turn to the next: it leaves and arrives vertically (so every turn is round, never a corner) and the
 * control arms span half the drop, which spreads the bend evenly like a sine wave instead of bunching it at the ends.
 */
function wave(from: Point, to: Point) {
  const reach = (to.y - from.y) * 0.5;
  return `C ${from.x} ${from.y + reach} ${to.x} ${to.y - reach} ${to.x} ${to.y}`;
}
