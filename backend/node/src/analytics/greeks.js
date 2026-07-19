/** Black-Scholes Greeks — vectorised for spot grids and leg portfolios. */

const INV_SQRT_2PI = 1.0 / Math.sqrt(2.0 * Math.PI);
const INV_SQRT_2 = 1.0 / Math.sqrt(2.0);

/** Abramowitz & Stegud approximation when Math.erf is unavailable. */
function erfApprox(x) {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + 0.3275911 * ax);
  const y =
    1.0 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t *
      Math.exp(-ax * ax));
  return sign * y;
}

const erfFn = typeof Math.erf === "function" ? (x) => Math.erf(x) : erfApprox;

export function asArray(x) {
  if (x instanceof Float64Array) return x;
  if (Array.isArray(x)) return Float64Array.from(x);
  return Float64Array.from([x]);
}

export function normPdf(x) {
  const arr = asArray(x);
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = Math.exp(-0.5 * arr[i] * arr[i]) * INV_SQRT_2PI;
  }
  return out;
}

export function normCdf(x) {
  const arr = asArray(x);
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = 0.5 * (1.0 + erfFn(arr[i] * INV_SQRT_2));
  }
  return out;
}

function d1D2(S, K, T, r, sigma) {
  const arr = asArray(S);
  const d1 = new Float64Array(arr.length);
  const d2 = new Float64Array(arr.length);
  if (T <= 0 || sigma <= 0 || K <= 0) {
    return { d1, d2 };
  }
  const sqrtT = Math.sqrt(T);
  for (let i = 0; i < arr.length; i++) {
    const safeS = Math.max(arr[i], 1e-12);
    d1[i] = (Math.log(safeS / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * sqrtT);
    d2[i] = d1[i] - sigma * sqrtT;
  }
  return { d1, d2 };
}

function whereGt(arr, threshold, ifTrue, ifFalse) {
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[i] > threshold ? ifTrue : ifFalse;
  }
  return out;
}

function whereLt(arr, threshold, ifTrue, ifFalse) {
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[i] < threshold ? ifTrue : ifFalse;
  }
  return out;
}

function zerosLike(arr) {
  return new Float64Array(arr.length);
}

function fullLike(arr, value) {
  const out = new Float64Array(arr.length);
  out.fill(value);
  return out;
}

export function callGreeksArray(S, K, T, r, sigma) {
  const arr = asArray(S);
  const { d1, d2 } = d1D2(arr, K, T, r, sigma);
  if (T <= 0 || sigma <= 0) {
    return {
      delta: whereGt(arr, K, 1.0, 0.0),
      gamma: zerosLike(arr),
      theta: zerosLike(arr),
      vega: zerosLike(arr),
      rho: zerosLike(arr),
    };
  }
  const sqrtT = Math.sqrt(T);
  const pdfD1 = normPdf(d1);
  const cdfD1 = normCdf(d1);
  const cdfD2 = normCdf(d2);
  const delta = cdfD1;
  const gamma = new Float64Array(arr.length);
  const theta = new Float64Array(arr.length);
  const vega = new Float64Array(arr.length);
  const rho = new Float64Array(arr.length);
  const expRt = Math.exp(-r * T);
  for (let i = 0; i < arr.length; i++) {
    const safeS = Math.max(arr[i], 1e-12);
    gamma[i] = pdfD1[i] / (safeS * sigma * sqrtT);
    theta[i] = (-(arr[i] * pdfD1[i] * sigma) / (2 * sqrtT) - r * K * expRt * cdfD2[i]) / 365.0;
    vega[i] = (arr[i] * pdfD1[i] * sqrtT) / 100.0;
    rho[i] = (K * T * expRt * cdfD2[i]) / 100.0;
  }
  return { delta, gamma, theta, vega, rho };
}

export function putGreeksArray(S, K, T, r, sigma) {
  const arr = asArray(S);
  const { d1, d2 } = d1D2(arr, K, T, r, sigma);
  if (T <= 0 || sigma <= 0) {
    return {
      delta: whereLt(arr, K, -1.0, 0.0),
      gamma: zerosLike(arr),
      theta: zerosLike(arr),
      vega: zerosLike(arr),
      rho: zerosLike(arr),
    };
  }
  const sqrtT = Math.sqrt(T);
  const pdfD1 = normPdf(d1);
  const cdfD1 = normCdf(d1);
  const negD2 = new Float64Array(d2.length);
  for (let i = 0; i < d2.length; i++) negD2[i] = -d2[i];
  const cdfNegD2 = normCdf(negD2);
  const delta = new Float64Array(arr.length);
  const gamma = new Float64Array(arr.length);
  const theta = new Float64Array(arr.length);
  const vega = new Float64Array(arr.length);
  const rho = new Float64Array(arr.length);
  const expRt = Math.exp(-r * T);
  for (let i = 0; i < arr.length; i++) {
    delta[i] = cdfD1[i] - 1.0;
    const safeS = Math.max(arr[i], 1e-12);
    gamma[i] = pdfD1[i] / (safeS * sigma * sqrtT);
    theta[i] = (-(arr[i] * pdfD1[i] * sigma) / (2 * sqrtT) + r * K * expRt * cdfNegD2[i]) / 365.0;
    vega[i] = (arr[i] * pdfD1[i] * sqrtT) / 100.0;
    rho[i] = (-K * T * expRt * cdfNegD2[i]) / 100.0;
  }
  return { delta, gamma, theta, vega, rho };
}

export function stockGreeksArray(S, qty = 1.0) {
  const arr = asArray(S);
  return {
    delta: fullLike(arr, qty),
    gamma: zerosLike(arr),
    theta: zerosLike(arr),
    vega: zerosLike(arr),
    rho: zerosLike(arr),
  };
}

export function callPriceArray(S, K, T, r, sigma) {
  const arr = asArray(S);
  if (T <= 0 || sigma <= 0) {
    const out = new Float64Array(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = Math.max(arr[i] - K, 0.0);
    return out;
  }
  const { d1, d2 } = d1D2(arr, K, T, r, sigma);
  const cdfD1 = normCdf(d1);
  const cdfD2 = normCdf(d2);
  const expRt = Math.exp(-r * T);
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = arr[i] * cdfD1[i] - K * expRt * cdfD2[i];
  }
  return out;
}

export function putPriceArray(S, K, T, r, sigma) {
  const arr = asArray(S);
  if (T <= 0 || sigma <= 0) {
    const out = new Float64Array(arr.length);
    for (let i = 0; i < arr.length; i++) out[i] = Math.max(K - arr[i], 0.0);
    return out;
  }
  const { d1, d2 } = d1D2(arr, K, T, r, sigma);
  const negD1 = new Float64Array(d1.length);
  const negD2 = new Float64Array(d2.length);
  for (let i = 0; i < d1.length; i++) {
    negD1[i] = -d1[i];
    negD2[i] = -d2[i];
  }
  const cdfNegD1 = normCdf(negD1);
  const cdfNegD2 = normCdf(negD2);
  const expRt = Math.exp(-r * T);
  const out = new Float64Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    out[i] = K * expRt * cdfNegD2[i] - arr[i] * cdfNegD1[i];
  }
  return out;
}

export function expiredCallGreeksArray(S, K, signedQty) {
  const arr = asArray(S);
  return {
    delta: whereGt(arr, K, signedQty, 0.0),
    gamma: zerosLike(arr),
    theta: zerosLike(arr),
    vega: zerosLike(arr),
    rho: zerosLike(arr),
  };
}

export function expiredPutGreeksArray(S, K, signedQty) {
  const arr = asArray(S);
  return {
    delta: whereLt(arr, K, signedQty * -1.0, 0.0),
    gamma: zerosLike(arr),
    theta: zerosLike(arr),
    vega: zerosLike(arr),
    rho: zerosLike(arr),
  };
}

export function callGreeks(S, K, T, r, sigma) {
  const g = callGreeksArray(Float64Array.from([S]), K, T, r, sigma);
  return {
    delta: g.delta[0],
    gamma: g.gamma[0],
    theta: g.theta[0],
    vega: g.vega[0],
    rho: g.rho[0],
  };
}

export function putGreeks(S, K, T, r, sigma) {
  const g = putGreeksArray(Float64Array.from([S]), K, T, r, sigma);
  return {
    delta: g.delta[0],
    gamma: g.gamma[0],
    theta: g.theta[0],
    vega: g.vega[0],
    rho: g.rho[0],
  };
}

export function stockGreeks(qty = 1.0) {
  return { delta: qty, gamma: 0.0, theta: 0.0, vega: 0.0, rho: 0.0 };
}

export function scaleProfileArrays(profile, qty) {
  return {
    delta: profile.delta.map((v) => v * qty),
    gamma: profile.gamma.map((v) => v * qty),
    theta: profile.theta.map((v) => v * qty),
    vega: profile.vega.map((v) => v * qty),
    rho: profile.rho.map((v) => v * qty),
  };
}

export function combineProfiles(...profiles) {
  return profiles.reduce(
    (acc, p) => ({
      delta: acc.delta + p.delta,
      gamma: acc.gamma + p.gamma,
      theta: acc.theta + p.theta,
      vega: acc.vega + p.vega,
      rho: acc.rho + p.rho,
    }),
    { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }
  );
}

export function combineProfilesArrays(...profiles) {
  if (profiles.length === 0) {
    const z = Float64Array.from([0.0]);
    return { delta: z, gamma: z, theta: z, vega: z, rho: z };
  }
  const n = profiles[0].delta.length;
  const sum = (key) => {
    const out = new Float64Array(n);
    for (const p of profiles) {
      for (let i = 0; i < n; i++) out[i] += p[key][i];
    }
    return out;
  };
  return {
    delta: sum("delta"),
    gamma: sum("gamma"),
    theta: sum("theta"),
    vega: sum("vega"),
    rho: sum("rho"),
  };
}

export function scaleProfile(profile, qty) {
  return {
    delta: profile.delta * qty,
    gamma: profile.gamma * qty,
    theta: profile.theta * qty,
    vega: profile.vega * qty,
    rho: profile.rho * qty,
  };
}

export function profileToDict(profile) {
  return {
    delta: Math.round(profile.delta * 1e4) / 1e4,
    gamma: Math.round(profile.gamma * 1e6) / 1e6,
    theta: Math.round(profile.theta * 1e4) / 1e4,
    vega: Math.round(profile.vega * 1e4) / 1e4,
    rho: Math.round(profile.rho * 1e4) / 1e4,
  };
}

export function profilesArraysToDict(profile) {
  const roundArr = (arr, decimals) =>
    Array.from(arr, (x) => Math.round(x * 10 ** decimals) / 10 ** decimals);
  return {
    delta: roundArr(profile.delta, 4),
    gamma: roundArr(profile.gamma, 6),
    theta: roundArr(profile.theta, 4),
    vega: roundArr(profile.vega, 4),
    rho: roundArr(profile.rho, 4),
  };
}

export function valueAtSpot(profile, s0, spotGrid) {
  let idx = 0;
  let minDiff = Math.abs(spotGrid[0] - s0);
  for (let i = 1; i < spotGrid.length; i++) {
    const diff = Math.abs(spotGrid[i] - s0);
    if (diff < minDiff) {
      minDiff = diff;
      idx = i;
    }
  }
  return {
    delta: profile.delta[idx],
    gamma: profile.gamma[idx],
    theta: profile.theta[idx],
    vega: profile.vega[idx],
    rho: profile.rho[idx],
  };
}
