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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`glass rounded-2xl p-6 shadow-xl shadow-black/20 ${className}`}
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
  cyan: "text-accent-cyan",
  emerald: "text-accent-emerald",
  amber: "text-accent-amber",
  violet: "text-accent-violet",
};

export function Stat({ label, value, tone = "cyan" }: StatProps) {
  return (
    <div className="rounded-xl bg-surface/60 border border-surface-border px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-semibold font-mono ${toneMap[tone]}`}>{value}</p>
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: ReactNode; variant?: "default" | "success" | "warn" }) {
  const styles = {
    default: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${styles[variant]}`}>
      {children}
    </span>
  );
}
