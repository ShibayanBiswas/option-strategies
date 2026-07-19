import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { fetchPayoff, type PayoffResponse } from "../api/client";
import { ProseMath } from "./ProseMath";
import { Sigma } from "lucide-react";
import { GreeksChart } from "./GreeksChart";
import { GreekSectionShell } from "./GreekSectionShell";
import { GreeksPanel } from "./GreeksPanel";
import { MathBlock } from "./MathBlock";
import { ParamControls } from "./ParamControls";
import { PayoffChart } from "./PayoffChart";

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

  const current = options[active];

  useEffect(() => {
    if (options[active]) setParams({ ...options[active].defaultParams });
  }, [active, options]);

  const load = useCallback(async () => {
    if (!current) return;
    setLoading(true);
    try {
      const { data } = await fetchPayoff(current.id, params);
      setPayoff(data);
    } catch {
      setPayoff(null);
    } finally {
      setLoading(false);
    }
  }, [current, params]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  if (!current) return null;

  const payoffEquations = [
    {
      latex: current.payoffLatex,
      context: "Terminal profit or loss f_T at expiration for this single option leg.",
      notation: [
        { symbol: "f_T", meaning: "Terminal P/L" },
        { symbol: "S_T", meaning: "Spot at expiration" },
        { symbol: "K", meaning: "Strike price" },
        ...(current.id.includes("short") ? [{ symbol: "C", meaning: "Premium received" }] : [{ symbol: "D", meaning: "Premium paid" }]),
      ],
    },
    ...(current.breakevenLatex
      ? [
          {
            latex: current.breakevenLatex,
            context: "Spot where the net payoff crosses zero.",
            notation: [{ symbol: "S^*", meaning: "Breakeven spot" }],
          },
        ]
      : []),
  ];

  return (
    <div className="research-lab w-full overflow-hidden rounded-lg border border-ar-border bg-surface/30 p-6">
      <h3 className="text-lg font-semibold text-ar-ink mb-4 font-serif italic">Laboratory Controls</h3>
      <div className="flex flex-wrap gap-2 mb-6">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border font-serif ${
              active === i
                ? "bg-gradient-to-r from-ar-gold/20 to-ar-maroon/10 border-ar-gold/40 text-ar-ink"
                : "border-surface-border text-ar-muted hover:text-ar-ink hover:border-ar-border"
            }`}
          >
            <span className={opt.direction === "Long" ? "text-emerald-400" : "text-rose-400"}>{opt.direction}</span>{" "}
            {opt.name.replace(`${opt.direction} `, "")}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 w-full"
        >
          <div className="research-prose mb-4">
            <p><ProseMath text={current.description} /></p>
          </div>

          <MathBlock
            title={`${current.name} — Terminal Payoff`}
            context="Each equation includes symbol definitions used on strategy monograph pages."
            equations={payoffEquations}
            maxEquations={2}
            compact
          />

          <div className="rounded-xl border border-surface-border bg-surface/40 p-4">
            <p className="text-xs uppercase tracking-wider text-ar-subtle mb-3 font-serif">Parameters</p>
            <ParamControls
              schema={current.paramSchema}
              values={params}
              onChange={(key, val) => setParams((p) => ({ ...p, [key]: val }))}
              horizontal
            />
          </div>

          <PayoffChart
            data={payoff}
            spot={params.S0 ?? 100}
            params={params}
            loading={loading}
            legLabels={[current.name]}
          />

          {payoff?.greeks && (
            <GreekSectionShell
              icon={Sigma}
              title={<ProseMath text="Greeks at S_0" stripParens={false} />}
              subtitle={current.greeksText}
              accent="violet"
            >
              <GreeksPanel aggregate={payoff.greeks.aggregate} legs={payoff.greeks.legs} />
              <GreeksChart
                spotPrices={payoff.spotPrices}
                aggregateProfiles={payoff.greeks.aggregateProfiles}
                legs={payoff.greeks.legs}
                spot={params.S0 ?? 100}
                chartHeight={320}
              />
            </GreekSectionShell>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
