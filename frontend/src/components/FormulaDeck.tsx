import { FORMULA_META } from "./greekTheme";
import { Latex } from "./Latex";
import type { EquationSpec, NotationItem } from "./MathBlock";
import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";

type FormulaValue = string | EquationSpec;

interface FormulaDeckProps {
  formulas: Record<string, FormulaValue>;
  title?: string;
  /** Kept for call-site compatibility — all identities render open. */
  defaultExpanded?: string | null;
  compact?: boolean;
}

function resolveFormula(key: string, value: FormulaValue): EquationSpec & { title: string } {
  const meta = FORMULA_META[key];
  const title =
    meta?.title ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
  if (typeof value === "string") {
    return {
      title,
      latex: value,
      context: meta?.context,
      notation: meta?.notation,
    };
  }
  return {
    title,
    latex: value.latex,
    context: value.context ?? meta?.context,
    notation: value.notation ?? meta?.notation,
  };
}

/** All identities visible at once — no collapse chips, no hidden formulas. */
export function FormulaDeck({
  formulas,
  title = "Formal Notation",
  compact = true,
}: FormulaDeckProps) {
  const entries = Object.entries(formulas).map(([key, value]) => resolveFormula(key, value));
  if (entries.length === 0) return null;

  const seenNotation = new Set<string>();
  const shared: NotationItem[] = [];
  for (const eq of entries) {
    for (const item of eq.notation ?? []) {
      const fp = `${String(item.symbol).trim()}::${String(item.meaning).trim()}`;
      if (seenNotation.has(fp)) continue;
      seenNotation.add(fp);
      shared.push(item);
    }
  }

  const seenContexts = new Set<string>();

  return (
    <div className={`formula-deck formula-deck-open ${compact ? "formula-deck-compact" : ""}`}>
      <div className="formula-deck-head">
        <h3 className="formula-deck-toggle-label">{title}</h3>
        <span className="formula-deck-count">{entries.length} identities</span>
      </div>

      {shared.length > 0 && <NotationGrid items={shared} />}

      <div className="math-equations-stack">
        {entries.map((eq) => {
          const ctx = (eq.context || "").trim();
          const ctxKey = ctx.toLowerCase();
          const showContext = Boolean(ctx) && !seenContexts.has(ctxKey);
          if (showContext) seenContexts.add(ctxKey);

          return (
            <div key={`${eq.title}-${eq.latex}`} className="math-equation-block formula-reveal">
              <p className="formula-reveal-sub">{eq.title}</p>
              {showContext && (
                <p className="math-equation-context">
                  <ProseMath text={ctx} stripParens={false} />
                </p>
              )}
              <Latex math={eq.latex} block fullWidth className="math-compact-inline" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
