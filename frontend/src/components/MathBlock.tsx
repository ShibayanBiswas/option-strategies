import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={`math-panel card-shine w-full ${compact ? "math-panel-compact" : ""} ${className}`}
    >
      {title && <h3 className="math-panel-title">{title}</h3>}
      {context && (
        <p className="math-panel-context">
          <ProseMath text={context} stripParens={false} />
        </p>
      )}
      {notation && notation.length > 0 && <NotationGrid items={notation} />}

      <div className="math-equations-stack">
        {eqs.map((eq, idx) => (
          <motion.div
            key={`${eq.latex}-${idx}`}
            className="math-equation-block"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
          >
            {eq.context && (
              <p className="math-equation-context">
                <ProseMath text={eq.context} stripParens={false} />
              </p>
            )}
            {eq.notation && eq.notation.length > 0 && <NotationGrid items={eq.notation} />}
            <Latex math={eq.latex} block fullWidth />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
