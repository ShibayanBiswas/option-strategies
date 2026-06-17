import { BlockMath } from "react-katex";
import { NotationGrid } from "./NotationGrid";
import { ProseMath } from "./ProseMath";

import "katex/dist/katex.min.css";

export interface NotationItem {
  symbol: string;
  meaning: string;
}

export interface EquationSpec {
  latex: string;
  context?: string;
  notation?: NotationItem[];
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

/** Full-width display math with notation and context per equation */
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

  return (
    <div className={`math-panel w-full ${compact ? "math-panel-compact" : ""} ${className}`}>
      {title && <h3 className="math-panel-title">{title}</h3>}
      {context && (
        <p className="math-panel-context">
          <ProseMath text={context} stripParens={false} />
        </p>
      )}
      {notation && notation.length > 0 && <NotationGrid items={notation} />}

      <div className="math-equations-stack">
        {eqs.map((eq, idx) => (
          <div key={`${eq.latex}-${idx}`} className="math-equation-block">
            {eq.context && (
              <p className="math-equation-context">
                <ProseMath text={eq.context} stripParens={false} />
              </p>
            )}
            {eq.notation && eq.notation.length > 0 && <NotationGrid items={eq.notation} />}
            <div className="math-equation-full math-compact">
              <BlockMath math={eq.latex.replace(/\\\\/g, "\\")} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
