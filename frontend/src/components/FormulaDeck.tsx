import { AnimatePresence, motion } from "framer-motion";
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
  return value;
}

export function FormulaDeck({
  formulas,
  title = "Formal Notation",
  defaultExpanded = null,
  compact = true,
}: FormulaDeckProps) {
  const entries = Object.entries(formulas);
  const [active, setActive] = useState<string | null>(defaultExpanded);
  const [expanded, setExpanded] = useState(!compact);

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

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
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
                  <motion.button
                    key={key}
                    type="button"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(isActive ? null : key)}
                    className={`formula-chip ${isActive ? "formula-chip-active" : ""}`}
                  >
                    <Icon className="formula-chip-icon" strokeWidth={1.75} />
                    <span className="formula-chip-title">{meta.title}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {active && activeSpec && (
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="formula-reveal"
                >
                  <p className="formula-reveal-sub">
                    <ProseMath text={(FORMULA_META[active] ?? { subtitle: "" }).subtitle} stripParens={false} />
                  </p>
                  {activeSpec.context && <p className="math-equation-context">{activeSpec.context}</p>}
                  {activeSpec.notation && activeSpec.notation.length > 0 && (
                    <NotationGrid items={activeSpec.notation as NotationItem[]} />
                  )}
                  <Latex math={activeSpec.latex} block fullWidth className="math-compact-inline" />
                </motion.div>
              )}
            </AnimatePresence>

            {!active && (
              <p className="formula-deck-hint">Select an identity above to reveal notation, context, and the typeset formula.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
