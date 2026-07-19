import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface LatexProps {
  math: string;
  block?: boolean;
  fullWidth?: boolean;
  className?: string;
}

/** Normalize common encoding issues without breaking valid LaTeX. */
function normalizeLatex(raw: string): string {
  let s = (raw ?? "").trim();
  if (!s) return "";
  // Collapse accidental double-escaping from JSON stringification (\\\\frac → \\frac)
  // but only when the string clearly has doubled backslashes as command prefixes.
  if (/\\\\[a-zA-Z]/.test(s) && !/\\[a-zA-Z]/.test(s.replace(/\\\\/g, ""))) {
    s = s.replace(/\\\\/g, "\\");
  } else if (s.includes("\\\\")) {
    // Mixed: replace doubled command backslashes
    s = s.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
  }
  // Unicode operators that sometimes leak into latex fields
  s = s
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/·/g, "\\cdot")
    .replace(/×/g, "\\times");
  return s;
}

export function Latex({ math, block = false, fullWidth = false, className = "" }: LatexProps) {
  const normalized = normalizeLatex(math);

  if (!normalized) return null;

  try {
    if (block) {
      return (
        <div
          className={`math-equation-full math-compact serif-math ${fullWidth ? "w-full" : ""} ${className}`}
        >
          <BlockMath math={normalized} />
        </div>
      );
    }
    return (
      <span className={`math-inline ${className}`}>
        <InlineMath math={normalized} />
      </span>
    );
  } catch {
    return (
      <code className={`katex-error text-xs font-mono ${className}`} title="LaTeX parse error">
        {normalized}
      </code>
    );
  }
}
