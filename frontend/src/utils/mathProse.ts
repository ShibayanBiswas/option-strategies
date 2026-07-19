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
  "φ": "\\phi",
  "ϕ": "\\phi",
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
  out = out.replace(/[ΔΓΘΛΣΠΩαβγδεθκλμνπρστφϕω∂∞]/g, (c) => GREEK[c] ?? c);
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

/**
 * Extract a TeX command starting at `i`, including nested `{...}` args and
 * a following `_{...}` / `^{...}` / `_x` attachment.
 */
function readLatexCommand(s: string, i: number): number {
  if (s[i] !== "\\" || i + 1 >= s.length) return i;
  let j = i + 1;
  if (!/[a-zA-Z]/.test(s[j])) {
    // \, \; \! \% etc.
    return i + 2;
  }
  while (j < s.length && /[a-zA-Z]/.test(s[j])) j += 1;
  if (s[j] === "*") j += 1;

  const readBraceGroup = (start: number): number => {
    if (s[start] !== "{") return start;
    let depth = 0;
    for (let k = start; k < s.length; k += 1) {
      if (s[k] === "{") depth += 1;
      else if (s[k] === "}") {
        depth -= 1;
        if (depth === 0) return k + 1;
      }
    }
    return start;
  };

  while (j < s.length && s[j] === "{") {
    const next = readBraceGroup(j);
    if (next === j) break;
    j = next;
  }

  while (j < s.length && (s[j] === "_" || s[j] === "^")) {
    if (s[j + 1] === "{") {
      const next = readBraceGroup(j + 1);
      if (next === j + 1) break;
      j = next;
    } else if (s[j + 1] && /[A-Za-z0-9]/.test(s[j + 1])) {
      j += 2;
      while (j < s.length && /[A-Za-z0-9]/.test(s[j])) j += 1;
    } else {
      break;
    }
  }
  return j;
}

/** Normalize Unicode subscripts and ASCII shorthands to LaTeX-style tokens. */
export function normalizeMathUnicode(text: string): string {
  return text
    .replace(/([A-Za-zΔΓΘνρσκ])([₀₁₂₃₄ᵢ])/g, (_, base, subc) => `${base}_${UNICODE_SUB[subc] ?? subc}`)
    .replace(/\bS0\b/g, "S_0")
    .replace(/\bST\b/g, "S_T")
    .replace(/\bK([1-4])\b/g, "K_$1")
    .replace(/V\^\{intr\}/g, "V^{\\text{intr}}")
    .replace(/V\^\{time\}/g, "V^{\\text{time}}")
    .replace(/V\^intr\b/g, "V^{\\text{intr}}")
    .replace(/V\^time\b/g, "V^{\\text{time}}")
    .replace(/√([A-Za-z0-9]+)/g, "\\sqrt{$1}");
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
  { src: "∂V/∂S", latex: () => "\\frac{\\partial V}{\\partial S}" },
  { src: "∂V/∂t", latex: () => "\\frac{\\partial V}{\\partial t}" },
  { src: "∂V/∂σ", latex: () => "\\frac{\\partial V}{\\partial\\sigma}" },
  { src: "∂V/∂r", latex: () => "\\frac{\\partial V}{\\partial r}" },
  { src: "∂([A-Za-z])/∂([A-Za-zσ])", latex: (m) => `\\frac{\\partial ${m[1]}}{\\partial ${sym(m[2])}}` },
  { src: "Σ_\\{([^}]*)\\}\\^\\{([^}]*)\\}", latex: (m) => `\\sum_{${m[1]}}^{${m[2]}}` },
  { src: "Σ_\\{([^}]*)\\}", latex: (m) => `\\sum_{${m[1]}}` },
  { src: "\\\\max\\(([^)]*)\\)", latex: (m) => `\\max(${mathify(m[1])})` },
  { src: "max\\(([^)]*)\\)", latex: (m) => `\\max(${mathify(m[1])})` },
  { src: "N\\(d_([12])\\)", latex: (m) => `N(d_${m[1]})` },
  { src: "N\\(·\\)", latex: () => "N(\\cdot)" },
  { src: "N\\(\\\\cdot\\)", latex: () => "N(\\cdot)" },
  { src: "\\(1/2\\)", latex: () => "\\tfrac{1}{2}" },
  { src: "\\(ΔS\\)\\^?2|\\(ΔS\\)²", latex: () => "(\\Delta S)^2" },
  { src: "\\(x\\)\\^\\+", latex: () => "(x)^+" },
  { src: "\\(S_T\\s*-\\s*K\\)\\^\\+", latex: () => "(S_T - K)^+" },
  { src: "\\(K\\s*-\\s*S_T\\)\\^\\+", latex: () => "(K - S_T)^+" },
  { src: "ΔP", latex: () => "\\Delta P" },
  { src: "ΔS", latex: () => "\\Delta S" },
  { src: "Δσ", latex: () => "\\Delta\\sigma" },
  { src: "Δt", latex: () => "\\Delta t" },
  {
    src: "([ΔΓΘνρσ])_\\{?(net|down|up|max|min|call|put)\\}?",
    latex: (m) => `${sym(m[1])}_{\\text{${m[2]}}}`,
  },
  { src: "S\\^\\*_\\{?(down|up)\\}?", latex: (m) => `S^*_{\\text{${m[1]}}}` },
  { src: "S\\^\\*", latex: () => "S^*" },
  { src: "\\\\phi_i\\(S_T\\)", latex: () => "\\phi_i(S_T)" },
  { src: "φ_i\\(S_T\\)", latex: () => "\\phi_i(S_T)" },
  { src: "ϕ_i\\(S_T\\)", latex: () => "\\phi_i(S_T)" },
  { src: "\\\\phi_i\\b", latex: () => "\\phi_i" },
  { src: "φ_i\\b", latex: () => "\\phi_i" },
  { src: "ϕ_i\\b", latex: () => "\\phi_i" },
  { src: "\\\\sigma_i\\b", latex: () => "\\sigma_i" },
  { src: "σ_i\\b", latex: () => "\\sigma_i" },
  { src: "P_\\{?max\\}?", latex: () => "P_{\\max}" },
  { src: "L_\\{?max\\}?", latex: () => "L_{\\max}" },
  { src: "V\\^\\{\\\\text\\{intr\\}\\}", latex: () => "V^{\\text{intr}}" },
  { src: "V\\^\\{\\\\text\\{time\\}\\}", latex: () => "V^{\\text{time}}" },
  { src: "d_2\\s*=\\s*d_1\\s*-\\s*σ√T", latex: () => "d_2 = d_1 - \\sigma\\sqrt{T}" },
  { src: "σ√T", latex: () => "\\sigma\\sqrt{T}" },
  // Comparisons BEFORE bare symbols so "S_T > K" stays one math unit
  { src: "S_T\\s*≥\\s*K", latex: () => "S_T \\geq K" },
  { src: "S_T\\s*≤\\s*K", latex: () => "S_T \\leq K" },
  { src: "S_T\\s*>\\s*K", latex: () => "S_T > K" },
  { src: "S_T\\s*<\\s*K", latex: () => "S_T < K" },
  { src: "S_T\\s*=\\s*K", latex: () => "S_T = K" },
  { src: "S\\s*≈\\s*K", latex: () => "S \\approx K" },
  { src: "S\\s*≥\\s*K", latex: () => "S \\geq K" },
  { src: "S\\s*≤\\s*K", latex: () => "S \\leq K" },
  { src: "S\\s*>\\s*K", latex: () => "S > K" },
  { src: "S\\s*<\\s*K", latex: () => "S < K" },
  { src: "S\\s*=\\s*K", latex: () => "S = K" },
  { src: "f_T\\s*>\\s*0", latex: () => "f_T > 0" },
  { src: "f_T\\s*<\\s*0", latex: () => "f_T < 0" },
  { src: "f_T\\s*=\\s*0", latex: () => "f_T = 0" },
  { src: "\\\\sigma_i\\s*=\\s*\\+?1", latex: () => "\\sigma_i = +1" },
  { src: "\\\\sigma_i\\s*=\\s*-1", latex: () => "\\sigma_i = -1" },
  { src: "σ_i\\s*=\\s*\\+?1", latex: () => "\\sigma_i = +1" },
  { src: "σ_i\\s*=\\s*-1", latex: () => "\\sigma_i = -1" },
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
  { src: "\\\\sqrt\\{([^}]*)\\}", latex: (m) => `\\sqrt{${m[1]}}` },
  // Subscripts only on Greek or single known math letters — never mid-word latin (avoids \\sigma_i → a_i)
  {
    src: "([ΔΓΘνρσκφϕA-Z])_\\{([^}]+)\\}",
    latex: (m) => `${sym(m[1])}_{${mathify(m[2])}}`,
  },
  {
    src: "([ΔΓΘνρσκφϕ]|[KSTfV])_([A-Za-z0-9]+)",
    latex: (m) => `${sym(m[1])}_{${mathify(m[2])}}`,
  },
  { src: "\\+1\\b", latex: () => "+1" },
  { src: "(?<![\\d.A-Za-z])-1\\b", latex: () => "-1" },
  { src: "≥", latex: () => "\\geq" },
  { src: "≤", latex: () => "\\leq" },
  { src: "≠", latex: () => "\\neq" },
  { src: "≈", latex: () => "\\approx" },
  // Bare Greek last — never steals φ_i / σ_i (those matched above)
  { src: "[ΔΓΘΛΣΠΩκλμνπρστφϕω∂]", latex: (m) => sym(m[0]) },
];

const COMPILED: Rule[] = RULES.map((r) => ({ re: new RegExp(r.src, "y"), latex: r.latex }));

/** True when the string is already a TeX expression (not mixed prose). */
export function looksLikePureLatex(text: string): boolean {
  const t = text.trim();
  if (!t || !/\\[a-zA-Z]/.test(t)) return false;
  // Mixed prose with an embedded command — let the tokenizer handle it
  if (/\s/.test(t) && /^[A-Za-z]/.test(t)) return false;
  if (/[.!?]\s+[A-Za-z]/.test(t)) return false;
  const cmds = (t.match(/\\[a-zA-Z]+/g) || []).length;
  const words = (t.match(/\b[A-Za-z]{4,}\b/g) || []).length;
  // Prefer pure equations: starts with backslash or math letter, more cmds than words
  if (t.startsWith("\\") || /^[A-Za-zΔΓΘνρσ]_/.test(t) || /^[A-Za-z]\\/.test(t)) {
    return cmds >= 1 && cmds >= words;
  }
  return cmds >= 2 && cmds > words;
}

/** Split prose into plain text and inline-math segments. */
export function splitMathProse(text: string): ProsePart[] {
  if (!text) return [{ type: "text", content: "" }];

  if (looksLikePureLatex(text)) {
    return [{ type: "math", content: text.trim() }];
  }

  const s = normalizeMathUnicode(text);
  const parts: ProsePart[] = [];
  let textBuf = "";
  let i = 0;

  const flushText = () => {
    if (textBuf) {
      parts.push({ type: "text", content: textBuf });
      textBuf = "";
    }
  };

  while (i < s.length) {
    // Preserve existing TeX commands wholesale
    if (s[i] === "\\") {
      const end = readLatexCommand(s, i);
      if (end > i) {
        flushText();
        parts.push({ type: "math", content: s.slice(i, end) });
        i = end;
        continue;
      }
    }

    let matched = false;
    for (const rule of COMPILED) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(s);
      if (m && m.index === i && m[0].length > 0) {
        flushText();
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
  flushText();

  return parts.length ? parts : [{ type: "text", content: text }];
}

/** Convert a single plain token into LaTeX (kept for back-compat callers). */
export function plainToLatex(token: string): string {
  const parts = splitMathProse(token);
  return parts.map((p) => p.content).join("");
}
