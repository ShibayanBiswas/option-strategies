import { useMemo, useState } from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { chartSeriesLabel, formatGreekTick, formatSpotTick } from "../utils/chartFormat";
import { getChartTheme } from "../utils/chartTheme";
import { useTheme } from "../theme/ThemeProvider";
import { ChartFrame, ChartLegendPills } from "./ChartFrame";
import { PremiumGrid } from "./PremiumGrid";
import { ProseMath } from "./ProseMath";
import { LEG_PAYOFF_COLORS, NET_PAYOFF_COLOR } from "./PayoffChart";
import type { GreekKey } from "./greekTheme";

const GREEK_META: Record<GreekKey, { label: string; symbol: string; color: string; tab: string }> = {
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
  activeGreek?: GreekKey;
  onActiveGreekChange?: (key: GreekKey) => void;
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
          <span className="text-ar-muted truncate max-w-[120px]">
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

export function GreeksChart({
  spotPrices,
  aggregateProfiles,
  legs,
  spot,
  highlightLegIndex = null,
  chartHeight = 300,
  activeGreek: controlledGreek,
  onActiveGreekChange,
}: GreeksChartProps) {
  const [internalGreek, setInternalGreek] = useState<GreekKey>("delta");
  const activeGreek = controlledGreek ?? internalGreek;
  const setActiveGreek = (key: GreekKey) => {
    if (controlledGreek === undefined) setInternalGreek(key);
    onActiveGreekChange?.(key);
  };
  const { theme } = useTheme();
  const chartTheme = getChartTheme(theme === "dark");

  const { rows, meta } = useMemo(() => {
    if (!aggregateProfiles || !spotPrices.length) return { rows: [], meta: GREEK_META.delta };
    const profile = aggregateProfiles[activeGreek];
    if (!profile) return { rows: [], meta: GREEK_META[activeGreek] };

    const step = Math.max(1, Math.floor(spotPrices.length / 80));
    const rows = spotPrices
      .map((s, i) => {
        if (i % step !== 0 && i !== spotPrices.length - 1 && s !== spot) return null;
        const row: Record<string, number> = { spot: s, aggregate: profile[i] };
        legs?.forEach((leg, j) => {
          const legProfiles = leg.profiles as Record<string, number[]> | undefined;
          if (legProfiles?.[activeGreek]) row[`leg${j}`] = legProfiles[activeGreek][i];
        });
        return row;
      })
      .filter(Boolean) as Record<string, number>[];

    return { rows, meta: GREEK_META[activeGreek] };
  }, [activeGreek, aggregateProfiles, legs, spot, spotPrices]);

  if (!aggregateProfiles || !spotPrices.length) {
    return (
      <p className="text-ar-subtle text-sm py-8 text-center fin-chart-frame rounded-xl">
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
      <div className="flex gap-1 p-1 rounded-lg bg-ar-panel border border-ar-border w-fit">
        {(Object.keys(GREEK_META) as GreekKey[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGreek(g)}
            aria-pressed={activeGreek === g}
            className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors ${
              activeGreek === g
                ? "bg-gradient-to-br from-ar-gold/30 to-ar-gold/10 text-ar-gold-dark shadow-sm border border-ar-gold/55 dark:from-ar-gold/25 dark:to-ar-panel dark:text-ar-gold-light font-bold italic"
                : "text-ar-subtle hover:text-ar-muted border border-transparent hover:bg-ar-gold/10"
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
            <span className="text-ar-muted">{meta.label}</span>
            <span className="text-ar-subtle">|</span>
            <span>
              <ProseMath text="S_0" stripParens={false} />{" "}
              <strong className="text-ar-gold tabular-nums">{spot.toFixed(2)}</strong>
            </span>
          </>
        }
        legend={<ChartLegendPills items={legendItems} />}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <PremiumGrid theme={chartTheme} vertical />
            <XAxis
              dataKey="spot"
              axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickFormatter={formatSpotTick}
              tickCount={6}
              minTickGap={48}
            />
            <YAxis
              axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1 }}
              tickLine={false}
              width={42}
              tick={{ fill: chartTheme.tick, fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              tickFormatter={(v) => formatGreekTick(v, activeGreek)}
              tickCount={4}
            />
            <Tooltip content={<GreekTooltip symbol={meta.symbol} />} cursor={{ stroke: chartTheme.cursor, strokeDasharray: "4 4" }} />
            <ReferenceLine x={spot} stroke={chartTheme.spot} strokeDasharray="3 6" strokeOpacity={0.75} />
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
                  strokeWidth={highlighted ? 2.5 : 1}
                  strokeDasharray={highlighted ? "0" : "4 3"}
                  strokeOpacity={dimmed ? 0.12 : highlighted ? 1 : 0.65}
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
              strokeWidth={highlightLegIndex === null ? 2.5 : 2}
              strokeOpacity={highlightLegIndex === null ? 1 : 0.45}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}
