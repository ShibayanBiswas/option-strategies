import type { ReactNode } from "react";
import { ProseMath } from "./ProseMath";

interface ChartFrameProps {
  yLabel: string;
  xLabel: string;
  meta?: ReactNode;
  legend?: ReactNode;
  height?: number;
  children: ReactNode;
}

/** Terminal-style chart wrapper — axis titles outside SVG to prevent overlap */
export function ChartFrame({ yLabel, xLabel, meta, legend, height = 360, children }: ChartFrameProps) {
  return (
    <div className="fin-chart-frame rounded-xl border border-ar-border bg-ar-chart-bg overflow-hidden">
      {meta && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 border-b border-ar-border bg-ar-panel text-[11px] font-mono text-ar-subtle">
          {meta}
        </div>
      )}
      {legend && (
        <div className="px-4 py-2.5 border-b border-ar-border bg-ar-panel">{legend}</div>
      )}
      <div className="flex" style={{ height }}>
        <div className="w-9 shrink-0 flex items-center justify-center border-r border-ar-border bg-ar-panel">
          <span className="-rotate-90 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.2em] text-ar-subtle select-none">
            {yLabel}
          </span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 min-h-0 px-1 pt-2">{children}</div>
          <div className="shrink-0 py-2 text-center border-t border-ar-border bg-ar-panel">
            <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-ar-subtle select-none">
              {xLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LegendItem {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
  active?: boolean;
  dimmed?: boolean;
}

export function ChartLegendPills({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <div
          key={item.key}
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-opacity ${
            item.dimmed ? "opacity-35 border-ar-border text-ar-subtle" : "border-ar-border text-ar-muted bg-ar-panel"
          } ${item.active ? "ring-1 ring-ar-gold/40 border-ar-gold/30" : ""}`}
        >
          <span
            className="w-5 h-0.5 shrink-0 rounded-full"
            style={{
              backgroundColor: item.dashed ? "transparent" : item.color,
              backgroundImage: item.dashed
                ? `repeating-linear-gradient(90deg, ${item.color} 0, ${item.color} 4px, transparent 4px, transparent 7px)`
                : undefined,
            }}
          />
          <span className="truncate max-w-[160px]" title={item.label}>
            <ProseMath text={item.label} stripParens={false} className="text-[11px]" />
          </span>
        </div>
      ))}
    </div>
  );
}
