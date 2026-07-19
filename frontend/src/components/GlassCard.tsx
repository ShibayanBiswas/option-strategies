import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cardEnter, cardHover, cardTap, staggerDelay } from "../motion/cardMotion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Use whileInView instead of mount animate (long pages). */
  inView?: boolean;
}

export function GlassCard({ children, className = "", delay = 0, inView = false }: GlassCardProps) {
  const enterProps = inView
    ? {
        initial: { opacity: 0, y: 22, scale: 0.97 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.15 },
      }
    : {
        initial: cardEnter.initial,
        animate: cardEnter.animate,
      };

  return (
    <motion.div
      {...enterProps}
      whileHover={cardHover}
      whileTap={cardTap}
      transition={{ ...cardEnter.transition, delay }}
      className={`glass interactive-card card-shine rounded-xl p-6 shadow-ar ${className}`}
    >
      {children}
    </motion.div>
  );
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

export function Stat({ label, value, tone = "cyan", delay = 0 }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 24, delay }}
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="stat-tile card-shine rounded-xl bg-ar-surface border border-ar-border px-4 py-3.5 shadow-ar"
    >
      <p className="text-xs uppercase tracking-[0.14em] text-ar-subtle mb-1.5 font-medium">{label}</p>
      <p className={`text-xl font-bold italic font-mono tabular-nums prose-num ${toneMap[tone]}`}>{value}</p>
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
    default: "bg-ar-gold/20 text-ar-gold-dark border-ar-gold/50",
    success: "bg-emerald-500/12 text-emerald-800 dark:text-emerald-300 border-emerald-600/30",
    warn: "bg-amber-500/12 text-amber-900 dark:text-amber-300 border-amber-600/30",
  };
  return (
    <motion.span
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${styles[variant]}`}
    >
      {children}
    </motion.span>
  );
}

/** Lightweight motion wrapper for any card-like surface. */
export function AnimatedCard({
  children,
  className = "",
  index = 0,
}: {
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 300, damping: 26, delay: staggerDelay(index) }}
      whileHover={cardHover}
      whileTap={cardTap}
      className={`card-shine ${className}`}
    >
      {children}
    </motion.div>
  );
}
