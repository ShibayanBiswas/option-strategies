import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlassCard({ children, className = "", delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.4, delay }}
      className={`glass interactive-card rounded-xl p-6 shadow-ar ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface StatProps {
  label: ReactNode;
  value: string | number;
  tone?: "cyan" | "emerald" | "amber" | "violet";
}

const toneMap = {
  cyan: "text-ar-gold",
  emerald: "text-accent-emerald",
  amber: "text-accent-amber",
  violet: "text-ar-maroon",
};

export function Stat({ label, value, tone = "cyan" }: StatProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="stat-tile rounded-lg bg-ar-surface border border-ar-border px-4 py-3 shadow-ar"
    >
      <p className="text-xs uppercase tracking-wider text-ar-subtle mb-1">{label}</p>
      <p className={`text-lg font-semibold font-mono ${toneMap[tone]}`}>{value}</p>
    </motion.div>
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
    default: "bg-ar-gold/15 text-ar-ink border-ar-gold/35",
    success: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-600/25",
    warn: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-600/25",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[variant]}`}>
      {children}
    </span>
  );
}
