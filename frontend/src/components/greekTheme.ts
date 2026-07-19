import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Calculator,
  Clock,
  Compass,
  Layers,
  Percent,
  Sparkles,
  TrendingUp,
  Wind,
  Zap,
} from "lucide-react";

export type GreekKey = "delta" | "gamma" | "theta" | "vega" | "rho";

export interface GreekMeta {
  key: GreekKey;
  symbol: string;
  name: string;
  icon: LucideIcon;
  accent: string;
  glow: string;
  border: string;
  bg: string;
}

export const GREEK_META: Record<GreekKey, GreekMeta> = {
  delta: {
    key: "delta",
    symbol: "Δ",
    name: "Delta",
    icon: TrendingUp,
    accent: "text-ar-gold",
    glow: "shadow-ar",
    border: "border-ar-gold/40",
    bg: "from-ar-gold/15 via-ar-surface to-ar-panel",
  },
  gamma: {
    key: "gamma",
    symbol: "Γ",
    name: "Gamma",
    icon: Sparkles,
    accent: "text-ar-maroon",
    glow: "shadow-ar",
    border: "border-ar-maroon/40",
    bg: "from-ar-maroon/10 via-ar-surface to-ar-panel",
  },
  theta: {
    key: "theta",
    symbol: "Θ",
    name: "Theta",
    icon: Clock,
    accent: "text-amber-700 dark:text-amber-300",
    glow: "shadow-ar",
    border: "border-amber-500/40",
    bg: "from-amber-500/10 via-ar-surface to-ar-panel",
  },
  vega: {
    key: "vega",
    symbol: "ν",
    name: "Vega",
    icon: Wind,
    accent: "text-emerald-700 dark:text-emerald-300",
    glow: "shadow-ar",
    border: "border-emerald-500/40",
    bg: "from-emerald-500/10 via-ar-surface to-ar-panel",
  },
  rho: {
    key: "rho",
    symbol: "ρ",
    name: "Rho",
    icon: Percent,
    accent: "text-rose-700 dark:text-rose-300",
    glow: "shadow-ar",
    border: "border-rose-500/40",
    bg: "from-rose-500/10 via-ar-surface to-ar-panel",
  },
};

export const GREEK_ORDER: GreekKey[] = ["delta", "gamma", "theta", "vega", "rho"];

export interface FormulaMeta {
  title: string;
  subtitle: string;
  context?: string;
  notation?: { symbol: string; meaning: string }[];
  icon: LucideIcon;
  greek?: GreekKey;
}

export const FORMULA_META: Record<string, FormulaMeta> = {
  payoffDecomposition: {
    title: "Payoff Decomposition",
    subtitle: "Terminal book at expiry",
    context: "Terminal payoff as a signed sum of leg intrinsic payoffs minus premium.",
    notation: [
      { symbol: "\\phi_i(S_T)", meaning: "Intrinsic payoff of leg i" },
      { symbol: "H", meaning: "Net premium paid or received" },
    ],
    icon: Layers,
  },
  netDelta: {
    title: "Net Delta",
    subtitle: "Directional exposure",
    context: "Aggregate spot sensitivity of the whole book at S_0 before expiry.",
    notation: [
      { symbol: "\\Delta_i", meaning: "Delta of leg i" },
      { symbol: "\\sigma_i", meaning: "Leg sign (+1 long, −1 short)" },
    ],
    icon: TrendingUp,
    greek: "delta",
  },
  netGamma: {
    title: "Net Gamma",
    subtitle: "Convexity",
    context: "Net convexity — how aggregate delta changes when spot moves.",
    notation: [{ symbol: "\\Gamma_i", meaning: "Gamma of leg i" }],
    icon: Sparkles,
    greek: "gamma",
  },
  netVega: {
    title: "Net Vega",
    subtitle: "Volatility sensitivity",
    context: "Net volatility exposure — mark-to-market change per unit σ move.",
    notation: [{ symbol: "\\nu_i", meaning: "Vega of leg i" }],
    icon: Wind,
    greek: "vega",
  },
  netTheta: {
    title: "Net Theta",
    subtitle: "Time decay",
    context: "Net daily time decay of the book at current parameters.",
    notation: [{ symbol: "\\Theta_i", meaning: "Theta of leg i" }],
    icon: Clock,
    greek: "theta",
  },
  pnlApprox: {
    title: "P&L Approximation",
    subtitle: "Second-order Taylor",
    context: "Second-order Taylor approximation for small changes in spot, vol, and time.",
    notation: [
      { symbol: "\\Delta S", meaning: "Change in underlying spot" },
      { symbol: "\\Delta\\sigma", meaning: "Change in implied volatility" },
      { symbol: "\\Delta t", meaning: "Elapsed time" },
    ],
    icon: Calculator,
  },
  payoffSlope: {
    title: "Payoff Slope",
    subtitle: "Terminal ∂f/∂S at S_0",
    context: "Slope of the terminal payoff curve at today's spot on the live grid.",
    notation: [{ symbol: "f_T", meaning: "Terminal payoff as a function of spot" }],
    icon: Activity,
  },
  signConvention: {
    title: "Sign Convention",
    subtitle: "σ_i = +1 long, σ_i = −1 short",
    context: "Long legs enter sums with +1; short legs enter with −1.",
    notation: [{ symbol: "\\sigma_i", meaning: "Sign multiplier for leg i" }],
    icon: Compass,
  },
  breakeven: {
    title: "Breakeven",
    subtitle: "Zero-crossing spot",
    context: "Spot level(s) where net terminal payoff equals zero.",
    notation: [{ symbol: "S^*", meaning: "Breakeven spot price" }],
    icon: Activity,
  },
  maxProfit: {
    title: "Max Profit",
    subtitle: "Upper payoff bound",
    context: "Maximum terminal profit over the plotted spot range (or asymptotic cap).",
    notation: [{ symbol: "P_{\\max}", meaning: "Maximum profit" }],
    icon: TrendingUp,
  },
  maxLoss: {
    title: "Max Loss",
    subtitle: "Lower payoff bound",
    context: "Maximum terminal loss over the plotted spot range (or asymptotic floor).",
    notation: [{ symbol: "L_{\\max}", meaning: "Maximum loss" }],
    icon: TrendingUp,
  },
};

export const BIAS_STYLES: Record<string, { label: string; tone: string; ring: string; icon: LucideIcon }> = {
  "net-bullish": { label: "Net Bullish", tone: "text-emerald-300", ring: "from-emerald-500/60", icon: TrendingUp },
  "net-bearish": { label: "Net Bearish", tone: "text-rose-300", ring: "from-rose-500/60", icon: TrendingUp },
  "net-neutral": { label: "Net Neutral", tone: "text-ar-gold", ring: "from-ar-gold/60", icon: Compass },
};

export function greekKeyFromName(name: string): GreekKey | null {
  const n = name.toLowerCase();
  if (n.includes("delta")) return "delta";
  if (n.includes("gamma")) return "gamma";
  if (n.includes("theta")) return "theta";
  if (n.includes("vega")) return "vega";
  if (n.includes("rho")) return "rho";
  return null;
}

export function fmtGreekValue(key: string, val: number): string {
  if (key === "gamma" && Math.abs(val) < 0.01) return val.toFixed(5);
  if (Math.abs(val) >= 100) return val.toFixed(1);
  return val.toFixed(3);
}
