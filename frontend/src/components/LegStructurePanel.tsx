import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { ProseMath } from "./ProseMath";
import { formatLegLabel } from "../utils/chartFormat";

export { GreeksExplorer } from "./GreeksExplorer";
export type { GreekCardData } from "./GreeksExplorer";

export interface DisplayLeg {
  id: string;
  index: number;
  direction: string;
  type: string;
  typeName: string;
  strike: string | null;
  title: string;
  subtitle: string;
  role: string;
  directionTag: string;
}

interface LegStructurePanelProps {
  legs: DisplayLeg[];
  activeIndex: number | null;
  onSelect: (index: number | null) => void;
  chartLabels?: string[];
}

export function LegStructurePanel({ legs, activeIndex, onSelect, chartLabels }: LegStructurePanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-ar-subtle leading-relaxed font-serif">
        Click a leg to highlight it on the payoff and Greek charts. Long positions expand rights; short positions collect premium and accept obligation.
      </p>
      {legs.map((leg, i) => {
        const isActive = activeIndex === i;
        const isOpen = expanded === i;
        const isLong = leg.directionTag === "long";

        return (
          <motion.button
            key={leg.id}
            type="button"
            onClick={() => {
              onSelect(isActive ? null : i);
              setExpanded(isOpen && isActive ? null : i);
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full text-left rounded-xl border p-4 transition-all ${
              isActive
                ? "border-ar-gold/50 bg-ar-gold/10 shadow-lg shadow-ar"
                : "border-surface-border bg-surface/60 hover:border-ar-border"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                    isLong ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {leg.direction}
                </span>
                <span className="text-ar-ink font-medium">{leg.typeName}</span>
              </div>
            </div>
            {leg.subtitle && (
              <p className="text-sm text-accent-cyan/80 mt-2">
                <ProseMath text={leg.subtitle} stripParens={false} />
              </p>
            )}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-ar-muted mt-3 leading-relaxed border-t border-surface-border pt-3 font-serif research-prose">
                    <ProseMath text={leg.role} />
                  </p>
                  {chartLabels?.[i] && (
                    <p className="text-xs text-ar-subtle mt-2 font-serif">
                      Payoff series: <ProseMath text={formatLegLabel(chartLabels[i])} stripParens={false} />
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

/** @deprecated Use GreeksExplorer */
export { GreeksExplorer as GreeksCarousel } from "./GreeksExplorer";
