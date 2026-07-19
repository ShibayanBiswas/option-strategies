import { useCallback, useEffect, useState } from "react";
import { fetchPayoff, type PayoffResponse } from "../api/client";
import { ProseMath } from "./ProseMath";
import { Sigma } from "lucide-react";
import { FormulaDeck } from "./FormulaDeck";
import { GreeksChart } from "./GreeksChart";
import { GreekSectionShell } from "./GreekSectionShell";
import { GreeksPanel } from "./GreeksPanel";
import { ParamControls } from "./ParamControls";
import { PayoffChart } from "./PayoffChart";
import { Stat } from "./GlassCard";
import { formatINR, formatINRLevel } from "../utils/money";
import { syncSpotWindow } from "../utils/syncSpotWindow";
import { equationsToFormulaRecord } from "../utils/equationsToFormulaRecord";
import type { EquationSpec } from "./MathBlock";
import type { GreekKey } from "./greekTheme";

interface BasicOption {
  id: string;
  name: string;
  direction: string;
  description: string;
  payoffLatex: string;
  breakevenLatex?: string;
  greeksText: string;
  defaultParams: Record<string, number>;
  paramSchema: { key: string; label: string; min: number; max: number; step: number }[];
}

interface BasicOptionLabProps {
  options: BasicOption[];
}

export function BasicOptionLab({ options }: BasicOptionLabProps) {
  const [active, setActive] = useState(0);
  const [params, setParams] = useState(options[0]?.defaultParams || {});
  const [payoff, setPayoff] = useState<PayoffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeGreek, setActiveGreek] = useState<GreekKey>("delta");

  const current = options[active];

  useEffect(() => {
    if (options[active]) setParams({ ...options[active].defaultParams });
    setActiveGreek("delta");
  }, [active, options]);

  const load = useCallback(async () => {
    if (!current) return;
    if (!Object.keys(params).length) return;
    setLoading(true);
    try {
      const { data } = await fetchPayoff(current.id, params);
      setPayoff(data);
    } catch {
      // Keep last good payoff so the desk stays interactive on a blip
    } finally {
      setLoading(false);
    }
  }, [current, params]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const handleParamChange = useCallback((key: string, val: number) => {
    setParams((p) => {
      const drafted = { ...p, [key]: val };
      return key === "S0" ? syncSpotWindow(p, drafted) : drafted;
    });
  }, []);

  if (!current) return null;

  const metrics = payoff?.metrics;
  const spot = Number.isFinite(params.S0) ? Number(params.S0) : 100;

  const payoffEquations: EquationSpec[] = [
    {
      latex: current.payoffLatex,
      label: "Net terminal payoff",
      context: "Terminal profit or loss f_T at expiration for this single option leg.",
      notation: [
        { symbol: "f_T", meaning: "Terminal P/L" },
        { symbol: "S_T", meaning: "Spot at expiration" },
        { symbol: "K", meaning: "Strike price" },
        ...(current.id.includes("short")
          ? [{ symbol: "C", meaning: "Premium received" }]
          : [{ symbol: "D", meaning: "Premium paid" }]),
      ],
    },
    ...(current.breakevenLatex
      ? [
          {
            latex: current.breakevenLatex,
            label: "Breakeven",
            context: "Spot where the net payoff crosses zero.",
            notation: [{ symbol: "S^*", meaning: "Breakeven spot" }],
          } satisfies EquationSpec,
        ]
      : []),
  ];

  return (
    <div className="research-lab w-full overflow-hidden rounded-lg border border-ar-border bg-surface/30 p-6">
      <h3 className="text-lg font-semibold text-ar-ink mb-4 font-serif italic">Laboratory Controls</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {options.map((opt, i) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border font-serif ${
              active === i
                ? "bg-gradient-to-r from-ar-gold/25 to-ar-gold/10 border-ar-gold/45 text-ar-ink font-semibold"
                : "border-surface-border text-ar-muted hover:text-ar-ink hover:border-ar-border"
            }`}
          >
            <span className={opt.direction === "Long" ? "text-emerald-400" : "text-rose-400"}>{opt.direction}</span>{" "}
            {opt.name.replace(`${opt.direction} `, "")}
          </button>
        ))}
      </div>

      <div key={current.id} className="space-y-6 w-full">
          <div className="research-prose mb-4">
            <p><ProseMath text={current.description} /></p>
          </div>

          <FormulaDeck
            title={`${current.name} — Terminal Payoff`}
            deckContext="Each equation includes symbol definitions used on strategy monograph pages."
            formulas={equationsToFormulaRecord(payoffEquations)}
            defaultExpanded="netPayoff"
            compact
          />

          <div className="rounded-xl border border-surface-border bg-surface/40 p-4">
            <p className="text-xs uppercase tracking-wider text-ar-subtle mb-3 font-serif">Parameters</p>
            <ParamControls
              schema={current.paramSchema}
              values={params}
              onChange={handleParamChange}
              onReset={() => setParams({ ...current.defaultParams })}
              horizontal
            />
          </div>

          <PayoffChart
            data={payoff}
            spot={spot}
            params={params}
            loading={loading}
            legLabels={[current.name]}
          />

          {metrics && (
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
              <Stat label="Max Profit" value={formatINR(Number(metrics.maxProfit))} tone="emerald" />
              <Stat label="Max Loss" value={formatINR(Number(metrics.maxLoss))} tone="amber" />
              <Stat
                label="Breakeven(s)"
                value={
                  Array.isArray(metrics.breakevens) && metrics.breakevens.length
                    ? (metrics.breakevens as number[]).map((b) => formatINRLevel(Number(b))).join(", ")
                    : "—"
                }
              />
              <Stat label="P/L @ Spot" value={formatINR(Number(metrics.payoffAtSpot))} />
            </div>
          )}

          {payoff?.greeks && (
            <GreekSectionShell
              icon={Sigma}
              title={<ProseMath text="Greeks at S_0" stripParens={false} />}
              subtitle={current.greeksText}
              accent="violet"
            >
              <GreeksPanel
                aggregate={payoff.greeks.aggregate}
                legs={payoff.greeks.legs}
                selectedGreek={activeGreek}
                onSelectGreek={setActiveGreek}
              />
              <GreeksChart
                spotPrices={payoff.spotPrices}
                aggregateProfiles={payoff.greeks.aggregateProfiles}
                legs={payoff.greeks.legs}
                spot={spot}
                chartHeight={320}
                activeGreek={activeGreek}
                onActiveGreekChange={setActiveGreek}
              />
            </GreekSectionShell>
          )}
      </div>
    </div>
  );
}
