import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { GREEK_META, greekKeyFromName, type GreekKey } from "./greekTheme";
import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";
import { Latex } from "./Latex";
import { capParagraphs } from "../utils/capParagraphs";

export interface GreekCardData {
  symbol: string;
  name: string;
  formula: string;
  formulaContext?: string;
  formulaNotation?: { symbol: string; meaning: string }[];
  paragraphs?: string[];
  callProfile?: string;
  putProfile?: string;
}

function resolveGreekKey(card: GreekCardData): GreekKey {
  return greekKeyFromName(card.name) ?? "delta";
}

export function GreeksExplorer({ greeks }: { greeks: GreekCardData[] }) {
  const [index, setIndex] = useState(0);
  const card = greeks[index];
  const gKey = resolveGreekKey(card);
  const meta = GREEK_META[gKey];
  const Icon = meta.icon;

  const prev = () => setIndex((i) => (i === 0 ? greeks.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === greeks.length - 1 ? 0 : i + 1));

  return (
    <div className="greek-explorer">
      <div className="greek-explorer-tabs">
        {greeks.map((g, i) => {
          const k = resolveGreekKey(g);
          const m = GREEK_META[k];
          const TabIcon = m.icon;
          return (
            <motion.button
              key={g.name}
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIndex(i)}
              className={`greek-tab ${i === index ? "greek-tab-active" : ""} greek-tab-${k}`}
            >
              <TabIcon className="greek-tab-icon" strokeWidth={1.75} />
              <span className="greek-tab-symbol">{m.symbol}</span>
              <span className="greek-tab-name">{g.name}</span>
            </motion.button>
          );
        })}
      </div>

      <div className={`greek-explorer-stage greek-stage-${gKey}`}>
        <div className="greek-explorer-nav">
          <button type="button" onClick={prev} className="greek-nav-btn" aria-label="Previous Greek">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="greek-nav-counter">
            {index + 1} / {greeks.length}
          </span>
          <button type="button" onClick={next} className="greek-nav-btn" aria-label="Next Greek">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={card.name}
            initial={{ opacity: 0, x: 32, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -32, scale: 0.98 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="greek-explorer-card"
          >
            <div className="greek-explorer-head">
              <motion.div
                className={`greek-explorer-badge greek-badge-${gKey}`}
                animate={{ boxShadow: ["0 0 20px rgba(34,211,238,0.15)", "0 0 32px rgba(34,211,238,0.35)", "0 0 20px rgba(34,211,238,0.15)"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="greek-explorer-badge-icon" strokeWidth={1.5} />
                <span className="greek-explorer-symbol-text">{meta.symbol}</span>
              </motion.div>
              <div>
                <h3 className="greek-explorer-title">{card.name}</h3>
                <p className="greek-explorer-tagline">Plain-Language Sensitivity Guide</p>
              </div>
            </div>

            <details className="greek-formula-fold">
              <summary className="greek-formula-fold-summary">View formal definition</summary>
              <div className="greek-formula-panel">
                {card.formulaContext && <p className="math-equation-context">{card.formulaContext}</p>}
                {card.formulaNotation && card.formulaNotation.length > 0 && (
                  <NotationGrid items={card.formulaNotation} />
                )}
                <Latex math={card.formula} block fullWidth />
              </div>
            </details>

            <div className="research-prose greek-prose-stack">
              {capParagraphs(card.paragraphs).map((p, j) => (
                <motion.p
                  key={j}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + j * 0.06 }}
                >
                  <ProseMath text={p} />
                </motion.p>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
