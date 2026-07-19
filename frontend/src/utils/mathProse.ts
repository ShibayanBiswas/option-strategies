export type ProsePart = { type: "text"; content: string } | { type: "math"; content: string };

const GREEK: Record<string, string> = {
  "Δ": "\\Delta",
  "Γ": "\\Gamma",
  "Θ": "\\Theta",
  "Λ": "\\Lambda",
  "Σ": "\\sum",
  "Π": "\\prod",
  "Ω": "\\Omega",
  "α": "\\alpha",
  "β": "\\beta",
  "γ": "\\gamma",
  "δ": "\\delta",
  "ε": "\\varepsilon",
  "θ": "\\theta",
  "κ": "\\kappa",
  "λ": "\\lambda",
  "μ": "\\mu",
  "ν": "\\nu",
  "π": "\\pi",
  "ρ": "\\rho",
  "σ": "\\sigma",
  "τ": "\\tau",
  "φ": "\\varphi",
  "ω": "\\omega",
  "∂": "\\partial",
  "∞": "\\infty",
};

const UNICODE_SUB: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "ᵢ": "i",
};

/** Map a bare base symbol (possibly Greek) to a LaTeX command. */
function sym(base: string): string {
  return GREEK[base] ?? base;
}

/** Translate a small math fragment with unicode operators to LaTeX. */
function mathify(s: string): string {
  let out = s;
  out = out.replace(/[ΔΓΘΛΣΠΩαβγδεθκλμνπρστφω∂∞]/g, (c) => `${GREEK[c] ?? c} `);
  out = out
    .replace(/≈/g, "\\approx ")
    .replace(/≥/g, "\\geq ")
    .replace(/≤/g, "\\leq ")
    .replace(/≠/g, "\\neq ")
    .replace(/·/g, "\\cdot ")
    .replace(/×/g, "\\times ")
    .replace(/→/g, "\\to ")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/′/g, "'");
  return out.replace(/\s+/g, " ").trim();
}

/** Normalize Unicode subscripts and ASCII shorthands to LaTeX-style tokens. */
export function normalizeMathUnicode(text: string): string {
  return text
    .replace(/\\kappa\b/g, "κ")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\Delta\b/g, "Δ")
    .replace(/\\Gamma\b/g, "Γ")
    .replace(/\\Theta\b/g, "Θ")
    .replace(/\\nu\b/g, "ν")
    .replace(/\\rho\b/g, "ρ")
    .replace(/\\sigma\b/g, "σ")
    .replace(/([A-Za-zΔΓΘνρσκ])([₀₁₂₃₄ᵢ])/g, (_, base, subc) => `${base}_${UNICODE_SUB[subc] ?? subc}`)
    .replace(/\bS0\b/g, "S_0")
    .replace(/\bST\b/g, "S_T")
    .replace(/\bK([1-4])\b/g, "K_$1");
}

type Rule = { re: RegExp; latex: (m: RegExpExecArray) => string };

/** Ordered match rules — most specific first. All use the sticky flag. */
const RULES: Array<{ src: string; latex: (m: RegExpExecArray) => string }> = [
  { src: "∂²V/∂S²", latex: () => "\\frac{\\partial^2 V}{\\partial S^2}" },
  {
    src: "∂f_T/∂S\\s*\\|\\s*_?\\{?\\s*S\\s*=?\\s*S_0\\s*\\}?",
    latex: () => "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0}",
  },
  {
    src: "∂f_T/∂S\\s*\\|\\s*_?\\{?\\s*S_0\\s*\\}?",
    latex: () => "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S_0}",
  },
  { src: "∂f_T/∂S", latex: () => "\\frac{\\partial f_T}{\\partial S}" },
  { src: "∂([A-Za-z])/∂([A-Za-z])", latex: (m) => `\\frac{\\partial ${m[1]}}{\\partial ${m[2]}}` },
  { src: "Σ_\\{([^}]*)\\}\\^\\{([^}]*)\\}", latex: (m) => `\\sum_{${m[1]}}^{${m[2]}}` },
  { src: "Σ_\\{([^}]*)\\}", latex: (m) => `\\sum_{${m[1]}}` },
  { src: "N\\(d_([12])\\)", latex: (m) => `N(d_${m[1]})` },
  { src: "N\\(·\\)", latex: () => "N(\\cdot)" },
  { src: "\\(1/2\\)", latex: () => "\\tfrac{1}{2}" },
  { src: "\\(ΔS\\)\\^?2|\\(ΔS\\)²", latex: () => "(\\Delta S)^2" },
  { src: "ΔP", latex: () => "\\Delta P" },
  { src: "ΔS", latex: () => "\\Delta S" },
  { src: "Δσ", latex: () => "\\Delta\\sigma" },
  { src: "Δt", latex: () => "\\Delta t" },
  // Greek-with-named-subscript: Δ_net, Γ_net, Θ_net, ν_net, ρ_net
  {
    src: "([ΔΓΘνρσ])_\\{?(net|down|up|max|min)\\}?",
    latex: (m) => `${sym(m[1])}_{\\text{${m[2]}}}`,
  },
  // S^* with named subscript or bare
  { src: "S\\^\\*_\\{?(down|up)\\}?", latex: (m) => `S^*_{\\text{${m[1]}}}` },
  { src: "S\\^\\*", latex: () => "S^*" },
  { src: "P_\\{?max\\}?", latex: () => "P_{\\max}" },
  { src: "L_\\{?max\\}?", latex: () => "L_{\\max}" },
  // Two-letter known symbols
  { src: "S_0", latex: () => "S_0" },
  { src: "S_T", latex: () => "S_T" },
  { src: "f_T", latex: () => "f_T" },
  { src: "d_1", latex: () => "d_1" },
  { src: "d_2", latex: () => "d_2" },
  { src: "ln\\(S/K\\)", latex: () => "\\ln(S/K)" },
  { src: "ln\\(S / K\\)", latex: () => "\\ln(S/K)" },
  { src: "N_L", latex: () => "N_L" },
  { src: "N_S", latex: () => "N_S" },
  { src: "K_([1-4])", latex: (m) => `K_${m[1]}` },
  { src: "T'", latex: () => "T'" },
  // Generic subscript with braces: base_{...}
  {
    src: "([A-Za-zΔΓΘνρσκ])_\\{([^}]+)\\}",
    latex: (m) => `${sym(m[1])}_{${mathify(m[2])}}`,
  },
  // Generic single-token subscript: base_x  (x is letters/digits)
  {
    src: "([A-Za-zΔΓΘνρσκ])_([A-Za-z0-9]+)",
    latex: (m) => `${sym(m[1])}_{${mathify(m[2])}}`,
  },
  // Inequalities and comparisons
  { src: "S\\s*≈\\s*K", latex: () => "S \\approx K" },
  { src: "S\\s*>\\s*K", latex: () => "S > K" },
  { src: "S\\s*<\\s*K", latex: () => "S < K" },
  { src: "S_T\\s*>\\s*K", latex: () => "S_T > K" },
  { src: "S_T\\s*<\\s*K", latex: () => "S_T < K" },
  { src: "≥", latex: () => "\\geq" },
  { src: "≤", latex: () => "\\leq" },
  // Bare Greek letters used as standalone symbols
  { src: "[ΔΓΘΛΣΠΩκλμνπρστφω∂]", latex: (m) => sym(m[0]) },
];

const COMPILED: Rule[] = RULES.map((r) => ({ re: new RegExp(r.src, "y"), latex: r.latex }));

/** Split prose into plain text and inline-math segments. */
export function splitMathProse(text: string): ProsePart[] {
  if (!text) return [{ type: "text", content: "" }];

  const s = normalizeMathUnicode(text);
  const parts: ProsePart[] = [];
  let textBuf = "";
  let i = 0;

  while (i < s.length) {
    let matched = false;
    for (const rule of COMPILED) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(s);
      if (m && m.index === i && m[0].length > 0) {
        if (textBuf) {
          parts.push({ type: "text", content: textBuf });
          textBuf = "";
        }
        parts.push({ type: "math", content: rule.latex(m) });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      textBuf += s[i];
      i += 1;
    }
  }
  if (textBuf) parts.push({ type: "text", content: textBuf });

  return parts.length ? parts : [{ type: "text", content: s }];
}

/** Convert a single plain token into LaTeX (kept for back-compat callers). */
export function plainToLatex(token: string): string {
  const parts = splitMathProse(token);
  return parts.map((p) => p.content).join("");
}
