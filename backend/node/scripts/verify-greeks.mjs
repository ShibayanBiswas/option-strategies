/**
 * Audit BS unit Greeks + portfolio aggregation for every strategy.
 * Run: node scripts/verify-greeks.mjs
 */
import {
  callGreeks,
  callPriceArray,
  putGreeks,
  putPriceArray,
} from "../src/analytics/greeks.js";
import { computePayoff, STRATEGY_IDS } from "../src/analytics/engine.js";
import { NOTEBOOK_BY_ID } from "../src/data/notebookDefaults.js";

const failures = [];
function check(name, cond, detail = "") {
  if (!cond) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

const S = 100;
const K = 100;
const T = 0.25;
const r = 0.05;
const sigma = 0.25;

// --- Unit BS identities (Hull / standard European, q=0) ---
const c = callGreeks(S, K, T, r, sigma);
const p = putGreeks(S, K, T, r, sigma);

check("call delta in (0,1)", c.delta > 0.3 && c.delta < 0.7, String(c.delta));
check("put delta in (-1,0)", p.delta > -0.7 && p.delta < -0.3, String(p.delta));
check("Δc − Δp ≈ 1", Math.abs(c.delta - p.delta - 1) < 1e-6, String(c.delta - p.delta));
check("Γc = Γp", Math.abs(c.gamma - p.gamma) < 1e-10, String(Math.abs(c.gamma - p.gamma)));
check("νc = νp", Math.abs(c.vega - p.vega) < 1e-10);
check("Γ > 0", c.gamma > 0 && p.gamma > 0);
check("ν > 0", c.vega > 0 && p.vega > 0);
check("Θc < 0 ATM", c.theta < 0, String(c.theta));
check("ρc > 0", c.rho > 0);
check("ρp < 0", p.rho < 0);
check(
  "ρc − ρp ≈ K T e^{-rT}/100",
  Math.abs(c.rho - p.rho - (K * T * Math.exp(-r * T)) / 100) < 1e-6
);

// Finite-difference delta / gamma / vega / theta / rho
const hS = 0.05;
const callAt = (s, t = T, rr = r, sig = sigma) => callPriceArray([s], K, t, rr, sig)[0];
const putAt = (s, t = T, rr = r, sig = sigma) => putPriceArray([s], K, t, rr, sig)[0];

const fdCallDelta = (callAt(S + hS) - callAt(S - hS)) / (2 * hS);
const fdPutDelta = (putAt(S + hS) - putAt(S - hS)) / (2 * hS);
check("FD call Δ", Math.abs(fdCallDelta - c.delta) < 2e-4, `${fdCallDelta} vs ${c.delta}`);
check("FD put Δ", Math.abs(fdPutDelta - p.delta) < 2e-4, `${fdPutDelta} vs ${p.delta}`);

const fdCallGamma =
  (callAt(S + hS) - 2 * callAt(S) + callAt(S - hS)) / (hS * hS);
check("FD call Γ", Math.abs(fdCallGamma - c.gamma) < 5e-5, `${fdCallGamma} vs ${c.gamma}`);

const hSig = 1e-4;
const fdCallVega = (callAt(S, T, r, sigma + hSig) - callAt(S, T, r, sigma - hSig)) / (2 * hSig) / 100;
check("FD call ν (/100)", Math.abs(fdCallVega - c.vega) < 2e-4, `${fdCallVega} vs ${c.vega}`);

const hR = 1e-4;
const fdCallRho = (callAt(S, T, r + hR) - callAt(S, T, r - hR)) / (2 * hR) / 100;
check("FD call ρ (/100)", Math.abs(fdCallRho - c.rho) < 2e-4, `${fdCallRho} vs ${c.rho}`);

const day = 1 / 365;
const fdCallTheta = (callAt(S, T - day) - callAt(S, T)) / 1; // per calendar day
check("FD call Θ (/day)", Math.abs(fdCallTheta - c.theta) < 5e-3, `${fdCallTheta} vs ${c.theta}`);

// Aggregate must equal sum of leg signed Greeks; profile[S0] ≈ scalar
function nearestIdx(grid, s0) {
  let idx = 0;
  let best = Math.abs(grid[0] - s0);
  for (let i = 1; i < grid.length; i++) {
    const d = Math.abs(grid[i] - s0);
    if (d < best) {
      best = d;
      idx = i;
    }
  }
  return idx;
}

/** Qualitative sign / shape expectations at ATM-ish defaults */
const EXPECT = {
  "long-call": { delta: "+", gamma: "+", vega: "+", theta: "-" },
  "short-call": { delta: "-", gamma: "-", vega: "-", theta: "+" },
  "long-put": { delta: "-", gamma: "+", vega: "+", theta: "?" }, // deep OTM put theta can flip
  "short-put": { delta: "+", gamma: "-", vega: "-" },
  "long-straddle": { delta: "~0", gamma: "+", vega: "+", theta: "-" },
  "short-straddle": { delta: "~0", gamma: "-", vega: "-", theta: "+" },
  "long-strangle": { gamma: "+", vega: "+" },
  "short-strangle": { gamma: "-", vega: "-" },
  "bull-call-spread": { delta: "+" },
  "bear-put-spread": { delta: "-" },
  "bear-call-spread": { delta: "-" },
  "bull-put-spread": { delta: "+" },
  "long-call-butterfly": { gamma: "-", vega: "-" }, // long body short wings? Wait long BF = long wings short body → short gamma ATM
  "short-call-butterfly": { gamma: "+", vega: "+" },
  "long-iron-condor": { gamma: "-", vega: "-", theta: "+" }, // long wings = debit IC? Check naming
  "short-iron-condor": { gamma: "+", vega: "+", theta: "-" },
  "covered-call": { delta: "+", gamma: "-", vega: "-" },
  "protective-put": { delta: "+", gamma: "+", vega: "+" },
  collar: { delta: "+", gamma: "~0" },
  "long-call-synthetic-straddle": { delta: "~0", gamma: "+", vega: "+" },
  "long-put-synthetic-straddle": { delta: "~0", gamma: "+", vega: "+" },
  "short-call-synthetic-straddle": { delta: "~0", gamma: "-", vega: "-" },
  "short-put-synthetic-straddle": { delta: "~0", gamma: "-", vega: "-" },
  strap: { delta: "+" },
  strip: { delta: "-" },
};

function matchSign(val, rule) {
  if (!rule || rule === "?") return true;
  if (rule === "~0") return Math.abs(val) < 0.25;
  if (rule === "+") return val > 0.01;
  if (rule === "-") return val < -0.01;
  return true;
}

for (const id of STRATEGY_IDS) {
  const params = {
    S0: 100,
    K: 100,
    T: 0.25,
    r: 0.05,
    sigma: 0.25,
    ...(NOTEBOOK_BY_ID[id] ?? {}),
  };

  let out;
  try {
    out = computePayoff(id, params);
  } catch (e) {
    check(`${id} compute`, false, e.message);
    continue;
  }

  const { greeks, spotPrices } = out;
  const agg = greeks.aggregate;
  const legs = greeks.legs;
  const idx = nearestIdx(spotPrices, params.S0);

  // Sum of leg scalars == aggregate
  for (const key of ["delta", "gamma", "theta", "vega", "rho"]) {
    const sum = legs.reduce((a, l) => a + Number(l[key]), 0);
    check(
      `${id} aggregate ${key} = Σ legs`,
      Math.abs(sum - agg[key]) < 1e-3,
      `${sum} vs ${agg[key]}`
    );
    const prof = greeks.aggregateProfiles[key][idx];
    check(
      `${id} profile ${key}@S0 ≈ aggregate`,
      Math.abs(prof - agg[key]) < 1e-3,
      `${prof} vs ${agg[key]}`
    );
  }

  // Leg profile length matches spot grid
  for (let i = 0; i < legs.length; i++) {
    check(
      `${id} leg${i} delta profile length`,
      legs[i].profiles.delta.length === spotPrices.length
    );
  }

  // Short legs must flip unit Greek signs relative to long same-type ATM sanity
  for (const leg of legs) {
    if (leg.type === "stock") {
      check(`${id} stock |Δ|≈|signedQty|`, Math.abs(Math.abs(leg.delta) - Math.abs(leg.signedQty)) < 1e-6);
      continue;
    }
    if (leg.direction === "short" && leg.gamma !== 0) {
      // Short options: gamma contribution negative for calls/puts with T>0
      // (expired short legs have gamma 0)
      check(`${id} short ${leg.label} Γ ≤ 0`, leg.gamma <= 1e-9, String(leg.gamma));
    }
    if (leg.direction === "long" && leg.gamma !== 0) {
      check(`${id} long ${leg.label} Γ ≥ 0`, leg.gamma >= -1e-9, String(leg.gamma));
    }
  }

  const exp = EXPECT[id];
  if (exp) {
    for (const [k, rule] of Object.entries(exp)) {
      check(`${id} expected ${k} ${rule}`, matchSign(agg[k], rule), String(agg[k]));
    }
  }

  // Directional latex uses already-signed Δ (no double σ)
  for (const contrib of out.directional.legContributions) {
    check(
      `${id} contrib latex is signed once`,
      contrib.contributionLatex.includes("signed") &&
        Math.abs(Number(contrib.delta) - Number(String(contrib.contributionLatex).match(/([+-]?\d+\.\d+)/)?.[1])) < 1e-3,
      contrib.contributionLatex
    );
  }
}

console.log(`Checked ${STRATEGY_IDS.length} strategies`);
if (failures.length) {
  console.error(`\nFAIL (${failures.length}):`);
  for (const f of failures.slice(0, 80)) console.error(" -", f);
  if (failures.length > 80) console.error(` ... +${failures.length - 80} more`);
  process.exit(1);
}
console.log("\nALL CHECKS PASSED");
