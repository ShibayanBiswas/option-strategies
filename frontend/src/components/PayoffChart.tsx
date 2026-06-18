import { motion } from "framer-motion";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PayoffResponse } from "../api/client";
import { ChartFrame, ChartLegendPills } from "./ChartFrame";
import { ProseMath } from "./ProseMath";
import { chartSeriesLabel, formatCurrencyFull, formatPnLTick, formatSpotTick } from "../utils/chartFormat";

export const LEG_PAYOFF_COLORS = ["#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#eab308", "#38bdf8"];
export const NET_PAYOFF_COLOR = "#06b6d4";

const STRIKE_COLORS: Record<string, string> = {
  S0: "#06b6d4",
  K: "#a78bfa",
  K1: "#c084fc",
  K2: "#818cf8",
  K3: "#6366f1",
  K4: "#4f46e5",
};

interface PayoffChartProps {
  data: PayoffResponse | null;
  spot: number;
  params?: Record<string, number>;
  loading?: boolean;
  legLabels?: string[];
  highlightLegIndex?: number | null;
}

type ChartRow = Record<string, number>;

function buildChartData(data: PayoffResponse, legLabels: string[]) {
  const legSeries = data.legPayoffs?.legs ?? [];
  const labels = data.legPayoffs?.labels ?? legLabels;

  const series = legSeries.map((_, i) => ({
    key: `leg${i}`,
    label: chartSeriesLabel(labels[i] ?? `Leg ${i + 1}`, 24),
    color: LEG_PAYOFF_COLORS[i % LEG_PAYOFF_COLORS.length],
  }));

  const rows: ChartRow[] = data.spotPrices.map((price, i) => {
    const payoff = data.payoffs[i];
    const row: ChartRow = {
      spot: price,
      payoff,
      profitZone: Math.max(payoff, 0),
      lossZone: Math.min(payoff, 0),
    };
    legSeries.forEach((legPayoffs, j) => {
      row[`leg${j}`] = legPayoffs[i];
    });
    return row;
  });

  return { rows, series };
}

function extractStrikes(params: Record<string, number> | undefined, spot: number) {
  const levels: { key: string; value: number; color: string }[] = [];
  if (params) {
    ["K", "K1", "K2", "K3", "K4"].forEach((k) => {
      if (params[k] != null && !levels.some((l) => l.value === params[k])) {
        levels.push({ key: k, value: params[k], color: STRIKE_COLORS[k] ?? "#64748b" });
      }
    });
  }
  if (!levels.some((l) => l.value === spot)) {
    levels.unshift({ key: "S0", value: spot, color: STRIKE_COLORS.S0 });
  }
  return levels.sort((a, b) => a.value - b.value);
}

function PayoffTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; dataKey?: string }[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].filter((p) => !String(p.dataKey).includes("Zone")).sort((a, b) => {
    if (a.dataKey === "payoff") return -1;
    if (b.dataKey === "payoff") return 1;
    return 0;
  });
  return (
    <div className="fin-tooltip">
      <p className="fin-tooltip-head">Spot = {Number(label).toFixed(2)}</p>
      <div className="space-y-1">
        {sorted.map((p) => (
          <div key={p.name} className="flex justify-between gap-6 text-[11px] font-mono tabular-nums">
            <span className="flex items-center gap-1.5 truncate max-w-[120px]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="text-slate-400 truncate">
              <ProseMath text={String(p.name)} stripParens={false} />
            </span>
            </span>
            <span style={{ color: p.color }}>{formatCurrencyFull(Number(p.value))}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PayoffChart({
  data,
  spot,
  params,
  loading,
  legLabels = [],
  highlightLegIndex = null,
}: PayoffChartProps) {
  if (loading) {
    return (
      <div className="h-[440px] flex items-center justify-center fin-chart-frame rounded-xl">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-cyan-400/80 text-sm font-mono"
        >
          Computing Payoff…
        </motion.div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[440px] flex items-center justify-center fin-chart-frame rounded-xl text-slate-600 text-sm">
        Adjust Parameters To Render Payoff
      </div>
    );
  }

  const { rows, series } = buildChartData(data, legLabels);
  const strikes = extractStrikes(params, spot);
  const breakevens = Array.isArray(data.metrics?.breakevens) ? (data.metrics.breakevens as number[]) : [];
  const maxProfit = Number(data.metrics?.maxProfit ?? 0);
  const maxLoss = Number(data.metrics?.maxLoss ?? 0);
  const spotMin = data.spotPrices[0];
  const spotMax = data.spotPrices[data.spotPrices.length - 1];

  const yValues = rows.flatMap((row) => {
    const vals = [row.payoff];
    series.forEach((s) => {
      if (typeof row[s.key] === "number") vals.push(row[s.key] as number);
    });
    return vals;
  });
  const yLo = Math.min(...yValues);
  const yHi = Math.max(...yValues);
  const yPad = Math.max((yHi - yLo) * 0.12, 2);
  const yDomain: [number, number] = [yLo - yPad, yHi + yPad];

  const legendItems = [
    { key: "profit", label: "Profit Zone", color: "#10b981", dashed: false, active: false, dimmed: false },
    { key: "loss", label: "Loss Zone", color: "#f43f5e", dashed: false, active: false, dimmed: false },
    ...series.map((s, i) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      dashed: true,
      active: highlightLegIndex === i,
      dimmed: highlightLegIndex !== null && highlightLegIndex !== i,
    })),
    {
      key: "payoff",
      label: "Net P/L",
      color: NET_PAYOFF_COLOR,
      dashed: false,
      active: highlightLegIndex === null,
      dimmed: false,
    },
  ];

  return (
    <ChartFrame
      yLabel="P / L"
      xLabel="Spot At Expiry"
      height={420}
      meta={
        <>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            Profit
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500/80" />
            Loss
          </span>
          <span className="text-slate-600">|</span>
          <span>
            Origin{" "}
            <strong className="text-slate-300">Y = 0</strong>
          </span>
          <span className="text-slate-600">|</span>
          <span>
            <ProseMath text="S_0" stripParens={false} />{" "}
            <strong className="text-cyan-400 tabular-nums">{spot.toFixed(2)}</strong>
          </span>
          {breakevens.length > 0 && (
            <>
              <span className="text-slate-600">|</span>
              <span>
                BE{" "}
                <strong className="text-amber-400/90 tabular-nums">
                  {breakevens.map((b) => b.toFixed(1)).join(" · ")}
                </strong>
              </span>
            </>
          )}
          {data.metrics?.payoffAtSpot != null && (
            <>
              <span className="text-slate-600">|</span>
              <span>
                <ProseMath text="@ S_0" stripParens={false} />{" "}
                <strong className="text-emerald-400/90 tabular-nums">
                  {formatCurrencyFull(Number(data.metrics.payoffAtSpot))}
                </strong>
              </span>
            </>
          )}
        </>
      }
      legend={<ChartLegendPills items={legendItems} />}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="profitZoneFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lossZoneFill" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="payoffStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" strokeDasharray="2 6" vertical={false} />
          <XAxis
            dataKey="spot"
            axisLine={{ stroke: "#334155", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            tickFormatter={formatSpotTick}
            tickCount={6}
            minTickGap={48}
            padding={{ left: 8, right: 8 }}
          />
          <YAxis
            axisLine={{ stroke: "#334155", strokeWidth: 1 }}
            tickLine={false}
            width={44}
            tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
            tickFormatter={formatPnLTick}
            tickCount={5}
            domain={yDomain}
          />
          <Tooltip content={<PayoffTooltip />} cursor={{ stroke: "#475569", strokeWidth: 1 }} />
          {/* Profit / loss shading vs zero line */}
          <Area
            type="monotone"
            dataKey="profitZone"
            stroke="none"
            fill="url(#profitZoneFill)"
            isAnimationActive={false}
            activeDot={false}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="lossZone"
            stroke="none"
            fill="url(#lossZoneFill)"
            isAnimationActive={false}
            activeDot={false}
            legendType="none"
          />
          {/* Breakeven band highlights */}
          {breakevens.map((be, i) => (
            <ReferenceArea
              key={`be-${i}`}
              x1={be - (spotMax - spotMin) * 0.008}
              x2={be + (spotMax - spotMin) * 0.008}
              fill="#fbbf24"
              fillOpacity={0.12}
              strokeOpacity={0}
            />
          ))}
          {/* Origin — P/L = 0 */}
          <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.5} />
          {/* Cap levels */}
          {Number.isFinite(maxProfit) && maxProfit !== Infinity && (
            <ReferenceLine
              y={maxProfit}
              stroke="#10b981"
              strokeDasharray="6 4"
              strokeOpacity={0.55}
            />
          )}
          {Number.isFinite(maxLoss) && maxLoss !== -Infinity && (
            <ReferenceLine
              y={maxLoss}
              stroke="#f43f5e"
              strokeDasharray="6 4"
              strokeOpacity={0.55}
            />
          )}
          {/* Strike & spot markers */}
          {strikes.map((s) => (
            <ReferenceLine
              key={s.key}
              x={s.value}
              stroke={s.color}
              strokeDasharray={s.key === "S0" ? "4 4" : "2 5"}
              strokeOpacity={s.key === "S0" ? 0.75 : 0.45}
            />
          ))}
          {series.map((s, i) => {
            const highlighted = highlightLegIndex === i;
            const dimmed = highlightLegIndex !== null && !highlighted;
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={highlighted ? 2.5 : 1.25}
                strokeDasharray={highlighted ? "0" : "5 4"}
                strokeOpacity={dimmed ? 0.2 : 0.85}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            );
          })}
          <Line
            type="monotone"
            dataKey="payoff"
            name="Net P/L"
            stroke="url(#payoffStroke)"
            strokeWidth={2.75}
            dot={false}
            activeDot={{ r: 5, fill: NET_PAYOFF_COLOR, stroke: "#0a0e17", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
