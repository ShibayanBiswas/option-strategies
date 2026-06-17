import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className={`greek-section-shell ${accentMap[accent]}`}>
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
    </div>
  );
}
