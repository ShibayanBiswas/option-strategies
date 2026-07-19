import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cardHover, cardTap } from "../motion/cardMotion";

interface GreekSectionShellProps {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  accent?: "cyan" | "violet" | "emerald";
  children: ReactNode;
}

const accentMap = {
  cyan: "greek-shell-cyan",
  violet: "greek-shell-violet",
  emerald: "greek-shell-emerald",
};

export function GreekSectionShell({ icon: Icon, title, subtitle, badge, accent = "cyan", children }: GreekSectionShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      whileHover={cardHover}
      whileTap={cardTap}
      className={`greek-section-shell card-shine ${accentMap[accent]}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="greek-section-head"
      >
        <div className="greek-section-icon-wrap">
          <Icon className="greek-section-icon" strokeWidth={1.5} />
        </div>
        <div className="greek-section-titles">
          <h2 className="greek-section-title">{title}</h2>
          {subtitle && <p className="greek-section-subtitle">{subtitle}</p>}
        </div>
        {badge}
      </motion.div>
      <div className="greek-section-body">{children}</div>
    </motion.div>
  );
}
