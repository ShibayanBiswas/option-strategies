import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
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

export const fetchHealth = () => api.get("/health");
export const fetchIntro = () => api.get("/intro");
export const fetchCategories = () => api.get("/categories");
export const fetchStrategies = (scope?: "chapter" | "all") =>
  api.get<StrategySummary[]>("/strategies", { params: scope ? { scope } : {} });
export const fetchStrategy = (id: string) => api.get<StrategyDetail>(`/strategies/${id}`);
export const fetchPayoff = (strategyId: string, params: Record<string, number>) =>
  api.post<PayoffResponse>("/payoff", { strategyId, params });

export default api;
