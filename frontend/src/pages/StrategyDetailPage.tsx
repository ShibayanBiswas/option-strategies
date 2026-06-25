import { motion } from "framer-motion";
import { ArrowLeft, Activity, Sigma } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {

  fetchPayoff,

  fetchStrategy,

  type PayoffResponse,

  type StrategyDetail,

} from "../api/client";

import { Badge, GlassCard, Stat } from "../components/GlassCard";

import { NotationGrid } from "../components/NotationGrid";
import { Latex } from "../components/Latex";
import { ProseMath } from "../components/ProseMath";
import { titleCase } from "../utils/formatText";

import { DirectionalPanel } from "../components/DirectionalPanel";

import { FormulaDeck } from "../components/FormulaDeck";

import { GreeksChart } from "../components/GreeksChart";

import { GreekSectionShell } from "../components/GreekSectionShell";

import { GreeksPanel } from "../components/GreeksPanel";

import { LaymanGreekCards, type LaymanGreekBlock } from "../components/LaymanGreekCards";

import { MathBlock } from "../components/MathBlock";

import { DisplayLeg, LegStructurePanel } from "../components/LegStructurePanel";

import { ParamControls } from "../components/ParamControls";

import { PayoffChart } from "../components/PayoffChart";

import { ResearchSection } from "../components/ResearchLayout";
import { capParagraphs } from "../utils/capParagraphs";
import { constrainParams, hasStrikeRules } from "../utils/paramConstraints";
import { payoffChartHighlightIndex, structurePayoffLabels } from "../utils/payoffChartLegs";



export function StrategyDetailPage() {

  const { id } = useParams<{ id: string }>();

  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);

  const [params, setParams] = useState<Record<string, number>>({});

  const [payoff, setPayoff] = useState<PayoffResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [highlightLeg, setHighlightLeg] = useState<number | null>(null);



  useEffect(() => {

    if (!id) return;

    fetchStrategy(id).then((r) => {

      setStrategy(r.data);

      if (r.data.defaultParams) setParams({ ...r.data.defaultParams });

    });

  }, [id]);



  const loadPayoff = useCallback(async () => {

    if (!id || !strategy?.hasPayoff) return;

    setLoading(true);

    setError(null);

    try {

      const { data } = await fetchPayoff(id, params);

      setPayoff(data);

    } catch {

      setError("Analytics engine unavailable — start the Python service on port 8000, then refresh.");

      setPayoff(null);

    } finally {

      setLoading(false);

    }

  }, [id, strategy?.hasPayoff, params]);



  useEffect(() => {

    const t = setTimeout(loadPayoff, 300);

    return () => clearTimeout(t);

  }, [loadPayoff]);



  if (!strategy) {

    return <div className="text-slate-500 animate-pulse font-serif">Loading strategy monograph…</div>;

  }



  const metrics = payoff?.metrics;

  const payoffLabels = payoff?.legPayoffs?.labels ?? [];
  const chartLabels = payoffLabels.length ? payoffLabels : (strategy.legs?.map((l) => l.title) ?? []);
  const structureLabels = structurePayoffLabels(id, payoffLabels, strategy.legs?.length ?? 0);
  const payoffHighlight = payoffChartHighlightIndex(id, highlightLeg);

  const overviewParagraphs = capParagraphs(strategy.paragraphs || [strategy.description]);



  return (

    <article className="research-doc max-w-7xl mx-auto space-y-8 no-scrollbar overflow-x-hidden pb-12">

      <Link to="/strategies" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-serif">

        <ArrowLeft className="w-4 h-4" /> Back to strategies

      </Link>



      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="research-paper-head !pb-8 !pt-4">

        <p className="research-doc-type">

          {titleCase(strategy.category.replace(/-/g, " "))} · {strategy.section ? `§${strategy.section.replace("2.", "")}` : "Strategy Monograph"}

        </p>

        <h1 className="research-doc-title !text-[1.75rem] !mb-4">{strategy.name}</h1>

        <div className="flex flex-wrap justify-center gap-2">

          <Badge variant="default">{titleCase(strategy.outlook?.replace(/-/g, " ") ?? "")}</Badge>

          {strategy.hasPayoff ? (

            <Badge variant="success">{strategy.isApproximate ? "Approximate payoff" : "Live payoff"}</Badge>

          ) : (

            <Badge variant="warn">Catalog only</Badge>

          )}

        </div>

      </motion.header>



      <GlassCard className="research-paper-body">

        <ResearchSection number="§1" title="Strategy Overview">

          <div className="research-prose">

            {overviewParagraphs.map((p, i) => (

              <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>

                <ProseMath text={p} />

              </motion.p>

            ))}

          </div>

          {strategy.conditions && strategy.conditions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-serif">
                Conditions &amp; Structural Requirements
              </p>
              <ul className="space-y-2">
                {strategy.conditions.map((c, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-white/[0.03] border border-surface-border px-3 py-2"
                  >
                    <span className="shrink-0 rounded-md bg-accent-cyan/10 px-2 py-1">
                      <Latex math={c.latex} />
                    </span>
                    <span className="text-sm text-slate-300 font-serif">
                      <ProseMath text={c.note} stripParens={false} />
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {strategy.notation && strategy.notation.length > 0 && (
            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-serif">Symbol Reference</p>
              <NotationGrid items={strategy.notation} />
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-surface-border text-sm font-serif">

            <div>

              <span className="text-slate-500 block mb-1 research-doc-type !text-[0.65rem]">Market outlook</span>

              <span className="text-white">{titleCase(strategy.outlook?.replace(/-/g, " ") ?? "")}</span>

            </div>

            <div>

              <span className="text-slate-500 block mb-1 research-doc-type !text-[0.65rem]">Primary risk</span>

              <span className="text-white"><ProseMath text={strategy.risk ?? ""} /></span>

            </div>

            <div>

              <span className="text-slate-500 block mb-1 research-doc-type !text-[0.65rem]">Strategy type</span>

              <span className="text-white">{titleCase(strategy.riskType?.replace("-", " ") ?? "")}</span>

            </div>

          </div>

        </ResearchSection>

      </GlassCard>



      {strategy.legs && (
        <GlassCard delay={0.04} className="research-paper-body">
          <ResearchSection number="" title="Position Structure">
            <LegStructurePanel
              legs={strategy.legs as DisplayLeg[]}
              activeIndex={highlightLeg}
              onSelect={setHighlightLeg}
              chartLabels={structureLabels ?? chartLabels}
            />
          </ResearchSection>
        </GlassCard>
      )}

      {strategy.hasPayoff && strategy.paramSchema && (
        <GlassCard delay={0.05} className="research-paper-body">
          <ResearchSection number="" title="Parameters">
            <ParamControls
              schema={strategy.paramSchema}
              values={params}
              onChange={(key, val) =>
                setParams((p) => constrainParams(id, { ...p, [key]: val }))
              }
              onReset={() => strategy.defaultParams && setParams({ ...strategy.defaultParams })}
              showStrikeHint={hasStrikeRules(id)}
              horizontal
            />
          </ResearchSection>
        </GlassCard>
      )}

      {strategy.hasPayoff && (
        <GlassCard delay={0.06} className="research-paper-body">
          <ResearchSection number="§2" title="Live Payoff At Expiration">
            <div className="research-prose !mb-4">
              <p>
                <ProseMath text="The chart below is live: dashed curves show each leg's component payoff at expiry, and the solid cyan line is net profit or loss after premium. Green shading marks spots where f_T > 0; red shading marks f_T < 0. Hover any point for dollar values, and use the structure panel to highlight individual legs." />
              </p>
            </div>

            {error && (
              <div className="text-rose-400 text-sm mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            <PayoffChart
              data={payoff}
              spot={params.S0 ?? 100}
              params={params}
              loading={loading}
              legLabels={chartLabels}
              highlightLegIndex={payoffHighlight}
            />

            {metrics && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Stat label="Max Profit" value={`$${Number(metrics.maxProfit).toFixed(2)}`} tone="emerald" />
                <Stat label="Max Loss" value={`$${Number(metrics.maxLoss).toFixed(2)}`} tone="amber" />
                <Stat
                  label="Breakevens"
                  value={
                    Array.isArray(metrics.breakevens) && metrics.breakevens.length
                      ? (metrics.breakevens as number[]).map((b) => `$${b}`).join(", ")
                      : "—"
                  }
                  tone="cyan"
                />
                <Stat label={<ProseMath text="P/L @ S_0" stripParens={false} />} value={`$${Number(metrics.payoffAtSpot).toFixed(2)}`} tone="violet" />
              </motion.div>
            )}
          </ResearchSection>
        </GlassCard>
      )}

      <GlassCard delay={0.08} className="research-paper-body overflow-hidden">
        <ResearchSection number="§3" title="Live Greek Sensitivities">
          <GreekSectionShell
            icon={Sigma}
            title="Interactive Greek Laboratory"
            subtitle="Scalars, Layman Guide, Leg Table, And Spot Profiles"
            badge={strategy.hasPayoff && payoff?.greeks ? <Badge variant="success">Live</Badge> : undefined}
            accent="violet"
          >
            <div className="research-prose greek-intro-prose">
              {capParagraphs(strategy.greeksProfile?.intuition || strategy.greeksProfile?.paragraphs).map((p, i) => (
                <p key={i} className="greek-intuition-line">
                  <ProseMath text={p} />
                </p>
              ))}
            </div>

            {strategy.greeksProfile?.laymanGreeks && strategy.greeksProfile.laymanGreeks.length > 0 && (
              <div className="mt-6 mb-6">
                <LaymanGreekCards blocks={strategy.greeksProfile.laymanGreeks as LaymanGreekBlock[]} />
              </div>
            )}

            {payoff?.greeks ? (
              <>
                <div className="mt-5 mb-6">
                  <GreeksPanel aggregate={payoff.greeks.aggregate} legs={payoff.greeks.legs} />
                </div>

                <div className="greek-chart-banner">
                  <Activity className="w-4 h-4 text-cyan-400" strokeWidth={1.75} />
                  <div>
                    <h3 className="greek-chart-banner-title">{titleCase("Live Greek Curves Vs Spot")}</h3>
                    <p className="greek-chart-banner-desc">Dashed = Legs · Solid = Net Book</p>
                  </div>
                </div>

                <GreeksChart
                  spotPrices={payoff.spotPrices}
                  aggregateProfiles={payoff.greeks.aggregateProfiles}
                  legs={payoff.greeks.legs}
                  spot={params.S0 ?? 100}
                  highlightLegIndex={highlightLeg}
                  chartHeight={380}
                />

                {strategy.greeksProfile?.legBreakdown && (
                  <div className="mt-6">
                    <h3 className="greek-leg-ref-head">Leg-by-leg reference</h3>
                    <div className="greek-leg-ref-grid">
                      {strategy.greeksProfile.legBreakdown.map((lb) => (
                        <motion.div key={lb.id} whileHover={{ y: -2 }} className="greek-leg-ref-card">
                          <p className="greek-leg-ref-label"><ProseMath text={lb.label} stripParens={false} /></p>
                          <p className="greek-leg-ref-text"><ProseMath text={lb.text} /></p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.greeksProfile?.aggregate && (
                  <p className="greek-aggregate-note"><ProseMath text={strategy.greeksProfile.aggregate} /></p>
                )}
              </>
            ) : (
              <p className="text-slate-500 text-sm mt-4 font-serif">{error || "Loading live Greeks…"}</p>
            )}
          </GreekSectionShell>
        </ResearchSection>
      </GlassCard>

      {strategy.directionalProfile && (
        <GlassCard delay={0.1} className="research-paper-body overflow-hidden">
          <ResearchSection number="§4" title="Net Directional Movement">
            <GreekSectionShell
              icon={Activity}
              title="Directional Compass & Net Bias"
              subtitle={
                <ProseMath
                  text="Live Δ_net, ∂f_T/∂S|_{S_0}, and formal identities"
                  stripParens={false}
                />
              }
              accent="cyan"
            >
              <DirectionalPanel
                staticLatex={strategy.directionalProfile.latex}
                staticParagraphs={strategy.directionalProfile.paragraphs}
                live={payoff?.directional ?? null}
              />
            </GreekSectionShell>
          </ResearchSection>
        </GlassCard>
      )}



      {strategy.payoffEquationBlock && (
        <GlassCard delay={0.15} className="research-paper-body">
          <ResearchSection number="§5" title="Payoff Formalism">
            <MathBlock
              title={strategy.payoffEquationBlock.title}
              context={strategy.payoffEquationBlock.context}
              notation={strategy.payoffEquationBlock.notation}
              equations={strategy.payoffEquationBlock.equations}
              maxEquations={2}
              compact
            />

            {strategy.additionalEquations && Object.keys(strategy.additionalEquations).length > 0 && (
              <FormulaDeck formulas={strategy.additionalEquations} title="Additional Identities" compact />
            )}
          </ResearchSection>
        </GlassCard>
      )}

    </article>

  );

}


