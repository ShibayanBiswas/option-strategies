/** Vectorised leg-based payoff and Greeks engine for all option strategies. */

import {
  callGreeks,
  callGreeksArray,
  combineProfilesArrays,
  profileToDict,
  profilesArraysToDict,
  putGreeks,
  putGreeksArray,
  scaleProfile,
  scaleProfileArrays,
  stockGreeks,
  stockGreeksArray,
  valueAtSpot,
} from "./greeks.js";
import { MULTI_EXPIRY_IDS, computeMultiExpiry } from "./multiExpiry.js";

const CREDIT_H_IDS = new Set(["ratio-call-spread", "ratio-put-spread"]);
const DOUBLE_DEBIT_D_IDS = new Set(["long-box"]);

function spotGrid(params, s0, points = 500) {
  if ("spotMin" in params && "spotMax" in params) {
    const lo = Number(params.spotMin);
    const hi = Number(params.spotMax);
    return linspace(lo, hi, points);
  }
  const width = Number(params.range ?? 0.55);
  const lo = Math.max(1.0, s0 * (1 - width));
  const hi = s0 * (1 + width);
  return linspace(lo, hi, points);
}

function linspace(lo, hi, points) {
  const out = new Float64Array(points);
  if (points === 1) {
    out[0] = lo;
    return out;
  }
  const step = (hi - lo) / (points - 1);
  for (let i = 0; i < points; i++) out[i] = lo + step * i;
  return out;
}

function metrics(st, payoff, s0) {
  const breakevens = [];
  for (let i = 0; i < st.length - 1; i++) {
    const y1 = payoff[i];
    const y2 = payoff[i + 1];
    if (y1 * y2 <= 0 && y1 !== y2) {
      const x1 = st[i];
      const x2 = st[i + 1];
      breakevens.push(x1 - (y1 * (x2 - x1)) / (y2 - y1));
    }
  }
  let maxProfit = payoff[0];
  let maxLoss = payoff[0];
  for (let i = 1; i < payoff.length; i++) {
    if (payoff[i] > maxProfit) maxProfit = payoff[i];
    if (payoff[i] < maxLoss) maxLoss = payoff[i];
  }
  return {
    maxProfit,
    maxLoss,
    breakevens: [...new Set(breakevens)].sort((a, b) => a - b).map((b) => Math.round(b * 100) / 100),
    payoffAtSpot: interp(s0, st, payoff),
  };
}

function interp(x, xp, fp) {
  if (x <= xp[0]) return fp[0];
  if (x >= xp[xp.length - 1]) return fp[fp.length - 1];
  for (let i = 0; i < xp.length - 1; i++) {
    if (x >= xp[i] && x <= xp[i + 1]) {
      const t = (x - xp[i]) / (xp[i + 1] - xp[i]);
      return fp[i] + t * (fp[i + 1] - fp[i]);
    }
  }
  return fp[fp.length - 1];
}

function gradient(y, x) {
  const n = y.length;
  const out = new Float64Array(n);
  if (n === 1) return out;
  out[0] = (y[1] - y[0]) / (x[1] - x[0]);
  out[n - 1] = (y[n - 1] - y[n - 2]) / (x[n - 1] - x[n - 2]);
  for (let i = 1; i < n - 1; i++) {
    out[i] = (y[i + 1] - y[i - 1]) / (x[i + 1] - x[i - 1]);
  }
  return out;
}

function resolve(params, key) {
  const mapping = {
    K: "K",
    K1: "K1",
    K2: "K2",
    K3: "K3",
    K4: "K4",
    K_put: "K_put",
    K_call: "K_call",
  };
  const pk = mapping[key] ?? key;
  return Number(params[pk]);
}

function legQty(leg, params) {
  const qty = leg.qty ?? 1;
  if (typeof qty === "string") return Number(params[qty] ?? 1);
  return Number(qty);
}

function legSign(leg) {
  return leg.side === "long" ? 1.0 : -1.0;
}

function applyPremium(payoff, params, strategyId = null) {
  const out = Float64Array.from(payoff);
  if ("C" in params) out.forEach((_, i) => (out[i] += Number(params.C)));
  if ("D" in params) {
    const mult = strategyId && DOUBLE_DEBIT_D_IDS.has(strategyId) ? 2.0 : 1.0;
    out.forEach((_, i) => (out[i] -= mult * Number(params.D)));
  }
  if ("H" in params) {
    const h = Number(params.H);
    if (strategyId && CREDIT_H_IDS.has(strategyId)) {
      out.forEach((_, i) => (out[i] += h));
    } else {
      out.forEach((_, i) => (out[i] -= h));
    }
  }
  return out;
}

function longBoxCondorChart(st, params) {
  const k1 = Number(params.K1);
  const k2 = Number(params.K2);
  const d = Number(params.D);
  const bullCall = new Float64Array(st.length);
  const bearPut = new Float64Array(st.length);
  for (let i = 0; i < st.length; i++) {
    const s = st[i];
    bullCall[i] = Math.max(0.0, s - k2) - Math.max(0.0, s - k1) - d;
    bearPut[i] = Math.max(0.0, k1 - s) - Math.max(0.0, k2 - s) - d;
  }
  const payoff = new Float64Array(st.length);
  for (let i = 0; i < st.length; i++) payoff[i] = bullCall[i] + bearPut[i];
  const matrix = [bullCall, bearPut];
  const labels = ["Bull Call Spread", "Bear Put Spread"];
  return { matrix, payoff, labels };
}

function vectorizedLegPayoffs(st, s0, legs, params) {
  const matrix = legs.map((leg) => {
    const qty = legQty(leg, params);
    const sign = legSign(leg);
    const t = leg.type;
    const row = new Float64Array(st.length);
    if (t === "stock") {
      for (let i = 0; i < st.length; i++) row[i] = sign * qty * (st[i] - s0);
    } else if (t === "call") {
      const strike = resolve(params, leg.strike);
      for (let i = 0; i < st.length; i++) row[i] = sign * qty * Math.max(0.0, st[i] - strike);
    } else if (t === "put") {
      const strike = resolve(params, leg.strike);
      for (let i = 0; i < st.length; i++) row[i] = sign * qty * Math.max(0.0, strike - st[i]);
    }
    return row;
  });
  return matrix;
}

function strikeSymbol(strikeKey) {
  if (strikeKey === "K") return "K";
  if (strikeKey.startsWith("K") && /^\d+$/.test(strikeKey.slice(1))) {
    return `K_${strikeKey.slice(1)}`;
  }
  return strikeKey;
}

function legLabel(leg, params) {
  const direction = leg.side === "long" ? "Long" : "Short";
  const ttype = leg.type;
  if (ttype === "stock") return `${direction} Stock`;
  const strikeKey = leg.strike ?? "K";
  const sym = strikeSymbol(strikeKey);
  return `${direction} ${ttype.charAt(0).toUpperCase() + ttype.slice(1)} ${sym}`;
}

function vectorizedLegGreeks(st, leg, params, s0, t, r, sigma) {
  const qty = legQty(leg, params);
  const sign = legSign(leg);
  const signedQty = qty * sign;
  const ttype = leg.type;

  let arrays;
  let scalar;
  let strike = null;

  if (ttype === "stock") {
    arrays = stockGreeksArray(st, signedQty);
    scalar = stockGreeks(signedQty);
  } else if (ttype === "call") {
    strike = resolve(params, leg.strike);
    arrays = scaleProfileArrays(callGreeksArray(st, strike, t, r, sigma), signedQty);
    scalar = scaleProfile(callGreeks(s0, strike, t, r, sigma), signedQty);
  } else {
    strike = resolve(params, leg.strike);
    arrays = scaleProfileArrays(putGreeksArray(st, strike, t, r, sigma), signedQty);
    scalar = scaleProfile(putGreeks(s0, strike, t, r, sigma), signedQty);
  }

  const legDict = {
    type: ttype,
    strike,
    direction: leg.side,
    qty,
    signedQty: Math.round(signedQty * 1e4) / 1e4,
    label: legLabel(leg, params),
    ...profileToDict(scalar),
    profiles: profilesArraysToDict(arrays),
  };
  return { legDict, arrays };
}

function directionalLabel(netDelta, threshold = 0.08) {
  if (netDelta > threshold) return "net-bullish";
  if (netDelta < -threshold) return "net-bearish";
  return "net-neutral";
}

function directionalBlock(aggregate, greekLegs, st, payoff, s0) {
  const payoffSlope = gradient(payoff, st);
  let idx = 0;
  let minDiff = Math.abs(st[0] - s0);
  for (let i = 1; i < st.length; i++) {
    const diff = Math.abs(st[i] - s0);
    if (diff < minDiff) {
      minDiff = diff;
      idx = i;
    }
  }
  const slopeAtSpot = payoffSlope[idx];
  const label = directionalLabel(aggregate.delta);

  const legDeltaTerms = greekLegs.map((gl) => {
    const sign = gl.direction === "long" ? 1.0 : -1.0;
    return {
      leg: gl.label ?? `${gl.direction} ${gl.type}`,
      delta: gl.delta,
      contributionLatex: `\\sigma_i \\Delta_i = (${sign >= 0 ? "+" : ""}${sign.toFixed(0)})(${gl.delta >= 0 ? "+" : ""}${gl.delta.toFixed(4)})`,
    };
  });

  const deltaVal = aggregate.delta;
  const slopeVal = slopeAtSpot;
  return {
    label,
    netDelta: Math.round(deltaVal * 1e4) / 1e4,
    netGamma: Math.round(aggregate.gamma * 1e6) / 1e6,
    netVega: Math.round(aggregate.vega * 1e4) / 1e4,
    netTheta: Math.round(aggregate.theta * 1e4) / 1e4,
    payoffSlopeAtSpot: Math.round(slopeVal * 1e4) / 1e4,
    liveEquations: [
      `\\Delta_{\\text{net}} = ${deltaVal >= 0 ? "+" : ""}${deltaVal.toFixed(4)}`,
      `\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0} = ${slopeVal >= 0 ? "+" : ""}${slopeVal.toFixed(4)}`,
      "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S + \\frac{1}{2}\\Gamma_{\\text{net}}(\\Delta S)^2 + \\nu_{\\text{net}}\\,\\Delta\\sigma + \\Theta_{\\text{net}}\\,\\Delta t",
    ],
    latex: {
      payoffDecomposition: "f_T(S_T) = \\sum_{i=1}^{n} \\sigma_i\\,\\phi_i(S_T) - H",
      netDelta: "\\Delta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Delta_i",
      netGamma: "\\Gamma_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Gamma_i",
      netVega: "\\nu_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\nu_i",
      netTheta: "\\Theta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Theta_i",
      pnlApprox:
        "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S + \\frac{1}{2}\\Gamma_{\\text{net}}(\\Delta S)^2 + \\nu_{\\text{net}}\\,\\Delta\\sigma + \\Theta_{\\text{net}}\\,\\Delta t",
      payoffSlope: "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0}",
      signConvention: "\\sigma_i = +1 \\text{ (long)},\\; \\sigma_i = -1 \\text{ (short)}",
    },
    legContributions: legDeltaTerms,
  };
}

function computeFromLegs(strategyId, legs, params) {
  const s0 = Number(params.S0 ?? 100);
  const st = spotGrid(params, s0);

  const t = Number(params.T ?? 0.25);
  const r = Number(params.r ?? 0.05);
  const sigma = Number(params.sigma ?? 0.25);

  let legPayoffMatrix;
  let payoff;
  let greekLegs;
  let aggregateArrays;
  let aggregate;
  let legLabels;

  if (MULTI_EXPIRY_IDS.has(strategyId)) {
    const mx = computeMultiExpiry(strategyId, st, s0, params, r, sigma);
    legPayoffMatrix = mx.legMatrix;
    payoff = mx.payoff;
    greekLegs = mx.greekLegs;
    aggregateArrays = mx.aggregateArrays;
    aggregate = mx.aggregate;
    legLabels = [...mx.labels];
  } else if (strategyId === "long-box") {
    const chart = longBoxCondorChart(st, params);
    legPayoffMatrix = chart.matrix;
    payoff = chart.payoff;
    legLabels = chart.labels;

    greekLegs = [];
    const arrayProfiles = [];
    for (const leg of legs) {
      const { legDict, arrays } = vectorizedLegGreeks(st, leg, params, s0, t, r, sigma);
      greekLegs.push(legDict);
      arrayProfiles.push(arrays);
    }
    aggregateArrays =
      arrayProfiles.length > 0 ? combineProfilesArrays(...arrayProfiles) : stockGreeksArray(st, 0);
    aggregate = valueAtSpot(aggregateArrays, s0, st);
  } else {
    legPayoffMatrix = vectorizedLegPayoffs(st, s0, legs, params);
    const rawPayoff = new Float64Array(st.length);
    for (let i = 0; i < st.length; i++) {
      rawPayoff[i] = legPayoffMatrix.reduce((sum, row) => sum + row[i], 0);
    }
    payoff = applyPremium(rawPayoff, params, strategyId);
    legLabels = legs.map((leg) => legLabel(leg, params));

    greekLegs = [];
    const arrayProfiles = [];
    for (const leg of legs) {
      const { legDict, arrays } = vectorizedLegGreeks(st, leg, params, s0, t, r, sigma);
      greekLegs.push(legDict);
      arrayProfiles.push(arrays);
    }
    aggregateArrays =
      arrayProfiles.length > 0 ? combineProfilesArrays(...arrayProfiles) : stockGreeksArray(st, 0);
    aggregate = valueAtSpot(aggregateArrays, s0, st);
  }

  const directional = directionalBlock(aggregate, greekLegs, st, payoff, s0);

  return {
    spotPrices: Array.from(st, (x) => Math.round(x * 100) / 100),
    payoffs: Array.from(payoff, (x) => Math.round(x * 1e4) / 1e4),
    legPayoffs: {
      labels: legLabels,
      legs: legPayoffMatrix.map((row) => Array.from(row, (x) => Math.round(x * 1e4) / 1e4)),
    },
    metrics: metrics(st, payoff, s0),
    greeks: {
      legs: greekLegs,
      aggregate: profileToDict(aggregate),
      aggregateProfiles: profilesArraysToDict(aggregateArrays),
    },
    directional,
  };
}

/** Leg definitions aligned with strategy catalog */
export const STRATEGY_LEGS = {
  "long-call": [{ side: "long", type: "call", strike: "K", qty: 1 }],
  "short-call": [{ side: "short", type: "call", strike: "K", qty: 1 }],
  "long-put": [{ side: "long", type: "put", strike: "K", qty: 1 }],
  "short-put": [{ side: "short", type: "put", strike: "K", qty: 1 }],
  "covered-call": [
    { side: "long", type: "stock", qty: 1 },
    { side: "short", type: "call", strike: "K", qty: 1 },
  ],
  "covered-put": [
    { side: "short", type: "stock", qty: 1 },
    { side: "short", type: "put", strike: "K", qty: 1 },
  ],
  "protective-put": [
    { side: "long", type: "stock", qty: 1 },
    { side: "long", type: "put", strike: "K", qty: 1 },
  ],
  "protective-call": [
    { side: "short", type: "stock", qty: 1 },
    { side: "long", type: "call", strike: "K", qty: 1 },
  ],
  "bull-call-spread": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
  ],
  "bull-put-spread": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "bear-call-spread": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
  ],
  "bear-put-spread": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "long-combo": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "short-combo": [
    { side: "short", type: "call", strike: "K2", qty: 1 },
    { side: "long", type: "put", strike: "K1", qty: 1 },
  ],
  "bull-call-ladder": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
  ],
  "bull-put-ladder": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "put", strike: "K3", qty: 1 },
  ],
  "bear-call-ladder": [
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
  "bear-put-ladder": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "short", type: "put", strike: "K3", qty: 1 },
  ],
  "calendar-call-spread": [
    { side: "long", type: "call", strike: "K", qty: 1 },
    { side: "short", type: "call", strike: "K", qty: 1 },
  ],
  "calendar-put-spread": [
    { side: "long", type: "put", strike: "K", qty: 1 },
    { side: "short", type: "put", strike: "K", qty: 1 },
  ],
  "diagonal-call-spread": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
  ],
  "diagonal-put-spread": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "long-straddle": [
    { side: "long", type: "call", strike: "K", qty: 1 },
    { side: "long", type: "put", strike: "K", qty: 1 },
  ],
  "long-strangle": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
  ],
  "long-guts": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
  ],
  "short-straddle": [
    { side: "short", type: "call", strike: "K", qty: 1 },
    { side: "short", type: "put", strike: "K", qty: 1 },
  ],
  "short-strangle": [
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "short-guts": [
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  "long-call-synthetic-straddle": [
    { side: "short", type: "stock", qty: 1 },
    { side: "long", type: "call", strike: "K", qty: 2 },
  ],
  "long-put-synthetic-straddle": [
    { side: "long", type: "stock", qty: 1 },
    { side: "long", type: "put", strike: "K", qty: 2 },
  ],
  "short-call-synthetic-straddle": [
    { side: "long", type: "stock", qty: 1 },
    { side: "short", type: "call", strike: "K", qty: 2 },
  ],
  "short-put-synthetic-straddle": [
    { side: "short", type: "stock", qty: 1 },
    { side: "short", type: "put", strike: "K", qty: 2 },
  ],
  "covered-short-straddle": [
    { side: "long", type: "stock", qty: 1 },
    { side: "short", type: "call", strike: "K", qty: 1 },
    { side: "short", type: "put", strike: "K", qty: 1 },
  ],
  "covered-short-strangle": [
    { side: "long", type: "stock", qty: 1 },
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
  ],
  strap: [
    { side: "long", type: "call", strike: "K", qty: 2 },
    { side: "long", type: "put", strike: "K", qty: 1 },
  ],
  strip: [
    { side: "long", type: "call", strike: "K", qty: 1 },
    { side: "long", type: "put", strike: "K", qty: 2 },
  ],
  "call-ratio-backspread": [
    { side: "short", type: "call", strike: "K1", qty: "NS" },
    { side: "long", type: "call", strike: "K2", qty: "NL" },
  ],
  "put-ratio-backspread": [
    { side: "short", type: "put", strike: "K1", qty: "NS" },
    { side: "long", type: "put", strike: "K2", qty: "NL" },
  ],
  "ratio-call-spread": [
    { side: "short", type: "call", strike: "K1", qty: "NS" },
    { side: "long", type: "call", strike: "K2", qty: "NL" },
  ],
  "ratio-put-spread": [
    { side: "short", type: "put", strike: "K1", qty: "NS" },
    { side: "long", type: "put", strike: "K2", qty: "NL" },
  ],
  "long-call-butterfly": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 2 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
  "modified-call-butterfly": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 2 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
  "long-put-butterfly": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 2 },
    { side: "long", type: "put", strike: "K3", qty: 1 },
  ],
  "modified-put-butterfly": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 2 },
    { side: "long", type: "put", strike: "K3", qty: 1 },
  ],
  "short-call-butterfly": [
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 2 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
  ],
  "short-put-butterfly": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 2 },
    { side: "short", type: "put", strike: "K3", qty: 1 },
  ],
  "long-iron-butterfly": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
  "short-iron-butterfly": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
  ],
  "long-call-condor": [
    { side: "long", type: "call", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
    { side: "long", type: "call", strike: "K4", qty: 1 },
  ],
  "long-put-condor": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "short", type: "put", strike: "K3", qty: 1 },
    { side: "long", type: "put", strike: "K4", qty: 1 },
  ],
  "short-call-condor": [
    { side: "short", type: "call", strike: "K1", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
    { side: "short", type: "call", strike: "K4", qty: 1 },
  ],
  "short-put-condor": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "put", strike: "K3", qty: 1 },
    { side: "short", type: "put", strike: "K4", qty: 1 },
  ],
  "long-iron-condor": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
    { side: "long", type: "call", strike: "K4", qty: 1 },
  ],
  "short-iron-condor": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
    { side: "short", type: "call", strike: "K4", qty: 1 },
  ],
  "long-box": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K1", qty: 1 },
  ],
  collar: [
    { side: "long", type: "stock", qty: 1 },
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
  ],
  "bullish-short-seagull-spread": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "call", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
  ],
  "bearish-long-seagull-spread": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "call", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
  "bearish-short-seagull-spread": [
    { side: "short", type: "put", strike: "K1", qty: 1 },
    { side: "long", type: "put", strike: "K2", qty: 1 },
    { side: "short", type: "call", strike: "K3", qty: 1 },
  ],
  "bullish-long-seagull-spread": [
    { side: "long", type: "put", strike: "K1", qty: 1 },
    { side: "short", type: "put", strike: "K2", qty: 1 },
    { side: "long", type: "call", strike: "K3", qty: 1 },
  ],
};

export function computePayoff(strategyId, params) {
  if (!(strategyId in STRATEGY_LEGS)) {
    throw new Error(`Unknown strategy: ${strategyId}`);
  }
  return computeFromLegs(strategyId, STRATEGY_LEGS[strategyId], params);
}

export const STRATEGY_IDS = Object.keys(STRATEGY_LEGS);
