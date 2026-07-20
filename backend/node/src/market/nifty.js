/**
 * Live Nifty spot + scale helpers for defaults/sliders.
 * Does NOT change payoff formulas — only parameter levels and ranges.
 *
 * Designed for Vercel cold starts: never block forever on Yahoo.
 * Uses stale-while-revalidate + short fetch timeout + static fallback.
 * Cache is invalid across IST calendar days so sliders track the trading day.
 */

const FALLBACK_NIFTY = 24350;
const CACHE_MS = 5 * 60 * 1000;
/** Max wait for Yahoo on a cold / new-day path. */
const FETCH_TIMEOUT_MS = 1800;
const IST = "Asia/Kolkata";

const PRICE_KEYS = new Set(["S0", "K", "K1", "K2", "K3", "K4", "C", "D", "H", "spotMin", "spotMax"]);

function roundTo(n, step) {
  if (!Number.isFinite(n) || step <= 0) return n;
  return Math.round(n / step) * step;
}

/** Round Nifty to nearest 50 — typical index strike grid. */
export function roundNiftyAtm(spot) {
  return roundTo(spot, 50);
}

/** YYYY-MM-DD in Asia/Kolkata — trading-day key for cache invalidation. */
export function istMarketDay(input = new Date()) {
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

let cache = {
  spot: FALLBACK_NIFTY,
  atm: roundNiftyAtm(FALLBACK_NIFTY),
  asOf: null,
  source: "fallback",
  expires: 0,
  dayKey: "",
};

/** In-flight Yahoo refresh — shared so concurrent requests don't stampede. */
let refreshPromise = null;

function snapshot(extra = {}) {
  return {
    spot: cache.spot,
    atm: cache.atm ?? roundNiftyAtm(cache.spot),
    asOf: cache.asOf,
    source: cache.source,
    dayKey: cache.dayKey || istMarketDay(cache.asOf || new Date()),
    ...extra,
  };
}

function cacheFreshForTradingDay(now = Date.now()) {
  if (!(cache.expires > now) || !cache.spot) return false;
  const today = istMarketDay(new Date(now));
  const quoteDay = cache.dayKey || (cache.asOf ? istMarketDay(cache.asOf) : "");
  return Boolean(today && quoteDay && today === quoteDay);
}

async function fetchYahooNifty(signal) {
  const url =
    "https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?interval=1d&range=5d";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; OptionLab/1.0)",
      Accept: "application/json",
    },
    signal,
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

function applyQuote(q, now = Date.now()) {
  cache = {
    spot: q.spot,
    atm: roundNiftyAtm(q.spot),
    asOf: q.asOf,
    source: q.source,
    expires: now + CACHE_MS,
    dayKey: istMarketDay(q.asOf || new Date(now)),
  };
  return snapshot({ cached: false });
}

/** Kick off (or join) a background Yahoo refresh. Never throws to callers. */
function refreshInBackground() {
  if (refreshPromise) return refreshPromise;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS * 2);
  refreshPromise = fetchYahooNifty(ac.signal)
    .then((q) => applyQuote(q))
    .catch(() => {
      cache = {
        ...cache,
        spot: cache.spot || FALLBACK_NIFTY,
        atm: roundNiftyAtm(cache.spot || FALLBACK_NIFTY),
        asOf: cache.asOf || new Date().toISOString(),
        source: cache.source === "yahoo:^NSEI" || cache.source === "cache" ? "cache" : "fallback",
        expires: Date.now() + 60_000,
        dayKey: cache.dayKey || istMarketDay(cache.asOf || new Date()),
      };
      return snapshot({ cached: true });
    })
    .finally(() => {
      clearTimeout(timer);
      refreshPromise = null;
    });
  return refreshPromise;
}

/**
 * Fast Nifty quote for API handlers.
 * - Same IST trading day + fresh TTL → instant
 * - Same day but TTL expired → stale-while-revalidate
 * - New IST day / cold → wait briefly for Yahoo, else fallback
 */
export async function getNiftyQuote() {
  const now = Date.now();
  if (cacheFreshForTradingDay(now)) {
    return snapshot({ cached: true });
  }

  const today = istMarketDay(new Date(now));
  const quoteDay = cache.dayKey || (cache.asOf ? istMarketDay(cache.asOf) : "");
  const sameDay = Boolean(today && quoteDay && today === quoteDay);

  // Same trading day, TTL expired → return last good instantly, refresh behind
  if (sameDay && cache.source !== "fallback" && cache.spot) {
    void refreshInBackground();
    return snapshot({ cached: true, stale: true });
  }

  // New day or cold: race Yahoo vs timeout so sliders get today's ATM
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS);
  try {
    const q = await fetchYahooNifty(ac.signal);
    clearTimeout(timer);
    return applyQuote(q, now);
  } catch {
    clearTimeout(timer);
    void refreshInBackground();
    // Prefer yesterday's live level over a hard-coded fallback when we have one
    if (cache.spot && cache.source !== "fallback") {
      cache = {
        ...cache,
        expires: now + 60_000,
        source: "cache",
      };
      return snapshot({ cached: true, stale: true, dayRollover: true });
    }
    cache = {
      spot: FALLBACK_NIFTY,
      atm: roundNiftyAtm(FALLBACK_NIFTY),
      asOf: new Date().toISOString(),
      source: "fallback",
      expires: now + 30_000,
      dayKey: today,
    };
    return snapshot({ cached: true, cold: true });
  }
}

/** Force a network refresh (used by explicit client “fresh” requests). */
export async function refreshNiftyQuote() {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), FETCH_TIMEOUT_MS * 2);
  try {
    const q = await fetchYahooNifty(ac.signal);
    clearTimeout(timer);
    return applyQuote(q);
  } catch (err) {
    clearTimeout(timer);
    void refreshInBackground();
    throw err;
  }
}

/** Sync peek for rare cases — never network. */
export function peekNiftyQuote() {
  return snapshot({ cached: true });
}

function priceStepForKey(key) {
  if (key === "C" || key === "D" || key === "H") return 1;
  if (key === "spotMin" || key === "spotMax") return 5;
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
    dayKey: quote.dayKey || istMarketDay(quote.asOf || new Date()),
  };
}
