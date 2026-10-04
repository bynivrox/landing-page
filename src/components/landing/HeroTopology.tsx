"use client";

import { motion, useReducedMotion } from "motion/react";
import { box, plate, polyline, project, type Point3 } from "@/lib/iso";

/**
 * The hero scene: the reference topology as an isometric canvas. Wireframe-glass machines rise into place on a dot
 * floor, the links draw along the floor like editor connections, and a packet runs relay01 → dokploy over WireGuard
 * until the Checkmk container answers.
 */

interface Machine {
  id: string;
  at: Point3;
  size: [number, number, number];
  label: string;
  slots?: number;
  /** Put the tag under the machine's front corner (when its top is busy, e.g. with containers). */
  tagBelow?: boolean;
}

const relay: Machine = { id: "relay01", at: [-190, 30, 0], size: [56, 56, 104], label: "relay01 · 10.50.0.2", slots: 5 };
const host: Machine = { id: "dokploy", at: [10, -150, 0], size: [130, 96, 54], label: "dokploy · wg0 10.50.0.1", slots: 2, tagBelow: true };
const storage: Machine = { id: "storage01", at: [-90, 190, 0], size: [86, 54, 28], label: "storage01 · nfs", slots: 1 };

/** Containers on the Docker host; Checkmk is the run's goal. */
const containers: { at: Point3; goal?: boolean }[] = [
  { at: [24, -138, 54] },
  { at: [60, -138, 54] },
  { at: [96, -138, 54], goal: true },
  { at: [24, -100, 54] },
];

const tunnel = polyline([
  [-162, 58, 0],
  [-162, -102, 0],
  [10, -102, 0],
]);
const lan = polyline([
  [-162, 86, 0],
  [-162, 217, 0],
  [-90, 217, 0],
]);
// On the open floor below the tunnel, clear of both of its halves.
const tunnelLabel = project([-60, -40, 0]);

const glass = { top: "var(--glass-top)", left: "var(--glass-left)", right: "var(--glass-right)" };

export function HeroTopology({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const rise = (order: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay: 0.5 + order * 0.18, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <svg
      viewBox="-420 -300 760 620"
      className={className}
      role="img"
      aria-label="relay01 reaches the Checkmk container on dokploy through a WireGuard tunnel; storage01 sits on the same LAN as relay01"
    >
      <defs>
        <radialGradient id="floor-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="floor-mask">
          <rect x="-420" y="-300" width="760" height="620" fill="url(#floor-fade)" />
        </mask>
      </defs>

      {/* Dot floor. */}
      <g mask="url(#floor-mask)" fill="var(--sky)" opacity="0.5">
        {Array.from({ length: 15 }, (_, row) =>
          Array.from({ length: 15 }, (_, column) => {
            const [x, y] = project([-300 + column * 40, -300 + row * 40, 0]);
            return <circle key={`${row}-${column}`} cx={x} cy={y} r="1.3" />;
          }),
        )}
      </g>

      {/* Links along the floor, drawn like editor connections. */}
      <motion.path
        d={lan}
        fill="none"
        stroke="var(--sky)"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 1.3 }}
      />
      <motion.path
        d={tunnel}
        fill="none"
        stroke="white"
        strokeWidth="1.6"
        strokeDasharray="6 5"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 1.4 }}
      />
      <Tag x={tunnelLabel[0]} y={tunnelLabel[1]} text="wireguard · udp 51820" muted />

      <MachineView machine={storage} motionProps={rise(0)} />
      <MachineView machine={relay} motionProps={rise(1)} />
      <motion.g {...rise(2)}>
        <MachineView machine={host} />
        <path d={plate(18, -144, 54, 112, 80)} fill="none" stroke="var(--sky)" strokeOpacity="0.6" strokeDasharray="3 3" />
        {containers.map((container, index) => {
          const faces = box(container.at[0], container.at[1], container.at[2], 26, 26, 22);
          return (
            <g key={index}>
              <path d={faces.left} fill={container.goal ? "var(--brand-deep)" : glass.left} stroke="var(--sky)" strokeOpacity="0.7" />
              <path d={faces.right} fill={container.goal ? "var(--brand)" : glass.right} stroke="var(--sky)" strokeOpacity="0.7" />
              <path d={faces.top} fill={container.goal ? "var(--brand-soft)" : glass.top} stroke="var(--sky)" strokeOpacity="0.7" />
            </g>
          );
        })}
        {!reduceMotion && <GoalPulse />}
      </motion.g>

      {!reduceMotion && (
        <circle r="4.5" fill="white" opacity="0">
          <animateMotion dur="2.6s" repeatCount="indefinite" begin="2.8s" path={tunnel} />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" dur="2.6s" repeatCount="indefinite" begin="2.8s" />
        </circle>
      )}

      {(() => {
        const [x, y] = project([109, -125, 76]);
        return <Tag x={x} y={y - 26} text="checkmk :8000 ✓" />;
      })()}
    </svg>
  );
}

function MachineView({ machine, motionProps }: { machine: Machine; motionProps?: object }) {
  const [x, y, z] = machine.at;
  const [width, depth, height] = machine.size;
  const faces = box(x, y, z, width, depth, height);
  const [labelX, labelY] = machine.tagBelow ? project([x + width, y + depth, z]) : project([x + width / 2, y + depth / 2, z + height]);

  return (
    <motion.g {...motionProps}>
      <path d={faces.left} fill={glass.left} stroke="var(--sky)" strokeOpacity="0.75" />
      <path d={faces.right} fill={glass.right} stroke="var(--sky)" strokeOpacity="0.75" />
      <path d={faces.top} fill={glass.top} stroke="var(--sky)" strokeOpacity="0.75" />
      {/* Drive bays on the front-left face, with a status light each. */}
      {Array.from({ length: machine.slots ?? 0 }, (_, index) => {
        const slotZ = z + height - 14 - index * (height / ((machine.slots ?? 1) + 0.4));
        const [ledX, ledY] = project([x + width - 10, y + depth, slotZ - 3]);
        return (
          <g key={index}>
            <path
              d={polyline([
                [x + 8, y + depth, slotZ],
                [x + width - 18, y + depth, slotZ],
              ])}
              stroke="var(--sky)"
              strokeOpacity="0.45"
            />
            <circle cx={ledX} cy={ledY} r="1.8" fill="var(--sky)" />
          </g>
        );
      })}
      <Tag x={labelX} y={machine.tagBelow ? labelY + 26 : labelY - 26} text={machine.label} />
    </motion.g>
  );
}

/** A small floating tag with a technical value. */
function Tag({ x, y, text, muted = false }: { x: number; y: number; text: string; muted?: boolean }) {
  const width = text.length * 6.4 + 16;
  return (
    <g transform={`translate(${x - width / 2} ${y - 11})`}>
      <rect width={width} height="22" rx="3" fill={muted ? "var(--tag-muted)" : "var(--tag)"} stroke="var(--tag-border)" />
      <text x={width / 2} y="15" textAnchor="middle" className="fill-white font-mono text-[10.5px]" opacity={muted ? 0.75 : 0.95}>
        {text}
      </text>
    </g>
  );
}

/** The goal answering: a ring expanding from the Checkmk container each time the packet arrives. */
function GoalPulse() {
  const [x, y] = project([109, -125, 76]);
  return (
    <ellipse cx={x} cy={y} rx="0" ry="0" fill="none" stroke="white" strokeWidth="1.5" opacity="0">
      {/* Still while the packet travels (to 80 % of the cycle), then a ring expands as it arrives. */}
      <animate attributeName="rx" values="4;4;34" keyTimes="0;0.8;1" dur="2.6s" begin="2.8s" repeatCount="indefinite" />
      <animate attributeName="ry" values="2;2;17" keyTimes="0;0.8;1" dur="2.6s" begin="2.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0;0;0.9;0" keyTimes="0;0.8;0.84;1" dur="2.6s" begin="2.8s" repeatCount="indefinite" />
    </ellipse>
  );
}
