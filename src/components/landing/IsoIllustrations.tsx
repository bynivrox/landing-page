"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { box, plate, polyline, project, type Point3 } from "@/lib/iso";

/** One isometric line drawing that draws itself when it scrolls into view. */
function Drawing({ children, label, delay = 0 }: { children: (draw: DrawProps) => ReactNode; label: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="-185 -150 370 300"
      className="h-auto w-full"
      role="img"
      aria-label={label}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: "-15% 0px" }}
    >
      {children({ delay })}
    </motion.svg>
  );
}

interface DrawProps {
  delay: number;
}

/** A stroked path that draws in, staggered by its order. */
function Line({
  d,
  order = 0,
  delay,
  accent = false,
  dashed = false,
}: {
  d: string;
  order?: number;
  delay: number;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <motion.path
      d={d}
      fill="none"
      stroke={accent ? "var(--brand)" : "var(--illustration)"}
      strokeWidth={accent ? 1.4 : 1}
      strokeLinejoin="round"
      strokeDasharray={dashed ? "3 4" : undefined}
      variants={{ hidden: { pathLength: 0, opacity: 0 }, shown: { pathLength: 1, opacity: 1 } }}
      transition={{ duration: 0.9, delay: delay + order * 0.12, ease: "easeInOut" }}
    />
  );
}

function Box({
  at,
  size,
  order,
  delay,
  accent,
}: {
  at: Point3;
  size: [number, number, number];
  order: number;
  delay: number;
  accent?: boolean;
}) {
  const faces = box(at[0], at[1], at[2], size[0], size[1], size[2]);
  return (
    <>
      <Line d={faces.top} order={order} delay={delay} accent={accent} />
      <Line d={faces.left} order={order} delay={delay} accent={accent} />
      <Line d={faces.right} order={order} delay={delay} accent={accent} />
    </>
  );
}

function Dot({ at, delay }: { at: Point3; delay: number }) {
  const [x, y] = project(at);
  return (
    <motion.circle
      cx={x}
      cy={y}
      r={3}
      fill="var(--brand)"
      variants={{ hidden: { opacity: 0, scale: 0 }, shown: { opacity: 1, scale: 1 } }}
      transition={{ duration: 0.4, delay: delay + 1.1 }}
    />
  );
}

/** Six stacked layers, the top one lit: DNS, routing, WireGuard, firewall, Docker, service. */
export function LayersDrawing({ delay = 0 }: { delay?: number }) {
  return (
    <Drawing label="Six stacked layers, evaluated one by one" delay={delay}>
      {(draw) => (
        <g transform="translate(0 -10)">
          {[0, 1, 2, 3, 4, 5].map((level) => (
            <Box key={level} at={[-60, -60, level * 16 - 40]} size={[120, 120, 7]} order={level} delay={draw.delay} accent={level === 5} />
          ))}
          <Line d={plate(-80, -80, -48, 160, 160)} order={6} delay={draw.delay} dashed />
          <Dot at={[0, 0, 47]} delay={draw.delay} />
        </g>
      )}
    </Drawing>
  );
}

/** Servers at different heights, traced to the ground and joined to a host: what discovery finds. */
export function DiscoveryDrawing({ delay = 0 }: { delay?: number }) {
  const servers: Point3[] = [
    [-70, -40, 50],
    [10, -80, 70],
    [40, 10, 30],
  ];
  return (
    <Drawing label="Servers discovered and linked to the model" delay={delay}>
      {(draw) => (
        <g transform="translate(0 0)">
          <Line d={plate(-95, -95, -30, 190, 190)} delay={draw.delay} dashed />
          {servers.map((at, index) => (
            <g key={index}>
              <Box at={at} size={[40, 40, 14]} order={index} delay={draw.delay} />
              <Line
                d={polyline([
                  [at[0] + 20, at[1] + 20, at[2]],
                  [at[0] + 20, at[1] + 20, -30],
                ])}
                order={index + 3}
                delay={draw.delay}
                dashed
              />
            </g>
          ))}
          <Box at={[-20, 40, -30]} size={[50, 50, 18]} order={4} delay={draw.delay} accent />
          <Line
            d={polyline([
              [-50, -20, 50],
              [-50, 65, 50],
              [5, 65, -12],
            ])}
            order={6}
            delay={draw.delay}
            accent
          />
          <Line
            d={polyline([
              [60, 30, 30],
              [60, 65, 30],
              [30, 65, -12],
            ])}
            order={7}
            delay={draw.delay}
            accent
          />
          <Dot at={[5, 65, -12]} delay={draw.delay} />
        </g>
      )}
    </Drawing>
  );
}

/** Many resources above one host; only the managed one moves in. */
export function PlanDrawing({ delay = 0 }: { delay?: number }) {
  const cells: Point3[] = [];
  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      cells.push([-60 + column * 42, -60 + row * 42, 70]);
    }
  }
  return (
    <Drawing label="Many resources; only the managed one changes" delay={delay}>
      {(draw) => (
        <g transform="translate(0 10)">
          {cells.map((at, index) => (
            <Box key={index} at={at} size={[24, 24, 12]} order={index * 0.5} delay={draw.delay} accent={index === 4} />
          ))}
          <Line
            d={polyline([
              [-9, -9, 70],
              [-9, -9, 8],
            ])}
            order={6}
            delay={draw.delay}
            accent
            dashed
          />
          <Box at={[-80, -80, -50]} size={[160, 160, 58]} order={5} delay={draw.delay} />
          <Dot at={[-9, -9, 8]} delay={draw.delay} />
        </g>
      )}
    </Drawing>
  );
}

/** A deployed platform with its verification mark, resting on its backup layer. */
export function VerifyDrawing({ delay = 0 }: { delay?: number }) {
  return (
    <Drawing label="A deployment verified, with its backup underneath" delay={delay}>
      {(draw) => (
        <g transform="translate(0 20)">
          <Line d={plate(-95, -95, -40, 190, 190)} delay={draw.delay} dashed />
          <Box at={[-75, -75, -40]} size={[150, 150, 14]} order={1} delay={draw.delay} />
          <Box at={[-45, -45, -26]} size={[90, 90, 18]} order={2} delay={draw.delay} accent />
          <Line
            d={polyline([
              [-18, 4, -8],
              [-4, 18, -8],
              [22, -22, -8],
            ])}
            order={4}
            delay={draw.delay}
            accent
          />
        </g>
      )}
    </Drawing>
  );
}
