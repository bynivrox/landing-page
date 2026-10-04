"use client";

import { useEffect, useRef, useState } from "react";
import { sectionNames } from "@/lib/sections";

interface Point {
  x: number;
  y: number;
}

interface Route {
  /** The full route (identifies it; it is drawn per segment). */
  d: string;
  /**
   * The route in short pieces, for both the dashed way ahead and the travelled line: a page-tall dashed path makes
   * every tile re-dash the whole path, and only the solid piece under the dot repaints while scrolling.
   */
  segments: { d: string; from: number; to: number }[];
  height: number;
}

/** Where in the viewport the dot sits: the line is "here" at this height. */
const READING_LINE = 0.5;
/** Sections closer together than this share a turn (the wave would kink). */
const MIN_STEP = 240;
const HIDDEN = "0 1000000";
const DASH = [3, 7];
/** Each S is drawn as this many exact pieces, so a scroll frame repaints a short stretch of the line. */
const PIECES = 6;

type Cubic = [Point, Point, Point, Point];

/**
 * A line that meanders through the landing page from under the hero to the closing card: one continuous wave that
 * turns beside each section heading, alternating sides. The part already travelled is a little stronger than the
 * dashed way ahead, and a dot marks where you are. It all runs behind the content and is kept faint so it never
 * competes with text (cards cover it, so it reads as flowing underneath).
 *
 * Scrolling never re-renders it: the dot and the travelled part are written straight to the DOM, and the travelled
 * line is split into short pieces so a frame repaints one of them instead of a path the height of the page.
 *
 * Render it as the first child of a `relative isolate` wrapper: it sits at -z-10 inside it, under every section.
 */
export function GuideLine() {
  const layer = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const segments = useRef<(SVGPathElement | null)[]>([]);
  const dashes = useRef<(SVGPathElement | null)[]>([]);
  const [route, setRoute] = useState<Route | null>(null);

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
      const parts: Route["segments"] = [];
      for (const turn of turns) {
        const reach = (turn.y - previous.y) * 0.5;
        const curve: Cubic = [previous, { x: previous.x, y: previous.y + reach }, { x: turn.x, y: turn.y - reach }, turn];
        d += ` C ${curve[1].x} ${curve[1].y} ${curve[2].x} ${curve[2].y} ${turn.x} ${turn.y}`;
        for (const [p0, p1, p2, p3] of subdivide(curve, PIECES)) {
          parts.push({ d: `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`, from: p0.y, to: p3.y });
        }
        previous = turn;
      }
      const next = turns.length > 1 ? { d, segments: parts, height: card + 24 } : null;
      // Measuring runs on every resize of the page; keep the same route (and the painted SVG) when nothing moved.
      setRoute((current) => (current?.d === next?.d && current?.height === next?.height ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Continue the dash pattern across segments, so the split route dashes exactly like one path.
  useEffect(() => {
    if (!route) {
      return;
    }
    const period = DASH[0] + DASH[1];
    let travelled = 0;
    route.segments.forEach((_, index) => {
      dashes.current[index]?.setAttribute("stroke-dashoffset", String(travelled % period));
      travelled += segments.current[index]?.getTotalLength() ?? 0;
    });
  }, [route]);

  // Follow the reading line: find the segment it crosses, then the point on it (each S only runs downwards).
  useEffect(() => {
    const wrapper = layer.current?.parentElement;
    if (!route || !wrapper) {
      return;
    }
    let frame = 0;
    let active = -1;
    let dash = "";
    const follow = () => {
      const target = window.innerHeight * READING_LINE - wrapper.getBoundingClientRect().top;
      const count = route.segments.length;
      let index = route.segments.findIndex((segment) => target < segment.to);
      if (index === -1) {
        index = count - 1;
      }
      const element = segments.current[index];
      if (!element) {
        return;
      }

      const total = element.getTotalLength();
      let low = 0;
      let high = total;
      for (let i = 0; i < 20; i++) {
        const mid = (low + high) / 2;
        if (element.getPointAtLength(mid).y < target) {
          low = mid;
        } else {
          high = mid;
        }
      }
      const point = element.getPointAtLength(low);

      // Earlier segments solid, later ones hidden; only touch what changed.
      if (index !== active) {
        segments.current.forEach((path, i) => {
          if (path && i !== index) {
            path.setAttribute("stroke-dasharray", i < index ? "none" : HIDDEN);
          }
        });
        active = index;
      }
      const next = `${low} 1000000`;
      if (next !== dash) {
        element.setAttribute("stroke-dasharray", next);
        dash = next;
      }
      if (dot.current) {
        dot.current.style.transform = `translate(${point.x}px, ${point.y}px)`;
        dot.current.style.visibility = "visible";
      }
    };
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
  }, [route]);

  return (
    <div
      ref={layer}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden lg:block"
      style={{ height: route?.height ?? 0 }}
    >
      {route && (
        <svg className="absolute inset-0 size-full overflow-visible" fill="none">
          {route.segments.map((segment, index) => (
            <path
              key={`dash ${segment.d}`}
              ref={(element) => {
                dashes.current[index] = element;
              }}
              d={segment.d}
              stroke="var(--brand)"
              strokeOpacity={0.09}
              strokeWidth={1.5}
              strokeDasharray={DASH.join(" ")}
              strokeLinecap="round"
            />
          ))}
          {route.segments.map((segment, index) => (
            <path
              key={segment.d}
              ref={(element) => {
                segments.current[index] = element;
              }}
              d={segment.d}
              stroke="var(--brand)"
              strokeOpacity={0.2}
              strokeWidth={1.5}
              strokeDasharray={HIDDEN}
            />
          ))}
        </svg>
      )}
      {route && (
        <div ref={dot} className="invisible absolute top-0 left-0 opacity-20">
          <span className="absolute top-0 left-0 size-2.5 -translate-1/2 rounded-full bg-brand shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand)_25%,transparent)]" />
          <span className="absolute top-0 left-0 size-2.5 -translate-1/2 animate-ping rounded-full bg-brand/60 motion-reduce:hidden" />
        </div>
      )}
    </div>
  );
}

/**
 * Splits a cubic Bézier into `count` pieces of equal parameter span (de Casteljau), exactly on the original curve.
 * Every S leaves and arrives vertically and its control arms span half the drop, so the bend is spread evenly like a
 * sine wave and each piece still only runs downwards.
 */
function subdivide(curve: Cubic, count: number): Cubic[] {
  const pieces: Cubic[] = [];
  let rest = curve;
  for (let k = count; k > 1; k--) {
    const [head, tail] = split(rest, 1 / k);
    pieces.push(head);
    rest = tail;
  }
  pieces.push(rest);
  return pieces;
}

function split([p0, p1, p2, p3]: Cubic, t: number): [Cubic, Cubic] {
  const lerp = (a: Point, b: Point): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const a = lerp(p0, p1);
  const b = lerp(p1, p2);
  const c = lerp(p2, p3);
  const ab = lerp(a, b);
  const bc = lerp(b, c);
  const mid = lerp(ab, bc);
  return [
    [p0, a, ab, mid],
    [mid, bc, c, p3],
  ];
}
