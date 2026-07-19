import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";
import { Latex } from "./Latex";

export interface NotationItem {
  symbol: string;
  meaning: string;
}

export interface EquationSpec {
  latex: string;
  context?: string;
  notation?: NotationItem[];
  /** Optional short heading above this equation (e.g. Breakeven). */
  label?: string;
}

interface MathBlockProps {
  title?: string;
  context?: string;
  notation?: NotationItem[];
  equations: string | string[] | EquationSpec[];
  className?: string;
  compact?: boolean;
  maxEquations?: number;
}

/** Stable fingerprint so identical notation grids render once. */
export function notationFingerprint(items: NotationItem[] | undefined): string {
  if (!items?.length) return "";
  return items
    .map((n) => `${String(n.symbol).trim()}::${String(n.meaning).trim()}`)
    .join("|");
}

function normalizeEquations(
  equations: string | string[] | EquationSpec[],
  maxEquations: number
): EquationSpec[] {
  let specs: EquationSpec[];
  if (typeof equations === "string") {
    specs = [{ latex: equations }];
  } else if (Array.isArray(equations) && equations.length > 0 && typeof equations[0] === "string") {
    specs = (equations as string[]).map((latex) => ({ latex }));
  } else {
    specs = equations as EquationSpec[];
  }
  return specs.slice(0, maxEquations);
}

/**
 * One glossary per unique notation set:
 * - Block-level notation (if any) renders once above the equations
 * - Per-equation notation renders only when it differs from anything already shown
 */
function resolveUniqueNotation(
  blockNotation: NotationItem[] | undefined,
  eqs: EquationSpec[]
): { panel: NotationItem[] | null; perEq: (NotationItem[] | null)[] } {
  const panel = blockNotation && blockNotation.length > 0 ? blockNotation : null;
  const seen = new Set<string>();
  const panelKey = notationFingerprint(panel ?? undefined);
  if (panelKey) seen.add(panelKey);

  const perEq = eqs.map((eq) => {
    const items = eq.notation;
    if (!items?.length) return null;
    const key = notationFingerprint(items);
    if (!key || seen.has(key)) return null;
    seen.add(key);
    return items;
  });

  return { panel, perEq };
}

/** Full-width display math with a single notation grid (no duplicate glossaries). */
export function MathBlock({
  title,
  context,
  notation,
  equations,
  className = "",
  compact = true,
  maxEquations = 2,
}: MathBlockProps) {
  const eqs = normalizeEquations(equations, maxEquations);
  const { panel, perEq } = resolveUniqueNotation(notation, eqs);

  const seenContexts = new Set<string>();
  const panelContext = (context || "").trim();
  if (panelContext) seenContexts.add(panelContext.toLowerCase());

  return (
    <div className={`math-panel w-full ${compact ? "math-panel-compact" : ""} ${className}`}>
      {title && <h3 className="math-panel-title">{title}</h3>}
      {panelContext && (
        <p className="math-panel-context">
          <ProseMath text={panelContext} stripParens={false} />
        </p>
      )}
      {panel && panel.length > 0 && <NotationGrid items={panel} />}

      <div className="math-equations-stack">
        {eqs.map((eq, idx) => {
          const eqContext = (eq.context || "").trim();
          const contextKey = eqContext.toLowerCase();
          const showContext = Boolean(eqContext) && !seenContexts.has(contextKey);
          if (showContext) seenContexts.add(contextKey);
          const eqNotation = perEq[idx];

          return (
            <div key={`${eq.latex}-${idx}`} className="math-equation-block">
              {eq.label && <p className="formula-reveal-sub">{eq.label}</p>}
              {showContext && (
                <p className="math-equation-context">
                  <ProseMath text={eqContext} stripParens={false} />
                </p>
              )}
              {eqNotation && eqNotation.length > 0 && <NotationGrid items={eqNotation} />}
              <Latex math={eq.latex} block fullWidth />
            </div>
          );
        })}
      </div>
    </div>
  );
}
