/** Equation notation, context, and paragraph caps — shared by intro and strategies */

export const MAX_SECTION_PARAGRAPHS = 3;

export function capParagraphs(paragraphs, max = MAX_SECTION_PARAGRAPHS) {
  return (paragraphs || []).slice(0, max);
}

export const CORE_NOTATION = [
  { symbol: "S_0", meaning: "Spot price at entry (today's price)" },
  { symbol: "S_T", meaning: "Spot price at expiration" },
  { symbol: "K", meaning: "Strike price of an option leg" },
  { symbol: "T", meaning: "Time to expiration in years" },
  { symbol: "f_T", meaning: "Terminal profit or loss at expiry" },
  { symbol: "D", meaning: "Net option premium paid at entry" },
  { symbol: "C", meaning: "Net option premium received at entry" },
  { symbol: "H", meaning: "Net option premium across multi-leg structures" },
  { symbol: "(x)^+", meaning: "Positive part — max(x, 0)" },
  { symbol: "\\sigma_i", meaning: "Leg sign: σ_i = +1 long, σ_i = −1 short" },
];

export const GREEK_NOTATION = [
  { symbol: "V", meaning: "Option or portfolio mark-to-market value" },
  { symbol: "S", meaning: "Underlying spot; S_0 is today's spot" },
  { symbol: "σ", meaning: "Implied volatility" },
  { symbol: "r", meaning: "Risk-free rate (continuously compounded)" },
  { symbol: "Δ", meaning: "∂V/∂S — spot sensitivity (direction)" },
  { symbol: "Γ", meaning: "∂²V/∂S² — convexity in spot" },
  { symbol: "Θ", meaning: "∂V/∂t — time decay" },
  { symbol: "ν", meaning: "∂V/∂σ — volatility sensitivity" },
  { symbol: "ρ", meaning: "∂V/∂r — rate sensitivity" },
  { symbol: "N(·)", meaning: "Standard normal cumulative distribution" },
  { symbol: "d_1, d_2", meaning: "Black–Scholes auxiliary variables" },
];

export const INTRO_MATH_EQUATIONS = [
  {
    latex: "f_T^{\\text{call}}(S_T, K) = (S_T - K)^+ - D, \\quad f_T^{\\text{put}}(S_T, K) = (K - S_T)^+ - D",
    context: "Single-leg terminal payoffs: intrinsic value minus the option premium D for a long call or long put at expiration.",
    notation: [
      { symbol: "(S_T - K)^+", meaning: "Call intrinsic — excess of spot over strike" },
      { symbol: "(K - S_T)^+", meaning: "Put intrinsic — excess of strike over spot" },
      { symbol: "D", meaning: "Premium paid at entry" },
    ],
  },
  {
    latex: "f_T(S_T) = \\sum_{i=1}^{n} \\sigma_i \\phi_i(S_T) - H, \\quad S^* : f_T(S^*) = 0",
    context: "Multi-leg book: sum signed leg payoffs φ_i minus net premium H; breakeven S* solves f_T = 0.",
    notation: [
      { symbol: "\\phi_i(S_T)", meaning: "Payoff function of leg i at expiration" },
      { symbol: "\\sigma_i", meaning: "+1 long leg, −1 short leg" },
      { symbol: "S^*", meaning: "Breakeven spot where net payoff is zero" },
    ],
  },
];

export const INTRO_MONEYNESS_EQUATIONS = [
  {
    latex: "\\text{Call ITM} \\iff S > K; \\quad \\text{Put ITM} \\iff S < K; \\quad V = V^{\\text{intr}} + V^{\\text{time}}",
    context: "Moneyness conditions and the split of option value into intrinsic and time components before expiry.",
    notation: [
      { symbol: "V^{\\text{intr}}", meaning: "Intrinsic value — payoff if exercised now" },
      { symbol: "V^{\\text{time}}", meaning: "Time value — extrinsic premium above intrinsic" },
    ],
  },
];

export const INTRO_BS_EQUATIONS = [
  {
    latex: "C = S\\,N(d_1) - K e^{-rT} N(d_2), \\quad P = K e^{-rT} N(-d_2) - S\\,N(-d_1)",
    context: "European call price C and put price P under Black–Scholes used for live Greeks and calendar/diagonal legs.",
    notation: [
      { symbol: "C, P", meaning: "Call and put fair values before expiry" },
      { symbol: "e^{-rT}", meaning: "Discount factor to expiration" },
    ],
  },
  {
    latex: "d_1 = \\frac{\\ln(S/K) + (r + \\tfrac{1}{2}\\sigma^2)T}{\\sigma\\sqrt{T}}, \\quad d_2 = d_1 - \\sigma\\sqrt{T}",
    context: "Auxiliary variables d_1 and d_2 map spot, strike, time, rate, and volatility into the normal CDF inputs.",
    notation: [
      { symbol: "\\ln(S/K)", meaning: "Log-moneyness of the option" },
      { symbol: "\\sigma\\sqrt{T}", meaning: "Total volatility scaled by square root of time" },
    ],
  },
];

export const FORMULA_EQUATION_META = {
  netDelta: {
    context: "Aggregate spot sensitivity of the whole book at S_0 before expiry.",
    notation: [
      { symbol: "\\Delta_i", meaning: "Delta of leg i" },
      { symbol: "\\sigma_i", meaning: "Leg sign (+1 long, −1 short)" },
    ],
  },
  netGamma: {
    context: "Net convexity — how aggregate delta changes when spot moves.",
    notation: [{ symbol: "\\Gamma_i", meaning: "Gamma of leg i" }],
  },
  netTheta: {
    context: "Net daily time decay of the book at current parameters.",
    notation: [{ symbol: "\\Theta_i", meaning: "Theta of leg i" }],
  },
  netVega: {
    context: "Net volatility exposure — mark-to-market change per unit σ move.",
    notation: [{ symbol: "\\nu_i", meaning: "Vega of leg i" }],
  },
  pnlApprox: {
    context: "Second-order Taylor approximation for small changes in spot, vol, and time.",
    notation: [
      { symbol: "\\Delta S", meaning: "Change in underlying spot" },
      { symbol: "\\Delta\\sigma", meaning: "Change in implied volatility" },
      { symbol: "\\Delta t", meaning: "Elapsed time" },
    ],
  },
  payoffSlope: {
    context: "Slope of the terminal payoff curve at today's spot on the live grid.",
    notation: [{ symbol: "f_T", meaning: "Terminal payoff as a function of spot" }],
  },
  signConvention: {
    context: "Long legs enter sums with +1; short legs enter with −1.",
    notation: [{ symbol: "\\sigma_i", meaning: "Sign multiplier for leg i" }],
  },
  payoffDecomposition: {
    context: "Terminal payoff as a signed sum of leg intrinsic payoffs minus premium.",
    notation: [
      { symbol: "\\phi_i(S_T)", meaning: "Intrinsic payoff of leg i" },
      { symbol: "H", meaning: "Net premium paid or received" },
    ],
  },
  breakeven: {
    context: "Spot level(s) where net terminal payoff equals zero.",
    notation: [{ symbol: "S^*", meaning: "Breakeven spot price" }],
  },
  maxProfit: {
    context: "Maximum terminal profit over the plotted spot range (or asymptotic cap).",
    notation: [{ symbol: "P_{\\max}", meaning: "Maximum profit" }],
  },
  maxLoss: {
    context: "Maximum terminal loss over the plotted spot range (or asymptotic floor).",
    notation: [{ symbol: "L_{\\max}", meaning: "Maximum loss" }],
  },
};

const GREEK_FORMULA_META = {
  Delta: {
    context: "First partial derivative of option value with respect to spot.",
    notation: [{ symbol: "V", meaning: "Option value" }, { symbol: "S", meaning: "Underlying spot" }],
  },
  Gamma: {
    context: "Second derivative of value with respect to spot — rate of change of delta.",
    notation: [{ symbol: "\\Delta", meaning: "Delta" }],
  },
  Theta: {
    context: "Partial derivative with respect to time — daily decay of option value.",
    notation: [{ symbol: "t", meaning: "Calendar time toward expiry" }],
  },
  Vega: {
    context: "Partial derivative with respect to implied volatility σ.",
    notation: [{ symbol: "\\sigma", meaning: "Implied volatility" }],
  },
  Rho: {
    context: "Partial derivative with respect to the risk-free rate r.",
    notation: [{ symbol: "r", meaning: "Risk-free rate" }],
  },
};

export function greekFormulaMeta(name) {
  return GREEK_FORMULA_META[name] || { context: "Formal sensitivity definition.", notation: [] };
}

export function buildPayoffEquationBlock(raw) {
  if (!raw.payoffLatex) return null;

  const notation = [
    { symbol: "f_T", meaning: `Terminal P/L for ${raw.name}` },
    { symbol: "S_T", meaning: "Spot at expiration" },
  ];
  if (raw.paramKeys?.includes("D")) notation.push({ symbol: "D", meaning: "Net option premium paid at entry" });
  if (raw.paramKeys?.includes("C")) notation.push({ symbol: "C", meaning: "Net option premium received at entry" });
  if (raw.paramKeys?.includes("H")) notation.push({ symbol: "H", meaning: "Net premium" });
  if (raw.paramKeys?.some((k) => k.startsWith("K"))) {
    notation.push({ symbol: "K_i", meaning: "Strike price of leg i" });
  }

  return {
    title: "Primary Terminal Payoff",
    context: "Identity for the solid net curve on the live payoff chart at expiration.",
    notation: CORE_NOTATION,
    equations: [
      {
        latex: raw.payoffLatex,
        context: "Evaluate at each spot on the horizontal axis; green shading marks f_T > 0.",
        notation,
      },
    ],
  };
}

export function buildAdditionalEquations(raw) {
  const out = {};
  if (raw.breakevenLatex) {
    out.breakeven = {
      latex: raw.breakevenLatex,
      ...FORMULA_EQUATION_META.breakeven,
    };
  }
  if (raw.maxProfitLatex) {
    out.maxProfit = {
      latex: raw.maxProfitLatex,
      ...FORMULA_EQUATION_META.maxProfit,
    };
  }
  if (raw.maxLossLatex) {
    out.maxLoss = {
      latex: raw.maxLossLatex,
      ...FORMULA_EQUATION_META.maxLoss,
    };
  }
  return out;
}
