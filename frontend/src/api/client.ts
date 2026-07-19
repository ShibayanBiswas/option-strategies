import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : "/api",
  timeout: 20000,
  headers: { Accept: "application/json" },
  validateStatus: (status) => status >= 200 && status < 300,
});

export interface StrategySummary {
  id: string;
  name: string;
  section?: string;
  category: string;
  outlook: string;
  risk: string;
  hasPayoff: boolean;
}

export interface ParamField {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
}

export interface PayoffResponse {
  spotPrices: number[];
  payoffs: number[];
  legPayoffs?: {
    labels?: string[];
    legs: number[][];
  };
  metrics: Record<string, number | number[] | string>;
  greeks: {
    legs: Record<string, unknown>[];
    aggregate: Record<string, number>;
    aggregateProfiles?: Record<string, number[]>;
  };
  directional?: {
    label: string;
    netDelta: number;
    netGamma: number;
    netVega: number;
    netTheta: number;
    payoffSlopeAtSpot: number;
    liveEquations?: string[];
    latex: Record<string, string>;
    legContributions?: { leg: string; delta: number; contributionLatex?: string }[];
  };
}

export interface StrategyDetail extends StrategySummary {
  section?: string;
  description?: string;
  paragraphs?: string[];
  riskType?: string;
  legs?: {
    id: string;
    index: number;
    direction: string;
    type: string;
    typeName: string;
    strike: string | null;
    title: string;
    subtitle: string;
    role: string;
    directionTag: string;
  }[];
  payoffLatex?: string | null;
  breakevenLatex?: string;
  maxProfitLatex?: string;
  maxLossLatex?: string;
  conditions?: { latex: string; note: string }[] | null;
  isApproximate?: boolean;
  notation?: { symbol: string; meaning: string }[];
  payoffEquationBlock?: {
    title: string;
    context: string;
    notation: { symbol: string; meaning: string }[];
    equations: Array<{ latex: string; context?: string; notation?: { symbol: string; meaning: string }[] }>;
  } | null;
  additionalEquations?: Record<
    string,
    { latex: string; context?: string; notation?: { symbol: string; meaning: string }[] }
  >;
  greeksProfile?: {
    summary: string;
    intuition?: string[];
    paragraphs?: string[];
    laymanGreeks?: Array<{
      key: string;
      title: string;
      plain: string;
      strategyTip: string;
      formula?: string;
    }>;
    legBreakdown?: { id: string; label: string; text: string; latex: string }[];
    aggregate?: string;
  };
  directionalProfile?: {
    label?: string;
    paragraph?: string;
    paragraphs?: string[];
    latex?: Record<string, string>;
  };
  defaultParams?: Record<string, number>;
  paramSchema?: ParamField[];
  market?: {
    symbol: string;
    spot: number;
    atm: number;
    asOf?: string;
    source?: string;
  };
  /** Present when fetched with ?payoff=1 — first-paint charts without a second round-trip */
  initialPayoff?: PayoffResponse;
}

function assertJsonPayload(data: unknown, url: string): void {
  if (typeof data === "string" && data.trimStart().startsWith("<!")) {
    throw new Error(`API routed to HTML instead of JSON (${url})`);
  }
  if (data == null || typeof data !== "object") {
    throw new Error(`Invalid API response from ${url}`);
  }
}

export const fetchHealth = () => api.get("/health");
export const fetchIntro = () => api.get("/intro");
export const fetchCategories = () => api.get("/categories");
export const fetchStrategies = (scope?: "chapter" | "all") =>
  api.get<StrategySummary[]>("/strategies", { params: scope ? { scope } : {} });

const strategyDetailCache = new Map<string, { at: number; data: StrategyDetail }>();
const STRATEGY_CACHE_MS = 60_000;

export function invalidateStrategyCache(id?: string) {
  if (!id) {
    strategyDetailCache.clear();
    return;
  }
  for (const key of [...strategyDetailCache.keys()]) {
    if (key.startsWith(`${id}:`)) strategyDetailCache.delete(key);
  }
}

async function getStrategyOnce(id: string, withPayoff: boolean) {
  const res = await api.get<StrategyDetail>(`/strategies/${id}`, {
    params: withPayoff ? { payoff: 1 } : undefined,
    timeout: withPayoff ? 25000 : 15000,
  });
  assertJsonPayload(res.data, `/strategies/${id}`);
  if (!(res.data as StrategyDetail).id) {
    throw new Error("Strategy payload missing id");
  }
  return res;
}

/** Strategy monograph; prefers bundled payoff, falls back to monograph-only if seed fails. */
export const fetchStrategy = async (
  id: string,
  opts?: { payoff?: boolean; fresh?: boolean },
) => {
  const withPayoff = opts?.payoff !== false;
  if (opts?.fresh) invalidateStrategyCache(id);

  const cacheKey = `${id}:${withPayoff ? "p1" : "p0"}`;
  const hit = strategyDetailCache.get(cacheKey);
  if (!opts?.fresh && hit && Date.now() - hit.at < STRATEGY_CACHE_MS) {
    return { data: hit.data };
  }

  try {
    const res = await getStrategyOnce(id, withPayoff);
    strategyDetailCache.set(cacheKey, { at: Date.now(), data: res.data });
    strategyDetailCache.set(`${id}:p0`, { at: Date.now(), data: res.data });
    return res;
  } catch (err) {
    if (!withPayoff) throw err;
    // Retry without payoff seed — still show the monograph
    const res = await getStrategyOnce(id, false);
    strategyDetailCache.set(`${id}:p0`, { at: Date.now(), data: res.data });
    return res;
  }
};

export const fetchPayoff = (strategyId: string, params: Record<string, number>) =>
  api.post<PayoffResponse>("/payoff", { strategyId, params }, { timeout: 20000 });

export const fetchNiftyMarket = () =>
  api.get<{
    symbol: string;
    spot: number;
    atm: number;
    asOf?: string;
    source?: string;
  }>("/market/nifty");

/** Warm the strategy monograph cache on hover / focus. */
export function prefetchStrategy(id: string) {
  if (!id) return;
  void fetchStrategy(id, { payoff: true }).catch(() => undefined);
}

export default api;
