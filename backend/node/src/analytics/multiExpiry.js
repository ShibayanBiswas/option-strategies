/** Calendar and diagonal spread PnL/Greeks at near expiry. */

import {
  callGreeks,
  callGreeksArray,
  callPriceArray,
  combineProfilesArrays,
  expiredCallGreeksArray,
  expiredPutGreeksArray,
  profileToDict,
  profilesArraysToDict,
  putGreeks,
  putGreeksArray,
  putPriceArray,
  scaleProfile,
  scaleProfileArrays,
  valueAtSpot,
} from "./greeks.js";

export const MULTI_EXPIRY_IDS = new Set([
  "calendar-call-spread",
  "calendar-put-spread",
  "diagonal-call-spread",
  "diagonal-put-spread",
]);

function resolve(params, key) {
  return Number(params[key]);
}

function timeParams(params) {
  const tLong = Number(params.T ?? 1.0);
  const defaultShort = Math.min(2.0 / 12.0, tLong * 0.5);
  let tShort = Number(params.T_short ?? defaultShort);
  tShort = Math.min(Math.max(tShort, 1e-4), Math.max(tLong - 1e-4, 1e-4));
  const tRem = Math.max(tLong - tShort, 1e-4);
  return { tLong, tShort, tRem };
}

function applyPremium(payoff, params) {
  const out = Float64Array.from(payoff);
  if ("C" in params) out.forEach((_, i) => (out[i] += Number(params.C)));
  if ("D" in params) out.forEach((_, i) => (out[i] -= Number(params.D)));
  if ("H" in params) out.forEach((_, i) => (out[i] -= Number(params.H)));
  return out;
}

function legLabel(direction, optType, strikeSym) {
  return `${direction} ${optType.charAt(0).toUpperCase() + optType.slice(1)} ${strikeSym}`;
}

function maxIntrinsic(st, strike, isCall) {
  const out = new Float64Array(st.length);
  for (let i = 0; i < st.length; i++) {
    out[i] = isCall ? Math.max(st[i] - strike, 0.0) : Math.max(strike - st[i], 0.0);
  }
  return out;
}

export function computeMultiExpiry(strategyId, st, s0, params, r, sigma) {
  const { tRem } = timeParams(params);
  const qtyLong = 1.0;
  const qtyShort = -1.0;

  let longValue;
  let shortPayoff;
  let longArrays;
  let shortArrays;
  let longScalar;
  let shortScalar;
  let legTypes;
  let labels;

  if (strategyId === "calendar-call-spread") {
    const k = resolve(params, "K");
    longValue = callPriceArray(st, k, tRem, r, sigma);
    shortPayoff = maxIntrinsic(st, k, true);
    longArrays = scaleProfileArrays(callGreeksArray(st, k, tRem, r, sigma), qtyLong);
    shortArrays = expiredCallGreeksArray(st, k, qtyShort);
    longScalar = scaleProfile(callGreeks(s0, k, tRem, r, sigma), qtyLong);
    shortScalar = valueAtSpot(expiredCallGreeksArray(st, k, qtyShort), s0, st);
    legTypes = ["call", "call"];
    labels = [legLabel("Long", "call", "K"), legLabel("Short", "call", "K")];
  } else if (strategyId === "calendar-put-spread") {
    const k = resolve(params, "K");
    longValue = putPriceArray(st, k, tRem, r, sigma);
    shortPayoff = maxIntrinsic(st, k, false);
    longArrays = scaleProfileArrays(putGreeksArray(st, k, tRem, r, sigma), qtyLong);
    shortArrays = expiredPutGreeksArray(st, k, qtyShort);
    longScalar = scaleProfile(putGreeks(s0, k, tRem, r, sigma), qtyLong);
    shortScalar = valueAtSpot(expiredPutGreeksArray(st, k, qtyShort), s0, st);
    legTypes = ["put", "put"];
    labels = [legLabel("Long", "put", "K"), legLabel("Short", "put", "K")];
  } else if (strategyId === "diagonal-call-spread") {
    const k1 = resolve(params, "K1");
    const k2 = resolve(params, "K2");
    longValue = callPriceArray(st, k1, tRem, r, sigma);
    shortPayoff = maxIntrinsic(st, k2, true);
    longArrays = scaleProfileArrays(callGreeksArray(st, k1, tRem, r, sigma), qtyLong);
    shortArrays = expiredCallGreeksArray(st, k2, qtyShort);
    longScalar = scaleProfile(callGreeks(s0, k1, tRem, r, sigma), qtyLong);
    shortScalar = valueAtSpot(expiredCallGreeksArray(st, k2, qtyShort), s0, st);
    legTypes = ["call", "call"];
    labels = [legLabel("Long", "call", "K_1"), legLabel("Short", "call", "K_2")];
  } else if (strategyId === "diagonal-put-spread") {
    const k1 = resolve(params, "K1");
    const k2 = resolve(params, "K2");
    longValue = putPriceArray(st, k1, tRem, r, sigma);
    shortPayoff = maxIntrinsic(st, k2, false);
    longArrays = scaleProfileArrays(putGreeksArray(st, k1, tRem, r, sigma), qtyLong);
    shortArrays = expiredPutGreeksArray(st, k2, qtyShort);
    longScalar = scaleProfile(putGreeks(s0, k1, tRem, r, sigma), qtyLong);
    shortScalar = valueAtSpot(expiredPutGreeksArray(st, k2, qtyShort), s0, st);
    legTypes = ["put", "put"];
    labels = [legLabel("Long", "put", "K_1"), legLabel("Short", "put", "K_2")];
  } else {
    throw new Error(`Not a multi-expiry strategy: ${strategyId}`);
  }

  const legMatrix = [longValue, shortPayoff.map((v) => -v)];
  const rawPayoff = new Float64Array(st.length);
  for (let i = 0; i < st.length; i++) {
    rawPayoff[i] = legMatrix[0][i] + legMatrix[1][i];
  }
  const payoff = applyPremium(rawPayoff, params);
  const aggregateArrays = combineProfilesArrays(longArrays, shortArrays);
  const aggregate = valueAtSpot(aggregateArrays, s0, st);

  const greekLegs = [
    {
      type: legTypes[0],
      strike: null,
      direction: "long",
      qty: 1,
      signedQty: qtyLong,
      label: labels[0],
      ...profileToDict(longScalar),
      profiles: profilesArraysToDict(longArrays),
    },
    {
      type: legTypes[1],
      strike: null,
      direction: "short",
      qty: 1,
      signedQty: qtyShort,
      label: labels[1],
      ...profileToDict(shortScalar),
      profiles: profilesArraysToDict(shortArrays),
    },
  ];

  return {
    legMatrix,
    payoff,
    labels,
    greekLegs,
    aggregateArrays,
    aggregate,
  };
}
