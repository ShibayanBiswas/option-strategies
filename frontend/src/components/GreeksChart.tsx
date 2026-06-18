import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartSeriesLabel, formatGreekTick, formatSpotTick } from "../utils/chartFormat";
import { ChartFrame, ChartLegendPills } from "./ChartFrame";
import { ProseMath } from "./ProseMath";
import { LEG_PAYOFF_COLORS, NET_PAYOFF_COLOR } from "./PayoffChart";

const GREEK_META: Record<string, { label: string; symbol: string; color: string; tab: string }> = {
  delta: { label: "Delta", symbol: "Δ", color: NET_PAYOFF_COLOR, tab: "Δ" },
  gamma: { label: "Gamma", symbol: "Γ", color: "#8b5cf6", tab: "Γ" },
  vega: { label: "Vega", symbol: "ν", color: "#10b981", tab: "ν" },
  theta: { label: "Theta", symbol: "Θ", color: "#f59e0b", tab: "Θ" },
  rho: { label: "Rho", symbol: "ρ", color: "#ec4899", tab: "ρ" },
};

interface GreeksChartProps {
  spotPrices: number[];
  aggregateProfiles?: Record<string, number[]>;
  legs?: Record<string, unknown>[];
  spot: number;
  highlightLegIndex?: number | null;
  chartHeight?: number;
}

function GreekTooltip({
  active,
  payload,
  label,
  symbol,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
  symbol: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="fin-tooltip">
      <p className="fin-tooltip-head">S = {Number(label).toFixed(2)}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex justify-between gap-4 text-[11px] font-mono tabular-nums">
          <span className="text-slate-400 truncate max-w-[120px]">
            <ProseMath text={String(p.name)} stripParens={false} />
          </span>
          <span style={{ color: p.color }}>
            {symbol} {Number(p.value).toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GreeksChart({ spotPrices, aggregateProfiles, legs, spot, highlightLegIndex = null, chartHeight = 300 }: GreeksChartProps) {
  const [activeGreek, setActiveGreek] = useState<keyof typeof GREEK_META>("delta");

  const { rows, meta } = useMemo(() => {
    if (!aggregateProfiles || !spotPrices.length) return { rows: [], meta: GREEK_META.delta };
    const profile = aggregateProfiles[activeGreek];
    if (!profile) return { rows: [], meta: GREEK_META[activeGreek] };

    const step = Math.max(1, Math.floor(spotPrices.length / 80));
    const rows = spotPrices
      .map((s, i) => {
        if (i % step !== 0 && i !== spotPrices.length - 1) return null;
        const row: Record<string, number> = { spot: s, aggregate: profile[i] };
        legs?.forEach((leg, j) => {
          const legProfiles = leg.profiles as Record<string, number[]> | undefined;
          if (legProfiles?.[activeGreek]) row[`leg${j}`] = legProfiles[activeGreek][i];
        });
        return row;
      })
      .filter(Boolean) as Record<string, number>[];

    return { rows, meta: GREEK_META[activeGreek] };
  }, [activeGreek, aggregateProfiles, legs, spotPrices]);

  if (!aggregateProfiles || !spotPrices.length) {
    return (
      <p className="text-slate-600 text-sm py-8 text-center fin-chart-frame rounded-xl">
        Load payoff to render Greek profiles
      </p>
    );
  }

  const legendItems = [
    ...(legs?.map((leg, j) => ({
      key: `leg-${j}`,
      label: chartSeriesLabel(String(leg.label ?? `Leg ${j + 1}`), 22),
      color: LEG_PAYOFF_COLORS[j % LEG_PAYOFF_COLORS.length],
      dashed: true,
      active: highlightLegIndex === j,
      dimmed: highlightLegIndex !== null && highlightLegIndex !== j,
    })) ?? []),
    {
      key: "aggregate",
      label: `Net ${meta.symbol}`,
      color: meta.color,
      dashed: false,
      active: highlightLegIndex === null,
      dimmed: false,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 p-1 rounded-lg bg-slate-900/60 border border-slate-800/80 w-fit">
        {(Object.keys(GREEK_META) as (keyof typeof GREEK_META)[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGreek(g)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
              activeGreek === g
                ? "bg-cyan-500/15 text-cyan-300 shadow-sm border border-cyan-500/25"
                : "text-slate-500 hover:text-slate-300 border border-transparent"
            }`}
          >
            {GREEK_META[g].tab}
          </button>
        ))}
      </div>

      <ChartFrame
        yLabel={meta.symbol}
        xLabel="Spot"
        height={chartHeight}
        meta={
          <>
            <span className="text-slate-400">{meta.label}</span>
            <span className="text-slate-600">|</span>
            <span>
              <ProseMath text="S_0" stripParens={false} />{" "}
              <strong className="text-cyan-400 tabular-nums">{spot.toFixed(2)}</strong>
            </span>
          </>
        }
        legend={<ChartLegendPills items={legendItems} />}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="2 6" vertical={false} />
            <XAxis
              dataKey="spot"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickFormatter={formatSpotTick}
              tickCount={6}
              minTickGap={48}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={42}
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickFormatter={(v) => formatGreekTick(v, activeGreek)}
              tickCount={4}
            />
            <Tooltip content={<GreekTooltip symbol={meta.symbol} />} cursor={{ stroke: "#334155", strokeDasharray: "4 4" }} />
            <ReferenceLine x={spot} stroke="#06b6d4" strokeDasharray="3 6" strokeOpacity={0.5} />
            {legs?.map((leg, j) => {
              const highlighted = highlightLegIndex === j;
              const dimmed = highlightLegIndex !== null && !highlighted;
              return (
                <Line
                  key={`leg-${j}`}
                  type="monotone"
                  dataKey={`leg${j}`}
                  name={chartSeriesLabel(String(leg.label ?? `L${j + 1}`), 20)}
                  stroke={LEG_PAYOFF_COLORS[j % LEG_PAYOFF_COLORS.length]}
                  strokeWidth={highlighted ? 2 : 1}
                  strokeDasharray={highlighted ? "0" : "4 3"}
                  strokeOpacity={dimmed ? 0.15 : 0.7}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
            <Line
              type="monotone"
              dataKey="aggregate"
              name={`Net ${meta.symbol}`}
              stroke={meta.color}
              strokeWidth={2.25}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
