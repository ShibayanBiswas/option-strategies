import { TrendingDown, TrendingUp } from "lucide-react";
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

/** Leg picker — instant selection only (no expand/collapse or press motion). */
export function LegStructurePanel({ legs, activeIndex, onSelect, chartLabels }: LegStructurePanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="space-y-3 leg-structure-panel">
      <p className="text-xs text-ar-subtle leading-relaxed font-serif">
        Click a leg to highlight it on the payoff and Greek charts. Long positions expand rights; short positions collect premium and accept obligation.
      </p>
      {legs.map((leg, i) => {
        const isActive = activeIndex === i;
        const isOpen = expanded === i;
        const isLong = leg.directionTag === "long";

        return (
          <button
            key={leg.id}
            type="button"
            onClick={() => {
              onSelect(isActive ? null : i);
              setExpanded(isOpen && isActive ? null : i);
            }}
            className={`leg-structure-card w-full text-left rounded-xl border p-4 ${
              isActive
                ? "leg-structure-card-active border-ar-gold/55 bg-ar-gold/12"
                : "border-ar-border bg-ar-surface hover:border-ar-gold/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                    isLong
                      ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-500/15 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {isLong ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {leg.direction}
                </span>
                <span className="text-ar-ink font-medium">{leg.typeName}</span>
              </div>
            </div>
            {leg.subtitle && (
              <p className="text-sm text-ar-gold/90 mt-2 font-semibold italic">
                <ProseMath text={leg.subtitle} stripParens={false} />
              </p>
            )}
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-sm text-ar-muted mt-3 leading-relaxed border-t border-surface-border pt-3 font-serif research-prose">
                  <ProseMath text={leg.role} />
                </p>
                {chartLabels?.[i] && (
                  <p className="text-xs text-ar-subtle mt-2 font-serif">
                    Payoff series: <ProseMath text={formatLegLabel(chartLabels[i])} stripParens={false} />
                  </p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
