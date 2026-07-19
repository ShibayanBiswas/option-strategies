import { AnimatePresence, motion } from "framer-motion";
import { Activity, Compass, TrendingDown, TrendingUp } from "lucide-react";
import { BIAS_STYLES } from "./greekTheme";
import { FormulaDeck } from "./FormulaDeck";
import { Latex } from "./Latex";
import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";
import { capParagraphs } from "../utils/capParagraphs";
import { formatLegLabel } from "../utils/chartFormat";

interface DirectionalPanelProps {
  staticLatex?: Record<string, string>;
  staticParagraphs?: string[];
  live?: {
    label: string;
    netDelta: number;
    netGamma: number;
    netVega: number;
    netTheta: number;
    payoffSlopeAtSpot: number;
    liveEquations?: string[];
    latex: Record<string, string>;
    legContributions?: { leg: string; delta: number; contributionLatex?: string }[];
  } | null;
}

function signedFmt(val: number, digits = 4): string {
  return `${val >= 0 ? "+" : ""}${val.toFixed(digits)}`;
}

const LIVE_EQUATION_NOTATION = [
  { symbol: "\\Delta_{\\text{net}}", meaning: "Aggregate delta at S_0" },
  { symbol: "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S_0}", meaning: "Terminal payoff slope at today's spot" },
  { symbol: "\\Delta P", meaning: "Mark-to-market change in portfolio value" },
];

export function DirectionalPanel({ staticLatex, staticParagraphs, live }: DirectionalPanelProps) {
  const latex = live?.latex || staticLatex;
  const paragraphs = staticParagraphs;

  if (!latex && !paragraphs?.length && !live?.liveEquations?.length) return null;

  const bias = live ? BIAS_STYLES[live.label] ?? BIAS_STYLES["net-neutral"] : null;
  const BiasIcon = bias?.icon ?? Compass;
  const deltaMag = live ? Math.min(Math.abs(live.netDelta), 1) : 0;

  return (
    <div className="directional-panel space-y-6 w-full">
      {live && bias && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="directional-hero directional-hero-full"
        >
          <div className="directional-compass">
            <svg viewBox="0 0 120 120" className="directional-compass-svg">
              <circle cx="60" cy="60" r="52" className="directional-compass-ring" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                className={`directional-compass-glow ${bias.tone}`}
                strokeDasharray={`${deltaMag * 326} 326`}
                initial={{ strokeDashoffset: 326 }}
                animate={{ strokeDashoffset: 326 - deltaMag * 326 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <motion.g
                animate={{ rotate: live.label === "net-bearish" ? -35 : live.label === "net-bullish" ? 35 : 0 }}
                transition={{ type: "spring", stiffness: 80 }}
                style={{ transformOrigin: "60px 60px" }}
              >
                <line x1="60" y1="60" x2="60" y2="22" className="directional-needle" />
                <circle cx="60" cy="60" r="5" className="directional-needle-hub" />
              </motion.g>
            </svg>
            <div className="directional-compass-label">
              <BiasIcon className={`w-5 h-5 ${bias.tone}`} strokeWidth={1.75} />
              <span className={`directional-bias-text ${bias.tone}`}>{bias.label}</span>
            </div>
          </div>

          <div className="directional-metrics directional-metrics-full">
            <motion.div whileHover={{ scale: 1.02 }} className="directional-metric directional-metric-delta">
              <TrendingUp className="directional-metric-icon" strokeWidth={1.75} />
              <span className="directional-metric-key">
                <Latex math="\Delta_{\text{net}}" />
              </span>
              <span className="directional-metric-val">{signedFmt(live.netDelta)}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="directional-metric directional-metric-slope">
              <Activity className="directional-metric-icon" strokeWidth={1.75} />
              <span className="directional-metric-key">
                <Latex math="\left.\frac{\partial f_T}{\partial S}\right|_{S_0}" />
              </span>
              <span className="directional-metric-val">{signedFmt(live.payoffSlopeAtSpot)}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="directional-metric directional-metric-gamma">
              <span className="directional-metric-key">
                <Latex math="\Gamma_{\text{net}}" />
              </span>
              <span className="directional-metric-val">{signedFmt(live.netGamma, 3)}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="directional-metric directional-metric-vega">
              <span className="directional-metric-key">
                <Latex math="\nu_{\text{net}}" />
              </span>
              <span className="directional-metric-val">{signedFmt(live.netVega, 3)}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="directional-metric directional-metric-theta">
              <span className="directional-metric-key">
                <Latex math="\Theta_{\text{net}}" />
              </span>
              <span className="directional-metric-val">{signedFmt(live.netTheta, 3)}</span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {live?.liveEquations && live.liveEquations.length > 0 && (
        <div className="directional-live-math w-full">
          <p className="directional-live-math-label">
            <ProseMath text="Live identities at S_0" stripParens={false} />
          </p>
          <NotationGrid items={LIVE_EQUATION_NOTATION} />
          <p className="math-equation-context">
            <ProseMath
              text="Values below are computed at the current sidebar settings for S_0, σ, T, and strikes."
              stripParens={false}
            />
          </p>
          <div className="directional-live-math-stack">
            {live.liveEquations.map((eq) => (
              <Latex key={eq} math={eq} block fullWidth className="directional-live-eq" />
            ))}
          </div>
        </div>
      )}

      {paragraphs && paragraphs.length > 0 && (
        <div className="research-prose directional-prose">
          {capParagraphs(paragraphs).map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="directional-prose-line"
            >
              <ProseMath text={p} />
            </motion.p>
          ))}
        </div>
      )}

      {latex && <FormulaDeck formulas={latex} title="Formal Identities" compact defaultExpanded="netDelta" />}

      <AnimatePresence>
        {live?.legContributions && live.legContributions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="directional-legs directional-legs-full"
          >
            <div className="directional-legs-head">
              <TrendingDown className="w-4 h-4 text-ar-gold rotate-180" />
              <span>
                <ProseMath text="Leg Δ_i at S_0" stripParens={false} />
              </span>
            </div>
            <div className="directional-legs-grid">
              {live.legContributions.map((lc, i) => (
                <motion.div
                  key={lc.leg}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="directional-leg-card card-shine"
                >
                  <p className="directional-leg-name">
                    <ProseMath text={formatLegLabel(lc.leg)} stripParens={false} />
                  </p>
                  <p className="directional-leg-delta">
                    <ProseMath text={`Δ_i = ${lc.delta.toFixed(4)}`} stripParens={false} />
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
