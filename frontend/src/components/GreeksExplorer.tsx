import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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

type IdentityTab = "call" | "put";

function resolveGreekKey(card: GreekCardData): GreekKey {
  return greekKeyFromName(card.name) ?? "delta";
}

export function GreeksExplorer({ greeks }: { greeks: GreekCardData[] }) {
  const [index, setIndex] = useState(0);
  const [identity, setIdentity] = useState<IdentityTab>("call");
  const card = greeks[index];
  const gKey = resolveGreekKey(card);
  const meta = GREEK_META[gKey];
  const Icon = meta.icon;

  const hasCall = Boolean(card.callProfile);
  const hasPut = Boolean(card.putProfile);
  const hasIdentities = hasCall || hasPut;

  useEffect(() => {
    if (hasCall) setIdentity("call");
    else if (hasPut) setIdentity("put");
  }, [card.name, hasCall, hasPut]);

  const activeLatex =
    identity === "call" ? card.callProfile : card.putProfile;

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
            <button
              key={g.name}
              type="button"
              onClick={() => setIndex(i)}
              className={`greek-tab ${i === index ? "greek-tab-active" : ""}`}
            >
              <TabIcon className="greek-tab-icon" strokeWidth={1.75} />
              <span className="greek-tab-symbol">{m.symbol}</span>
              <span className="greek-tab-name">{g.name}</span>
            </button>
          );
        })}
      </div>

      <div className="greek-explorer-stage">
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

        <div className="greek-explorer-card">
          <div className="greek-explorer-head">
            <div className="greek-explorer-badge">
              <Icon className="greek-explorer-badge-icon" strokeWidth={1.5} />
              <span className="greek-explorer-symbol-text">{meta.symbol}</span>
            </div>
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
              <p key={j}>
                <ProseMath text={p} />
              </p>
            ))}
          </div>

          {hasIdentities && (
            <div className="greek-identity-block">
              <p className="greek-identity-heading">Call &amp; Put Identities</p>
              <div className="greek-identity-tabs" role="tablist" aria-label={`${card.name} identities`}>
                {hasCall && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={identity === "call"}
                    className={`greek-identity-tab ${identity === "call" ? "greek-identity-tab-active" : ""}`}
                    onClick={() => setIdentity("call")}
                  >
                    Call
                  </button>
                )}
                {hasPut && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={identity === "put"}
                    className={`greek-identity-tab ${identity === "put" ? "greek-identity-tab-active" : ""}`}
                    onClick={() => setIdentity("put")}
                  >
                    Put
                  </button>
                )}
              </div>
              {activeLatex && (
                <div className="greek-identity-panel" role="tabpanel">
                  <Latex math={activeLatex} block fullWidth />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
