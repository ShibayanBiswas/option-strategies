import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility — enter motion removed (no click/load bounce). */
  delay?: number;
  inView?: boolean;
}

/** Static card shell — no framer enter/hover/tap transforms. */
export function GlassCard({ children, className = "" }: GlassCardProps) {
  return <div className={`glass rounded-xl p-6 shadow-ar ${className}`}>{children}</div>;
}

interface StatProps {
  label: ReactNode;
  value: string | number;
  tone?: "cyan" | "emerald" | "amber" | "violet";
  delay?: number;
}

const toneMap = {
  cyan: "text-ar-gold",
  emerald: "text-accent-emerald",
  amber: "text-accent-amber",
  violet: "text-ar-gold",
};

export function Stat({ label, value, tone = "cyan" }: StatProps) {
  return (
    <div className="stat-tile rounded-xl bg-ar-surface border border-ar-border px-4 py-3.5 shadow-ar">
      <p className="text-xs uppercase tracking-[0.14em] text-ar-subtle mb-1.5 font-medium">{label}</p>
      <p className={`text-xl font-bold italic font-mono tabular-nums prose-num ${toneMap[tone]}`}>{value}</p>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warn";
}) {
  const styles = {
    default: "bg-ar-gold/20 text-ar-gold-dark border-ar-gold/50",
    success: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border-emerald-600/30",
    warn: "bg-amber-500/12 text-amber-900 dark:text-amber-300 border-amber-600/30",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

/** Static wrapper — kept for call sites that previously used motion enter. */
export function AnimatedCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return <div className={className}>{children}</div>;
}
