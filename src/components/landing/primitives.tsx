import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, CircleHelp, TriangleAlert, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The official Nivrox wordmark (public/brand). Never recreate it as text. */
export function Logo({ className, height = 18 }: { className?: string; height?: number }) {
  return (
    <Image
      src="/brand/nivrox-logo.svg"
      alt="Nivrox"
      width={Math.round((235 / 32) * height)}
      height={height}
      className={cn("h-auto select-none", className)}
      priority
      unoptimized
    />
  );
}

/** The page's content column. */
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("relative mx-auto w-full max-w-7xl px-6", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground", className)}>
      <span className="mr-2 inline-block size-1.5 translate-y-[-1px] bg-brand" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 font-display text-4xl font-medium leading-[1.04] tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">{children}</div>}
    </div>
  );
}

type ButtonProps = ComponentProps<typeof Link> & { variant?: "primary" | "light" | "ghost"; arrow?: boolean };

export function ButtonLink({ variant = "primary", arrow = false, className, children, ...props }: ButtonProps) {
  return (
    <Link
      className={cn(
        "group inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-medium transition-colors",
        variant === "primary" && "bg-brand text-brand-foreground hover:bg-brand-hover",
        variant === "light" && "bg-foreground text-background hover:bg-white",
        variant === "ghost" && "border border-border-strong bg-surface/60 text-foreground backdrop-blur hover:border-foreground/40",
        className,
      )}
      {...props}
    >
      {children}
      {arrow && <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
    </Link>
  );
}

export type Status = "passed" | "failed" | "warning" | "unknown" | "pending";

const statusStyles: Record<Status, { icon: typeof Check; tone: string; label: string }> = {
  passed: { icon: Check, tone: "text-brand", label: "Passed" },
  failed: { icon: X, tone: "text-error", label: "Failed" },
  warning: { icon: TriangleAlert, tone: "text-warning", label: "Warning" },
  unknown: { icon: CircleHelp, tone: "text-muted-foreground", label: "Unknown" },
  pending: { icon: CircleHelp, tone: "text-faint-foreground", label: "Not evaluated" },
};

/** A state is always icon + text + color, never color alone. */
export function StatusMark({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const style = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider", style.tone, className)}>
      <style.icon className="size-3.5" aria-hidden />
      <span>{label ?? style.label}</span>
    </span>
  );
}

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-lg border border-border bg-surface/80 backdrop-blur-sm", className)}>{children}</div>;
}

export function PanelHeader({ title, meta, className }: { title: ReactNode; meta?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-4 border-b border-border px-4 py-3", className)}>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{title}</span>
      {meta}
    </div>
  );
}
