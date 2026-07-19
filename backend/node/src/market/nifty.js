/**
 * Live Nifty spot + scale helpers for defaults/sliders.
 * Does NOT change payoff formulas — only parameter levels and ranges.
 */

const FALLBACK_NIFTY = 24350;
const CACHE_MS = 5 * 60 * 1000;

const PRICE_KEYS = new Set(["S0", "K", "K1", "K2", "K3", "K4", "C", "D", "H", "spotMin", "spotMax"]);

let cache = { spot: FALLBACK_NIFTY, asOf: null, source: "fallback", expires: 0 };

function roundTo(n, step) {
  if (!Number.isFinite(n) || step <= 0) return n;
  return Math.round(n / step) * step;
}

/** Round Nifty to nearest 50 — typical index strike grid. */
export function roundNiftyAtm(spot) {
  return roundTo(spot, 50);
}

async function fetchYahooNifty() {
  const url =
    "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=5d";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OptionLab/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`Yahoo Nifty HTTP ${res.status}`);
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  const price = Number(meta?.regularMarketPrice ?? meta?.previousClose);
  if (!Number.isFinite(price) || price < 1000) throw new Error("Invalid Nifty price");
  return {
    spot: price,
    asOf: meta?.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : new Date().toISOString(),
    source: "yahoo:^NSEI",
  };
}

/** Cached live Nifty quote (5 min). Falls back to last good / static level. */
export async function getNiftyQuote() {
  const now = Date.now();
  if (cache.expires > now && cache.spot) return { ...cache, cached: true };

  try {
    const q = await fetchYahooNifty();
    cache = {
      spot: q.spot,
      atm: roundNiftyAtm(q.spot),
      asOf: q.asOf,
      source: q.source,
      expires: now + CACHE_MS,
    };
    return { ...cache, cached: false };
  } catch (err) {
    cache = {
      ...cache,
      spot: cache.spot || FALLBACK_NIFTY,
      atm: roundNiftyAtm(cache.spot || FALLBACK_NIFTY),
      asOf: cache.asOf || new Date().toISOString(),
      source: cache.source === "yahoo:^NSEI" ? "cache" : "fallback",
      expires: now + 60_000,
      error: String(err.message || err),
    };
    return { ...cache, cached: true };
  }
}

function priceStepForKey(key) {
  if (key === "C" || key === "D" || key === "H") return 1;
  if (key === "spotMin" || key === "spotMax") return 5;
  // S0 and strikes — fine slider precision on Nifty scale
  return 5;
}

/**
 * Scale textbook/notebook levels (S0≈50–100) to live Nifty while preserving
 * relative moneyness and premium-as-%-of-spot. Payoff math is unchanged.
 */
export function scaleParamsToSpot(params, niftySpot) {
  if (!params || !Number.isFinite(niftySpot) || niftySpot <= 0) return { ...params };
  const ref = Number(params.S0);
  if (!Number.isFinite(ref) || ref <= 0) return { ...params };

  const target = roundNiftyAtm(niftySpot);
  const scale = target / ref;
  const out = { ...params };

  for (const key of Object.keys(out)) {
    if (!PRICE_KEYS.has(key)) continue;
    const v = Number(out[key]);
    if (!Number.isFinite(v)) continue;
    out[key] = roundTo(v * scale, priceStepForKey(key));
  }

  // Keep spot window ordered
  if (out.spotMin != null && out.spotMax != null && out.spotMin > out.spotMax) {
    const t = out.spotMin;
    out.spotMin = out.spotMax;
    out.spotMax = t;
  }

  return out;
}

/** Build slider schema around live Nifty with fine steps. */
export function buildNiftyParamSchema(baseFields, niftySpot) {
  const spot = Number.isFinite(niftySpot) && niftySpot > 0 ? niftySpot : FALLBACK_NIFTY;
  const atm = roundNiftyAtm(spot);
  const lo = roundTo(atm * 0.55, 50);
  const hi = roundTo(atm * 1.45, 50);
  const premMax = Math.max(500, roundTo(atm * 0.12, 50));

  return (baseFields || []).map((field) => {
    const key = field.key;
    if (key === "S0" || key === "K" || /^K[1-4]$/.test(key)) {
      return { ...field, min: lo, max: hi, step: 5 };
    }
    if (key === "C" || key === "D" || key === "H") {
      return { ...field, min: key === "H" ? 0 : 1, max: premMax, step: 1 };
    }
    if (key === "sigma") {
      return { ...field, min: 0.05, max: 0.8, step: 0.001 };
    }
    if (key === "T" || key === "T_short") {
      return { ...field, min: field.min ?? 0.02, max: field.max, step: 0.001 };
    }
    return field;
  });
}

export function marketMeta(quote) {
  return {
    symbol: "NIFTY 50",
    spot: quote.spot,
    atm: quote.atm ?? roundNiftyAtm(quote.spot),
    asOf: quote.asOf,
    source: quote.source,
  };
}
