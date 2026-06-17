/**
 * Default parameters and spot-axis limits from the reference notebook:
 * https://github.com/chenenen13/Trading-Strategies/.../Trading_strategies_Options.ipynb
 */

export const SPOT_RANGES = {
  /** S0 = 100 terminal payoffs — np.linspace(50, 150, 500) */
  standard: { spotMin: 50, spotMax: 150 },
  /** Volatility / ratio / butterfly cells 21–35 — np.linspace(20, 80, 500) */
  vol50: { spotMin: 20, spotMax: 80 },
  /** Calendar & diagonal — np.linspace(30, 70, 500) */
  calendar: { spotMin: 30, spotMax: 70 },
  /** Short butterfly, iron butterfly, collar, seagull — np.linspace(70, 130, 500) */
  wings130: { spotMin: 70, spotMax: 130 },
  /** Condors — np.linspace(70, 140, 500) */
  wings140: { spotMin: 70, spotMax: 140 },
};

/** Per-strategy overrides keyed by catalog id */
export const NOTEBOOK_BY_ID = {
  "long-call": { S0: 100, K: 100, D: 5, ...SPOT_RANGES.standard },
  "short-call": { S0: 100, K: 100, C: 5, ...SPOT_RANGES.standard },
  "long-put": { S0: 100, K: 100, D: 5, ...SPOT_RANGES.standard },
  "short-put": { S0: 100, K: 100, C: 5, ...SPOT_RANGES.standard },

  "covered-call": { S0: 100, K: 105, C: 5, ...SPOT_RANGES.standard },
  "covered-put": { S0: 100, K: 95, C: 5, ...SPOT_RANGES.standard },
  "protective-put": { S0: 100, K: 95, D: 5, ...SPOT_RANGES.standard },
  "protective-call": { S0: 100, K: 105, D: 5, ...SPOT_RANGES.standard },

  "bull-call-spread": { S0: 100, K1: 95, K2: 115, D: 5, ...SPOT_RANGES.standard },
  "bull-put-spread": { S0: 100, K1: 95, K2: 115, C: 5, ...SPOT_RANGES.standard },
  "bear-call-spread": { S0: 100, K1: 115, K2: 95, C: 5, ...SPOT_RANGES.standard },
  "bear-put-spread": { S0: 100, K1: 115, K2: 95, D: 5, ...SPOT_RANGES.standard },

  "long-combo": { S0: 100, K1: 110, K2: 85, H: 5, ...SPOT_RANGES.standard },
  "short-combo": { S0: 100, K1: 90, K2: 115, H: 5, ...SPOT_RANGES.standard },

  "bull-call-ladder": { S0: 100, K1: 95, K2: 105, K3: 115, H: 5, ...SPOT_RANGES.standard },
  "bull-put-ladder": { S0: 100, K1: 105, K2: 95, K3: 85, H: 5, ...SPOT_RANGES.standard },
  "bear-call-ladder": { S0: 100, K1: 95, K2: 105, K3: 115, H: 5, ...SPOT_RANGES.standard },
  "bear-put-ladder": { S0: 100, K1: 105, K2: 95, K3: 85, H: 5, ...SPOT_RANGES.standard },

  "calendar-call-spread": {
    S0: 50,
    K: 50,
    T: 1,
    T_short: 2 / 12,
    sigma: 0.2,
    r: 0.03,
    D: 2,
    ...SPOT_RANGES.calendar,
  },
  "calendar-put-spread": {
    S0: 50,
    K: 50,
    T: 1,
    T_short: 2 / 12,
    sigma: 0.2,
    r: 0.03,
    D: 2,
    ...SPOT_RANGES.calendar,
  },
  "diagonal-call-spread": {
    S0: 50,
    K1: 45,
    K2: 60,
    T: 1,
    T_short: 2 / 12,
    sigma: 0.2,
    r: 0.03,
    D: 2,
    ...SPOT_RANGES.calendar,
  },
  "diagonal-put-spread": {
    S0: 50,
    K1: 55,
    K2: 40,
    T: 1,
    T_short: 2 / 12,
    sigma: 0.2,
    r: 0.03,
    D: 2,
    ...SPOT_RANGES.calendar,
  },

  "long-straddle": { S0: 50, K: 50, D: 5, ...SPOT_RANGES.vol50 },
  "long-strangle": { S0: 50, K1: 45, K2: 55, D: 5, ...SPOT_RANGES.vol50 },
  "long-guts": { S0: 50, K1: 45, K2: 55, D: 5, ...SPOT_RANGES.vol50 },
  "short-straddle": { S0: 50, K: 50, C: 5, ...SPOT_RANGES.vol50 },
  "short-strangle": { S0: 50, K1: 45, K2: 55, C: 5, ...SPOT_RANGES.vol50 },
  "short-guts": { S0: 50, K1: 45, K2: 55, C: 5, ...SPOT_RANGES.vol50 },

  "long-call-synthetic-straddle": { S0: 50, K: 50, D: 5, ...SPOT_RANGES.vol50 },
  "long-put-synthetic-straddle": { S0: 50, K: 50, D: 5, ...SPOT_RANGES.vol50 },
  "short-call-synthetic-straddle": { S0: 50, K: 50, C: 5, ...SPOT_RANGES.vol50 },
  "short-put-synthetic-straddle": { S0: 50, K: 50, C: 5, ...SPOT_RANGES.vol50 },

  "covered-short-straddle": { S0: 50, K: 50, C: 5, ...SPOT_RANGES.vol50 },
  "covered-short-strangle": { S0: 50, K1: 50, K2: 45, C: 5, ...SPOT_RANGES.vol50 },
  "strap": { S0: 50, K: 50, D: 5, ...SPOT_RANGES.vol50 },
  "strip": { S0: 50, K: 50, D: 5, ...SPOT_RANGES.vol50 },

  "call-ratio-backspread": { S0: 50, K1: 45, K2: 55, NS: 1, NL: 2, H: 5, ...SPOT_RANGES.vol50 },
  "put-ratio-backspread": { S0: 50, K1: 50, K2: 55, NL: 2, NS: 1, H: 5, ...SPOT_RANGES.vol50 },
  "ratio-call-spread": { S0: 50, K1: 45, K2: 55, NS: 2, NL: 1, H: 5, ...SPOT_RANGES.vol50 },
  "ratio-put-spread": { S0: 50, K1: 45, K2: 55, NS: 1, NL: 2, H: 5, ...SPOT_RANGES.vol50 },

  "long-call-butterfly": { S0: 50, K1: 40, K2: 52, K3: 60, D: 2, ...SPOT_RANGES.vol50 },
  "modified-call-butterfly": { S0: 50, K1: 45, K2: 50, K3: 60, D: 2, ...SPOT_RANGES.vol50 },
  "long-put-butterfly": { S0: 50, K1: 40, K2: 52, K3: 60, D: 2, ...SPOT_RANGES.vol50 },
  "modified-put-butterfly": { S0: 50, K1: 45, K2: 50, K3: 53, H: 5, ...SPOT_RANGES.vol50 },

  "short-call-butterfly": { S0: 100, K1: 90, K2: 100, K3: 110, C: 5, ...SPOT_RANGES.wings130 },
  "short-put-butterfly": { S0: 100, K1: 90, K2: 100, K3: 110, C: 5, ...SPOT_RANGES.wings130 },
  "long-iron-butterfly": { S0: 100, K1: 90, K2: 100, K3: 110, C: 5, ...SPOT_RANGES.wings130 },
  "short-iron-butterfly": { S0: 100, K1: 90, K2: 100, K3: 110, D: 5, ...SPOT_RANGES.wings130 },

  "long-call-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, D: 5, ...SPOT_RANGES.wings140 },
  "long-put-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, D: 5, ...SPOT_RANGES.wings140 },
  "short-call-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, C: 5, ...SPOT_RANGES.wings140 },
  "short-put-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, C: 5, ...SPOT_RANGES.wings140 },
  "long-iron-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, C: 5, ...SPOT_RANGES.wings140 },
  "short-iron-condor": { S0: 100, K1: 90, K2: 100, K3: 110, K4: 120, D: 5, ...SPOT_RANGES.wings140 },

  "long-box": { S0: 100, K1: 110, K2: 95, D: 5, ...SPOT_RANGES.wings130 },
  "collar": { S0: 100, K1: 90, K2: 110, H: 5, ...SPOT_RANGES.wings130 },

  "bullish-short-seagull-spread": { S0: 100, K1: 90, K2: 100, K3: 110, H: 5, ...SPOT_RANGES.wings130 },
  "bearish-long-seagull-spread": { S0: 100, K1: 90, K2: 100, K3: 110, H: 5, ...SPOT_RANGES.wings130 },
  "bearish-short-seagull-spread": { S0: 100, K1: 90, K2: 100, K3: 110, H: 5, ...SPOT_RANGES.wings130 },
  "bullish-long-seagull-spread": { S0: 100, K1: 90, K2: 100, K3: 110, H: 5, ...SPOT_RANGES.wings130 },
};

/** Merge notebook defaults into param object (only keys present in paramKeys when provided). */
export function applyNotebookDefaults(params, strategyId, paramKeys = null) {
  const nb = NOTEBOOK_BY_ID[strategyId];
  if (!nb) {
    if (!params.spotMin) Object.assign(params, SPOT_RANGES.standard);
    return params;
  }
  const allowed = paramKeys ? new Set([...paramKeys, "spotMin", "spotMax", "r"]) : null;
  for (const [key, value] of Object.entries(nb)) {
    if (allowed && !allowed.has(key)) continue;
    params[key] = value;
  }
  return params;
}
