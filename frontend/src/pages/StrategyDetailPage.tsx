import { ArrowLeft, Activity, Sigma } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  fetchNiftyMarket,
  fetchPayoff,
  fetchStrategy,
  invalidateStrategyCache,
  type PayoffResponse,
  type StrategyDetail,
} from "../api/client";
import { Badge, GlassCard, Stat } from "../components/GlassCard";
import { NotationGrid } from "../components/NotationGrid";
import { Latex } from "../components/Latex";
import { ProseMath } from "../components/ProseMath";
import { titleCase } from "../utils/formatText";
import { formatINR, formatINRLevel } from "../utils/money";
import { DirectionalPanel } from "../components/DirectionalPanel";
import { FormulaDeck } from "../components/FormulaDeck";
import { GreeksChart } from "../components/GreeksChart";
import { GreekSectionShell } from "../components/GreekSectionShell";
import { GreeksPanel } from "../components/GreeksPanel";
import { LaymanGreekCards, type LaymanGreekBlock } from "../components/LaymanGreekCards";
import { DisplayLeg, LegStructurePanel } from "../components/LegStructurePanel";
import { ParamControls } from "../components/ParamControls";
import { PayoffChart } from "../components/PayoffChart";
import { ResearchSection } from "../components/ResearchLayout";
import { capParagraphs } from "../utils/capParagraphs";
import { constrainParams, hasStrikeRules } from "../utils/paramConstraints";
import { payoffChartHighlightIndex, structurePayoffLabels } from "../utils/payoffChartLegs";
import { niftyAtmMoved } from "../utils/istMarketDay";
import { paramsFingerprint, syncSpotWindow } from "../utils/syncSpotWindow";
import { equationsToFormulaRecord } from "../utils/equationsToFormulaRecord";
import type { EquationSpec } from "../components/MathBlock";
import type { GreekKey } from "../components/greekTheme";

export function StrategyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [strategy, setStrategy] = useState<StrategyDetail | null>(null);
  const [params, setParams] = useState<Record<string, number>>({});
  const [payoff, setPayoff] = useState<PayoffResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightLeg, setHighlightLeg] = useState<number | null>(null);
  const [activeGreek, setActiveGreek] = useState<GreekKey>("delta");
  /** Fingerprint of seeded default params — skip only the matching duplicate POST. */
  const seededParamsKeyRef = useRef<string | null>(null);
  const paramsRef = useRef(params);
  const strategyRef = useRef(strategy);
  paramsRef.current = params;
  strategyRef.current = strategy;

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStrategy(null);
    setPayoff(null);
    setError(null);
    setHighlightLeg(null);
    setActiveGreek("delta");
    setParams({});
    seededParamsKeyRef.current = null;

    fetchStrategy(id, { payoff: true })
      .then((r) => {
        if (cancelled) return;
        const data = r.data;
        setStrategy(data);
        if (data.defaultParams) {
          setParams({ ...data.defaultParams });
          if (data.initialPayoff) {
            setPayoff(data.initialPayoff);
            seededParamsKeyRef.current = paramsFingerprint(data.defaultParams);
          }
        }
      })
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        const detail =
          status === 404
            ? "Strategy not found."
            : status
              ? `Server error (${status}). Try again in a moment.`
              : "Could not reach the API. If you just deployed, wait for the build to finish, then refresh.";
        setError(detail);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Keep Nifty badge + desk defaults synced to the trading day / ATM moves.
  // Only auto-rescales sliders when the user is still on seeded defaults.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    let syncing = false;

    const applyFreshDefaults = async () => {
      invalidateStrategyCache(id);
      const { data } = await fetchStrategy(id, { payoff: true, fresh: true });
      if (cancelled) return;
      setStrategy(data);
      if (data.defaultParams) {
        setParams({ ...data.defaultParams });
        if (data.initialPayoff) {
          setPayoff(data.initialPayoff);
          seededParamsKeyRef.current = paramsFingerprint(data.defaultParams);
        } else {
          seededParamsKeyRef.current = null;
        }
      }
    };

    const tick = async (forceFresh = false) => {
      if (cancelled || syncing) return;
      try {
        const { data: mkt } = await fetchNiftyMarket({ fresh: forceFresh });
        if (cancelled) return;
        const s = strategyRef.current;
        if (!s) return;

        const prevAtm = s.market?.atm ?? s.market?.spot;
        const nextAtm = mkt.atm ?? mkt.spot;
        const dayChanged = Boolean(mkt.dayKey && s.market?.dayKey && mkt.dayKey !== s.market.dayKey);
        const atmMoved = niftyAtmMoved(prevAtm, nextAtm);

        setStrategy((cur) => (cur ? { ...cur, market: mkt } : cur));

        if (!(dayChanged || atmMoved)) return;

        const defaults = s.defaultParams;
        const p = paramsRef.current;
        if (!defaults || !Object.keys(p).length) return;
        // Preserve custom slider work — only auto-sync when still on desk defaults
        if (paramsFingerprint(p) !== paramsFingerprint(defaults)) return;

        syncing = true;
        await applyFreshDefaults();
      } catch {
        // Badge / sync blips should not surface as page errors
      } finally {
        syncing = false;
      }
    };

    const onFocus = () => {
      void tick(true);
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void tick(true);
    };

    const interval = setInterval(() => {
      void tick(false);
    }, 60_000);
    const boot = setTimeout(() => {
      void tick(false);
    }, 12_000);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearInterval(interval);
      clearTimeout(boot);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [id]);

  const loadPayoff = useCallback(async () => {
    if (!id || !strategy?.hasPayoff) return;
    if (!Object.keys(params).length) return;

    const key = paramsFingerprint(params);
    if (seededParamsKeyRef.current != null) {
      const seededKey = seededParamsKeyRef.current;
      seededParamsKeyRef.current = null;
      // Only skip when params still match the seeded defaults (avoids stale charts on early slider moves)
      if (key === seededKey) return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data } = await fetchPayoff(id, params);
      setPayoff(data);
    } catch {
      setError("Analytics engine unavailable — ensure the API is running, then refresh.");
      setPayoff(null);
    } finally {
      setLoading(false);
    }
  }, [id, strategy?.hasPayoff, params]);

  useEffect(() => {
    const t = setTimeout(loadPayoff, 220);
    return () => clearTimeout(t);
  }, [loadPayoff]);

  const handleParamChange = useCallback(
    (key: string, val: number) => {
      setParams((p) => {
        const drafted = { ...p, [key]: val };
        const windowed = key === "S0" ? syncSpotWindow(p, drafted) : drafted;
        return constrainParams(id, windowed);
      });
    },
    [id],
  );

  const handleResetToNifty = useCallback(async () => {
    if (!id) return;
    setResetting(true);
    setError(null);
    try {
      const { data } = await fetchStrategy(id, { payoff: true, fresh: true });
      setStrategy(data);
      if (data.defaultParams) {
        setParams({ ...data.defaultParams });
        if (data.initialPayoff) {
          setPayoff(data.initialPayoff);
          seededParamsKeyRef.current = paramsFingerprint(data.defaultParams);
        } else {
          seededParamsKeyRef.current = null;
        }
      }
    } catch {
      setError("Could not refresh live Nifty defaults. Try again in a moment.");
    } finally {
      setResetting(false);
    }
  }, [id]);

  if (!strategy && !error) {
    return <div className="text-ar-subtle animate-pulse font-serif">Loading strategy monograph…</div>;
  }

  if (!strategy && error) {
    return <div className="text-rose-400 font-serif">{error}</div>;
  }

  if (!strategy) return null;

  const metrics = payoff?.metrics;
  const spot = Number.isFinite(params.S0) ? Number(params.S0) : strategy.market?.atm ?? strategy.market?.spot ?? 100;

  const payoffLabels = payoff?.legPayoffs?.labels ?? [];
  const chartLabels = payoffLabels.length ? payoffLabels : (strategy.legs?.map((l) => l.title) ?? []);
  const structureLabels = structurePayoffLabels(id, payoffLabels, strategy.legs?.length ?? 0);
  const payoffHighlight = payoffChartHighlightIndex(id, highlightLeg);

  const overviewParagraphs = capParagraphs(strategy.paragraphs || [strategy.description]);

  return (

    <article className="research-doc w-full space-y-8 no-scrollbar overflow-x-clip pb-12">

      <Link to="/strategies" className="inline-flex items-center gap-2 text-ar-muted hover:text-ar-ink text-sm font-serif">

        <ArrowLeft className="w-4 h-4" /> Back to strategies

      </Link>



      <header className="research-paper-head !pb-8 !pt-4">

        <p className="research-doc-type">

          {titleCase(strategy.category.replace(/-/g, " "))} · Strategy Monograph

        </p>

        <h1 className="research-doc-title !text-[1.75rem] !mb-4">{strategy.name}</h1>

        <div className="flex flex-wrap justify-center gap-2">

          <Badge variant="default">{titleCase(strategy.outlook?.replace(/-/g, " ") ?? "")}</Badge>

          {strategy.hasPayoff ? (

            <Badge variant="success">{strategy.isApproximate ? "Approximate payoff" : "Live payoff"}</Badge>

          ) : (

            <Badge variant="warn">Catalog only</Badge>

          )}

          {strategy.market?.atm != null && (
            <Badge variant="default">
              Nifty ATM {Math.round(strategy.market.atm).toLocaleString("en-IN")}
              {strategy.market.asOf
                ? ` · ${new Date(strategy.market.asOf).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </Badge>
          )}

        </div>

      </header>



      <GlassCard className="research-paper-body">

        <ResearchSection number="§1" title="Strategy Overview">

          <div className="research-prose">

            {overviewParagraphs.map((p, i) => (

              <p key={i}>

                <ProseMath text={p} />

              </p>

            ))}

          </div>

          {strategy.conditions && strategy.conditions.length > 0 && (
            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-xs uppercase tracking-wider text-ar-subtle mb-3 font-serif">
                Conditions &amp; Structural Requirements
              </p>
              <ul className="space-y-2">
                {strategy.conditions.map((c, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-white/[0.03] border border-surface-border px-3 py-2"
                  >
                    <span className="shrink-0 rounded-md bg-accent-cyan/10 px-2 py-1">
                      <Latex math={c.latex} />
                    </span>
                    <span className="text-sm text-ar-muted font-serif">
                      <ProseMath text={c.note} stripParens={false} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {strategy.notation && strategy.notation.length > 0 && !strategy.payoffEquationBlock && (
            <div className="mt-6 pt-6 border-t border-surface-border">
              <p className="text-xs uppercase tracking-wider text-ar-subtle mb-3 font-serif">Symbol Reference</p>
              <NotationGrid items={strategy.notation} />
            </div>
          )}

          <div className="strategy-meta-cards">
            <article className="strategy-meta-card strategy-meta-outlook">
              <span className="strategy-meta-label">Market outlook</span>
              <p className="strategy-meta-value">
                {titleCase(strategy.outlook?.replace(/-/g, " ") ?? "—")}
              </p>
            </article>
            <article className="strategy-meta-card strategy-meta-risk">
              <span className="strategy-meta-label">Primary risk</span>
              <p className="strategy-meta-value">
                <ProseMath text={strategy.risk ?? "—"} />
              </p>
            </article>
            <article className="strategy-meta-card strategy-meta-type">
              <span className="strategy-meta-label">Strategy type</span>
              <p className="strategy-meta-value">
                {titleCase(strategy.riskType?.replace(/-/g, " ") ?? "—")}
              </p>
            </article>
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
              onChange={handleParamChange}
              onReset={handleResetToNifty}
              resetBusy={resetting}
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
                <ProseMath text="The chart below is live: dashed curves show each leg's component payoff at expiry, and the solid gold line is net profit or loss after premium. Green shading marks spots where f_T > 0; red shading marks f_T < 0. Hover any point for rupee values, and use the structure panel to highlight individual legs." />
              </p>
            </div>

            {error && (
              <div className="text-rose-400 text-sm mb-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                {error}
              </div>
            )}

            <PayoffChart
              data={payoff}
              spot={spot}
              params={params}
              loading={loading}
              legLabels={chartLabels}
              highlightLegIndex={payoffHighlight}
            />

            {metrics && (
              <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
                <Stat label="Max Profit" value={formatINR(Number(metrics.maxProfit))} tone="emerald" />
                <Stat label="Max Loss" value={formatINR(Number(metrics.maxLoss))} tone="amber" />
                <Stat
                  label="Breakevens"
                  value={
                    Array.isArray(metrics.breakevens) && metrics.breakevens.length
                      ? (metrics.breakevens as number[]).map((b) => formatINRLevel(Number(b))).join(", ")
                      : "—"
                  }
                  tone="cyan"
                />
                <Stat
                  label={
                    <span className="inline-flex items-center gap-1">
                      P/L @ <Latex math="S_0" />
                    </span>
                  }
                  value={formatINR(Number(metrics.payoffAtSpot))}
                  tone="violet"
                />
              </div>
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
                <LaymanGreekCards
                  blocks={strategy.greeksProfile.laymanGreeks as LaymanGreekBlock[]}
                />
              </div>
            )}

            {payoff?.greeks ? (
              <>
                <div className="mt-5 mb-6">
                  <GreeksPanel
                    aggregate={payoff.greeks.aggregate}
                    legs={payoff.greeks.legs}
                    selectedGreek={activeGreek}
                    onSelectGreek={setActiveGreek}
                  />
                </div>

                <div className="greek-chart-banner">
                  <Activity className="w-4 h-4 text-ar-gold" strokeWidth={1.75} />
                  <div>
                    <h3 className="greek-chart-banner-title">{titleCase("Live Greek Curves Vs Spot")}</h3>
                    <p className="greek-chart-banner-desc">Dashed = Legs · Solid = Net Book · Click a tile or tab to switch Greek</p>
                  </div>
                </div>

                <GreeksChart
                  spotPrices={payoff.spotPrices}
                  aggregateProfiles={payoff.greeks.aggregateProfiles}
                  legs={payoff.greeks.legs}
                  spot={spot}
                  highlightLegIndex={highlightLeg}
                  chartHeight={380}
                  activeGreek={activeGreek}
                  onActiveGreekChange={setActiveGreek}
                />

                {strategy.greeksProfile?.legBreakdown && (
                  <div className="mt-6">
                    <h3 className="greek-leg-ref-head">Leg-by-leg reference</h3>
                    <div className="greek-leg-ref-grid">
                      {strategy.greeksProfile.legBreakdown.map((lb) => (
                        <div key={lb.id} className="greek-leg-ref-card">
                          <p className="greek-leg-ref-label"><ProseMath text={lb.label} stripParens={false} /></p>
                          <p className="greek-leg-ref-text"><ProseMath text={lb.text} /></p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {strategy.greeksProfile?.aggregate && (
                  <p className="greek-aggregate-note"><ProseMath text={strategy.greeksProfile.aggregate} /></p>
                )}
              </>
            ) : (
              <p className="text-ar-subtle text-sm mt-4 font-serif">{error || "Loading live Greeks…"}</p>
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
            <FormulaDeck
              title={strategy.payoffEquationBlock.title || "Terminal Payoff Identities"}
              deckContext={strategy.payoffEquationBlock.context}
              sharedNotation={strategy.payoffEquationBlock.notation}
              formulas={equationsToFormulaRecord(
                (strategy.payoffEquationBlock.equations || []) as EquationSpec[],
              )}
              defaultExpanded="netPayoff"
              compact
            />
          </ResearchSection>
        </GlassCard>
      )}

    </article>

  );

}


