/**
 * Breakeven, maximum-profit and maximum-loss identities transcribed verbatim
 * from the reference monograph:
 *   Z. Kakushadze & J. A. Serur, "151 Trading Strategies" (2018), §2.
 * Notation matches the paper: S^* (break-even), P_max, L_max, D/C net premium,
 * H = D (premium paid) or H = -C (premium received), kappa = equidistant strike spacing.
 */

const U = "\\infty";

export const PAPER_IDENTITIES = {
  // 2.2 – 2.5 income / hedging
  "covered-call": {
    breakevenLatex: "S^* = S_0 - C",
    maxProfitLatex: "P_{\\max} = K - S_0 + C",
    maxLossLatex: "L_{\\max} = S_0 - C",
  },
  "covered-put": {
    breakevenLatex: "S^* = S_0 + C",
    maxProfitLatex: "P_{\\max} = S_0 - K + C",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "protective-put": {
    breakevenLatex: "S^* = S_0 + D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = S_0 - K + D",
  },
  "protective-call": {
    breakevenLatex: "S^* = S_0 - D",
    maxProfitLatex: "P_{\\max} = S_0 - D",
    maxLossLatex: "L_{\\max} = K - S_0 + D",
  },

  // 2.6 – 2.9 vertical spreads
  "bull-call-spread": {
    breakevenLatex: "S^* = K_1 + D",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "bull-put-spread": {
    breakevenLatex: "S^* = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = K_2 - K_1 - C",
  },
  "bear-call-spread": {
    breakevenLatex: "S^* = K_2 + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = K_1 - K_2 - C",
  },
  "bear-put-spread": {
    breakevenLatex: "S^* = K_1 - D",
    maxProfitLatex: "P_{\\max} = K_1 - K_2 - D",
    maxLossLatex: "L_{\\max} = D",
  },

  // 2.12 – 2.13 combos
  "long-combo": {
    breakevenLatex: "S^* = K_1 + H \\ (H>0);\\quad S^* = K_2 + H \\ (H<0)",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = K_2 + H",
  },
  "short-combo": {
    breakevenLatex: "S^* = K_1 - H \\ (H>0);\\quad S^* = K_2 - H \\ (H<0)",
    maxProfitLatex: "P_{\\max} = K_1 - H",
    maxLossLatex: `L_{\\max} = ${U}`,
  },

  // 2.14 – 2.17 ladders
  "bull-call-ladder": {
    breakevenLatex: "S^*_{\\text{down}} = K_1 + H;\\quad S^*_{\\text{up}} = K_3 + K_2 - K_1 - H",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - H",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "bull-put-ladder": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 + H;\\quad S^*_{\\text{down}} = K_3 + K_2 - K_1 - H",
    maxProfitLatex: "P_{\\max} = K_3 + K_2 - K_1 - H",
    maxLossLatex: "L_{\\max} = K_1 - K_2 + H",
  },
  "bear-call-ladder": {
    breakevenLatex: "S^*_{\\text{down}} = K_1 - H;\\quad S^*_{\\text{up}} = K_3 + K_2 - K_1 + H",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = K_2 - K_1 + H",
  },
  "bear-put-ladder": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 - H;\\quad S^*_{\\text{down}} = K_3 + K_2 - K_1 + H",
    maxProfitLatex: "P_{\\max} = K_1 - K_2 - H",
    maxLossLatex: "L_{\\max} = K_3 + K_2 - K_1 + H",
  },

  // 2.18 – 2.21 calendar / diagonal (near-expiry: V = long-leg value at S_T = K)
  "calendar-call-spread": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = V - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "calendar-put-spread": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = V - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "diagonal-call-spread": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = V - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "diagonal-put-spread": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = V - D",
    maxLossLatex: "L_{\\max} = D",
  },

  // 2.22 – 2.27 straddles / strangles / guts
  "long-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = K + D;\\quad S^*_{\\text{down}} = K - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D",
  },
  "long-strangle": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 + D;\\quad S^*_{\\text{down}} = K_2 - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D",
  },
  "long-guts": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 + D;\\quad S^*_{\\text{down}} = K_2 - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D - (K_2 - K_1)",
  },
  "short-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = K + C;\\quad S^*_{\\text{down}} = K - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "short-strangle": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 + C;\\quad S^*_{\\text{down}} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "short-guts": {
    breakevenLatex: "S^*_{\\text{up}} = K_1 + C;\\quad S^*_{\\text{down}} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C - (K_2 - K_1)",
    maxLossLatex: `L_{\\max} = ${U}`,
  },

  // 2.28 – 2.31 synthetic straddles
  "long-call-synthetic-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = 2K - S_0 + D;\\quad S^*_{\\text{down}} = S_0 - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D - (S_0 - K)",
  },
  "long-put-synthetic-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = S_0 + D;\\quad S^*_{\\text{down}} = 2K - S_0 - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D - (K - S_0)",
  },
  "short-call-synthetic-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = 2K - S_0 + C;\\quad S^*_{\\text{down}} = S_0 - C",
    maxProfitLatex: "P_{\\max} = K - S_0 + C",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "short-put-synthetic-straddle": {
    breakevenLatex: "S^*_{\\text{up}} = S_0 + C;\\quad S^*_{\\text{down}} = 2K - S_0 - C",
    maxProfitLatex: "P_{\\max} = S_0 - K + C",
    maxLossLatex: `L_{\\max} = ${U}`,
  },

  // 2.32 – 2.33 covered short straddle / strangle
  "covered-short-straddle": {
    breakevenLatex: "S^* = \\tfrac{1}{2}(S_0 + K - C)",
    maxProfitLatex: "P_{\\max} = K - S_0 + C",
    maxLossLatex: "L_{\\max} = S_0 + K - C",
  },
  "covered-short-strangle": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = K_1 - S_0 + C",
    maxLossLatex: "L_{\\max} = S_0 + K_2 - C",
  },

  // 2.34 – 2.35 strap / strip
  "strap": {
    breakevenLatex: "S^*_{\\text{up}} = K + \\tfrac{D}{2};\\quad S^*_{\\text{down}} = K - D",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D",
  },
  "strip": {
    breakevenLatex: "S^*_{\\text{up}} = K + D;\\quad S^*_{\\text{down}} = K - \\tfrac{D}{2}",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = D",
  },

  // 2.36 – 2.39 ratio (back)spreads
  "call-ratio-backspread": {
    breakevenLatex:
      "S^*_{\\text{down}} = K_1 - H/N_S \\ (H<0);\\quad S^*_{\\text{up}} = \\dfrac{N_L K_2 - N_S K_1 + H}{N_L - N_S}",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = N_S (K_2 - K_1) + H",
  },
  "put-ratio-backspread": {
    breakevenLatex:
      "S^*_{\\text{up}} = K_1 + H/N_S \\ (H<0);\\quad S^*_{\\text{down}} = \\dfrac{N_L K_2 - N_S K_1 - H}{N_L - N_S}",
    maxProfitLatex: "P_{\\max} = N_L K_2 - N_S K_1 - H",
    maxLossLatex: "L_{\\max} = N_S (K_1 - K_2) + H",
  },
  "ratio-call-spread": {
    breakevenLatex:
      "S^*_{\\text{down}} = K_2 + H/N_L \\ (H>0);\\quad S^*_{\\text{up}} = \\dfrac{N_S K_1 - N_L K_2 - H}{N_S - N_L}",
    maxProfitLatex: "P_{\\max} = N_L (K_1 - K_2) - H",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "ratio-put-spread": {
    breakevenLatex:
      "S^*_{\\text{up}} = K_2 - H/N_L \\ (H>0);\\quad S^*_{\\text{down}} = \\dfrac{N_S K_1 - N_L K_2 + H}{N_S - N_L}",
    maxProfitLatex: "P_{\\max} = N_L (K_2 - K_1) - H",
    maxLossLatex: "L_{\\max} = N_S K_1 - N_L K_2 + H",
  },

  // 2.40 – 2.41.1 butterflies (equidistant kappa)
  "long-call-butterfly": {
    breakevenLatex: "S^*_{\\text{down}} = K_3 + D;\\quad S^*_{\\text{up}} = K_1 - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "modified-call-butterfly": {
    breakevenLatex: "S^* = K_3 + D",
    maxProfitLatex: "P_{\\max} = K_2 - K_3 - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "long-put-butterfly": {
    breakevenLatex: "S^*_{\\text{up}} = K_3 - D;\\quad S^*_{\\text{down}} = K_1 + D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "modified-put-butterfly": {
    breakevenLatex: "S^*_{\\text{down}} = 2K_2 - K_3 + H\\;(S^*_{\\text{up}} = K_3 - H,\\ H>0)",
    maxProfitLatex: "P_{\\max} = K_3 - K_2 - H",
    maxLossLatex: "L_{\\max} = 2K_2 - K_1 - K_3 + H",
  },

  // 2.42 – 2.43 short butterflies
  "short-call-butterfly": {
    breakevenLatex: "S^*_{\\text{up}} = K_3 - C;\\quad S^*_{\\text{down}} = K_1 + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },
  "short-put-butterfly": {
    breakevenLatex: "S^*_{\\text{down}} = K_3 + C;\\quad S^*_{\\text{up}} = K_1 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },

  // 2.44 – 2.45 iron butterflies
  "long-iron-butterfly": {
    breakevenLatex: "S^*_{\\text{up}} = K_2 + C;\\quad S^*_{\\text{down}} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },
  "short-iron-butterfly": {
    breakevenLatex: "S^*_{\\text{up}} = K_2 + D;\\quad S^*_{\\text{down}} = K_2 - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },

  // 2.46 – 2.49 condors (equidistant kappa)
  "long-call-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_4 - D;\\quad S^*_{\\text{down}} = K_1 + D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "long-put-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_4 - D;\\quad S^*_{\\text{down}} = K_1 + D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },
  "short-call-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_4 - C;\\quad S^*_{\\text{down}} = K_1 + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },
  "short-put-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_4 - C;\\quad S^*_{\\text{down}} = K_1 + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },

  // 2.50 – 2.51 iron condors
  "long-iron-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_3 + C;\\quad S^*_{\\text{down}} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
  },
  "short-iron-condor": {
    breakevenLatex: "S^*_{\\text{up}} = K_3 + D;\\quad S^*_{\\text{down}} = K_2 - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
  },

  // 2.52 long box
  "long-box": {
    breakevenLatex: null,
    maxProfitLatex: "P_{\\max} = (K_1 - K_2) - 2D",
    maxLossLatex: "L_{\\max} = 2D",
  },

  // 2.53 collar
  "collar": {
    breakevenLatex: "S^* = S_0 + H",
    maxProfitLatex: "P_{\\max} = K_2 - S_0 - H",
    maxLossLatex: "L_{\\max} = S_0 - K_1 + H",
  },

  // 2.54 – 2.57 seagull spreads
  "bullish-short-seagull-spread": {
    breakevenLatex: "S^* = K_2 + H \\ (H>0);\\quad S^* = K_1 + H \\ (H<0)",
    maxProfitLatex: "P_{\\max} = K_3 - K_2 - H",
    maxLossLatex: "L_{\\max} = K_1 + H",
  },
  "bearish-long-seagull-spread": {
    breakevenLatex: "S^* = K_1 - H \\ (H>0);\\quad S^* = K_2 - H \\ (H<0)",
    maxProfitLatex: "P_{\\max} = K_1 - H",
    maxLossLatex: "L_{\\max} = K_3 - K_2 + H",
  },
  "bearish-short-seagull-spread": {
    breakevenLatex: "S^* = K_2 - H \\ (H>0);\\quad S^* = K_3 - H \\ (H<0)",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - H",
    maxLossLatex: `L_{\\max} = ${U}`,
  },
  "bullish-long-seagull-spread": {
    breakevenLatex: "S^* = K_3 + H \\ (H>0);\\quad S^* = K_2 + H \\ (H<0)",
    maxProfitLatex: `P_{\\max} = ${U}`,
    maxLossLatex: "L_{\\max} = K_2 - K_1 + H",
  },
};

/** Overlay paper identities onto a raw strategy definition (mutates a copy). */
export function applyPaperIdentities(raw) {
  const id = raw.id;
  const p = PAPER_IDENTITIES[id];
  if (!p) return raw;
  return {
    ...raw,
    breakevenLatex: p.breakevenLatex ?? raw.breakevenLatex ?? null,
    maxProfitLatex: p.maxProfitLatex ?? raw.maxProfitLatex ?? null,
    maxLossLatex: p.maxLossLatex ?? raw.maxLossLatex ?? null,
  };
}
