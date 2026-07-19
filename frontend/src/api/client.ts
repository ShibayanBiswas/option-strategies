import axios from "axios";

const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

const api = axios.create({
  baseURL: apiBase ? `${apiBase}/api` : "/api",
  timeout: 12000,
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

export const fetchHealth = () => api.get("/health");
export const fetchIntro = () => api.get("/intro");
export const fetchCategories = () => api.get("/categories");
export const fetchStrategies = (scope?: "chapter" | "all") =>
  api.get<StrategySummary[]>("/strategies", { params: scope ? { scope } : {} });
/** Strategy monograph + optional first-paint payoff in one round-trip (?payoff=1). */
const strategyDetailCache = new Map<string, { at: number; data: StrategyDetail }>();
const STRATEGY_CACHE_MS = 60_000;

export const fetchStrategy = async (id: string, opts?: { payoff?: boolean }) => {
  const withPayoff = opts?.payoff !== false;
  const cacheKey = `${id}:${withPayoff ? "p1" : "p0"}`;
  const hit = strategyDetailCache.get(cacheKey);
  if (hit && Date.now() - hit.at < STRATEGY_CACHE_MS) {
    return { data: hit.data };
  }
  const res = await api.get<StrategyDetail>(`/strategies/${id}`, {
    params: withPayoff ? { payoff: 1 } : undefined,
    timeout: 12000,
  });
  strategyDetailCache.set(cacheKey, { at: Date.now(), data: res.data });
  return res;
};

export const fetchPayoff = (strategyId: string, params: Record<string, number>) =>
  api.post<PayoffResponse>("/payoff", { strategyId, params }, { timeout: 12000 });

/** Warm the strategy monograph cache on hover / focus (cuts click → paint latency). */
export function prefetchStrategy(id: string) {
  if (!id) return;
  void fetchStrategy(id, { payoff: true }).catch(() => undefined);
}

export default api;
