import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface LatexProps {
  math: string;
  block?: boolean;
  fullWidth?: boolean;
  className?: string;
  /** Wrap in \\boldsymbol for bold-italic emphasis (default true for simple inline only). */
  emphasize?: boolean;
}

/** Normalize common encoding issues without breaking valid LaTeX. */
export function normalizeLatex(raw: string): string {
  let s = (raw ?? "").trim();
  if (!s) return "";

  // Only collapse doubled command escapes when the string has no real single-backslash commands
  if (/\\\\[a-zA-Z]/.test(s) && !/(^|[^\\])\\[a-zA-Z]/.test(s)) {
    s = s.replace(/\\\\/g, "\\");
  }

  // Unicode operators / greek that sometimes leak into latex fields
  s = s
    .replace(/∞/g, "\\infty")
    .replace(/≤/g, "\\leq")
    .replace(/≥/g, "\\geq")
    .replace(/≠/g, "\\neq")
    .replace(/≈/g, "\\approx")
    .replace(/·/g, "\\cdot")
    .replace(/×/g, "\\times")
    .replace(/—/g, "---")
    .replace(/–/g, "-")
    .replace(/Δ/g, "\\Delta")
    .replace(/Γ/g, "\\Gamma")
    .replace(/Θ/g, "\\Theta")
    .replace(/ν/g, "\\nu")
    .replace(/ρ/g, "\\rho")
    .replace(/σ/g, "\\sigma")
    .replace(/φ|ϕ/g, "\\phi");

  // Brace multi-letter unbraced subscripts: S_net → S_{net}, \\Delta_net → \\Delta_{net}
  // Keep single-char / digit scripts (S_0, d_1, K_2, \\phi_i) untouched.
  s = s.replace(/((?:\\[a-zA-Z]+|[A-Za-z]))_([A-Za-z]{2,})\b/g, "$1_{$2}");

  return s;
}

const STRUCTURAL_TEX =
  /\\(?:d?frac|tfrac|dfrac|sqrt|sum|prod|int|left|right|begin|end|over|atop|choose|partial)\b|\\\\/;

/**
 * Bold the math nucleus only so subscripts/superscripts stay outside \\boldsymbol{...}.
 * \\boldsymbol{\\phi_i} can look broken; \\boldsymbol{\\phi}_i renders cleanly.
 */
export function emphasizeLatex(s: string): string {
  const t = s.trim();
  if (!t) return t;
  if (/\\boldsymbol|\\mathbf|\\bm\b|\\bold/.test(t)) return t;
  // Never wrap structural display math — \boldsymbol breaks numerator/denominator layout
  if (STRUCTURAL_TEX.test(t) || t.length > 80) return t;

  // nucleus = TeX command or single letter; scripts = chain of _x /^x /_{...} /^{...}
  const m = t.match(
    /^((?:\\[a-zA-Z]+\*?|[A-Za-z]))((?:(?:_|\^)(?:\{[^}]*\}|[A-Za-z0-9+*'′∗]))*)([\s\S]*)$/
  );
  if (m) {
    const [, base, scripts, rest] = m;
    if (scripts) {
      return `\\boldsymbol{${base}}${scripts}${rest}`;
    }
  }

  return `\\boldsymbol{${t}}`;
}

export function Latex({
  math,
  block = false,
  fullWidth = false,
  className = "",
  emphasize = !block,
}: LatexProps) {
  const normalized = normalizeLatex(math);
  if (!normalized) return null;

  // Block / display equations: never bold-wrap (preserves fraction metrics)
  const rendered = block || !emphasize ? normalized : emphasizeLatex(normalized);

  try {
    if (block) {
      return (
        <div
          className={`math-equation-full math-compact serif-math no-scrollbar ${fullWidth ? "w-full" : ""} ${className}`}
          style={{ display: "flex", justifyContent: "center", textAlign: "center" }}
        >
          <BlockMath math={rendered} />
        </div>
      );
    }
    return (
      <span className={`math-inline math-emph ${className}`}>
        <InlineMath math={rendered} />
      </span>
    );
  } catch {
    try {
      if (block) {
        return (
          <div
            className={`math-equation-full math-compact serif-math no-scrollbar ${fullWidth ? "w-full" : ""} ${className}`}
            style={{ display: "flex", justifyContent: "center", textAlign: "center" }}
          >
            <BlockMath math={normalized} />
          </div>
        );
      }
      return (
        <span className={`math-inline math-emph ${className}`}>
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
}
