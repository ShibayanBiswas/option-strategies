import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { FORMULA_META } from "./greekTheme";
import { Latex } from "./Latex";
import type { EquationSpec, NotationItem } from "./MathBlock";
import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";

type FormulaValue = string | EquationSpec;

interface FormulaDeckProps {
  formulas: Record<string, FormulaValue>;
  title?: string;
  defaultExpanded?: string | null;
  compact?: boolean;
  /** Shared glossary shown once above the chip picker. */
  sharedNotation?: NotationItem[];
  /** Deck-level intro shown when expanded. */
  deckContext?: string;
}

function resolveFormula(key: string, value: FormulaValue): EquationSpec {
  if (typeof value === "string") {
    const meta = FORMULA_META[key];
    return {
      latex: value,
      context: meta?.context,
      notation: meta?.notation,
      label: meta?.title,
    };
  }
  const meta = FORMULA_META[key];
  return {
    latex: value.latex,
    context: value.context ?? meta?.context,
    notation: value.notation ?? meta?.notation,
    label: value.label ?? meta?.title,
  };
}

function chipTitle(key: string, value: FormulaValue): string {
  if (typeof value !== "string" && value.label) return value.label;
  return (
    FORMULA_META[key]?.title ??
    key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
  );
}

/**
 * Collapsible identity deck with chip picker.
 * Opens by default; first (or defaultExpanded) identity is selected so nothing starts blank.
 */
export function FormulaDeck({
  formulas,
  title = "Formal Notation",
  defaultExpanded = null,
  sharedNotation,
  deckContext,
}: FormulaDeckProps) {
  const entries = Object.entries(formulas);
  const initialKey =
    (defaultExpanded && formulas[defaultExpanded] != null ? defaultExpanded : null) ??
    entries[0]?.[0] ??
    null;
  const [active, setActive] = useState<string | null>(initialKey);
  const [expanded, setExpanded] = useState(true);

  const activeSpec = useMemo(
    () => (active ? resolveFormula(active, formulas[active]) : null),
    [active, formulas],
  );

  if (entries.length === 0) return null;

  return (
    <div className="formula-deck">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="formula-deck-toggle"
        aria-expanded={expanded}
      >
        <span className="formula-deck-toggle-label">{title}</span>
        <span className="formula-deck-count">{entries.length} identities</span>
        <ChevronDown className={`formula-deck-chevron ${expanded ? "is-open" : ""}`} />
      </button>

      {expanded && (
        <div>
          {deckContext && (
            <p className="formula-deck-intro">
              <ProseMath text={deckContext} stripParens={false} />
            </p>
          )}
          {sharedNotation && sharedNotation.length > 0 && (
            <div className="formula-deck-shared-notation">
              <NotationGrid items={sharedNotation} />
            </div>
          )}

          <div className="formula-chip-row">
            {entries.map(([key, value]) => {
              const meta = FORMULA_META[key];
              const Icon = meta?.icon ?? ChevronDown;
              const isActive = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`formula-chip ${isActive ? "formula-chip-active" : ""}`}
                >
                  <Icon className="formula-chip-icon" strokeWidth={1.75} />
                  <span className="formula-chip-title">{chipTitle(key, value)}</span>
                </button>
              );
            })}
          </div>

          {active && activeSpec && (
            <div className="formula-reveal">
              {activeSpec.context ? (
                <p className="math-equation-context">
                  <ProseMath text={activeSpec.context} stripParens={false} />
                </p>
              ) : (
                FORMULA_META[active]?.subtitle && (
                  <p className="formula-reveal-sub">
                    <ProseMath text={FORMULA_META[active].subtitle} stripParens={false} />
                  </p>
                )
              )}
              {!sharedNotation?.length &&
                activeSpec.notation &&
                activeSpec.notation.length > 0 && (
                  <NotationGrid items={activeSpec.notation as NotationItem[]} />
                )}
              <Latex math={activeSpec.latex} block fullWidth className="math-compact-inline" />
            </div>
          )}

          {!active && (
            <p className="formula-deck-hint">
              Select an identity above to reveal notation, context, and the typeset formula.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
