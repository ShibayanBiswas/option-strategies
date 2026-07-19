import { ChevronDown } from "lucide-react";
import { useState } from "react";
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
}

function resolveFormula(key: string, value: FormulaValue): EquationSpec {
  if (typeof value === "string") {
    const meta = FORMULA_META[key];
    return {
      latex: value,
      context: meta?.context,
      notation: meta?.notation,
    };
  }
  // Object payload already carries context/notation from the API — do not re-attach meta copies.
  return {
    latex: value.latex,
    context: value.context,
    notation: value.notation,
  };
}

export function FormulaDeck({
  formulas,
  title = "Formal Notation",
  defaultExpanded = null,
  compact = true,
}: FormulaDeckProps) {
  const entries = Object.entries(formulas);
  const [active, setActive] = useState<string | null>(defaultExpanded);
  const [expanded, setExpanded] = useState(!compact || Boolean(defaultExpanded));

  if (entries.length === 0) return null;

  const activeSpec = active ? resolveFormula(active, formulas[active]) : null;

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
          <div className="formula-chip-row">
            {entries.map(([key]) => {
              const meta = FORMULA_META[key] ?? {
                title: key.replace(/([A-Z])/g, " $1"),
                subtitle: "Identity",
                icon: ChevronDown,
              };
              const Icon = meta.icon;
              const isActive = active === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`formula-chip ${isActive ? "formula-chip-active" : ""}`}
                >
                  <Icon className="formula-chip-icon" strokeWidth={1.75} />
                  <span className="formula-chip-title">{meta.title}</span>
                </button>
              );
            })}
          </div>

          {active && activeSpec && (
            <div className="formula-reveal">
              {/* Prefer API/context line; skip chip subtitle when it would duplicate the explanation */}
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
              {activeSpec.notation && activeSpec.notation.length > 0 && (
                <NotationGrid items={activeSpec.notation as NotationItem[]} />
              )}
              <Latex math={activeSpec.latex} block fullWidth className="math-compact-inline" />
            </div>
          )}

          {!active && (
            <p className="formula-deck-hint">Select an identity above to reveal notation, context, and the typeset formula.</p>
          )}
        </div>
      )}
    </div>
  );
}
