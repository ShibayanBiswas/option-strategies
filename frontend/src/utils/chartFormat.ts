/** Compact axis & tooltip formatters — financial terminal style */

export const CHART_MARGIN = { top: 8, right: 16, left: 8, bottom: 8 };

export function formatSpotTick(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return Number.isInteger(v) ? String(Math.round(v)) : v.toFixed(0);
}

export function formatPnLTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1000) return `${v < 0 ? "−" : ""}${(abs / 1000).toFixed(1)}k`;
  if (abs === 0) return "0";
  return v < 0 ? `−${abs.toFixed(0)}` : abs.toFixed(0);
}

export function formatGreekTick(v: number, greek: string): string {
  const abs = Math.abs(v);
  if (greek === "gamma" && abs < 0.01 && abs > 0) return v.toExponential(1);
  if (abs >= 100) return v.toFixed(0);
  if (abs >= 10) return v.toFixed(1);
  if (abs >= 1) return v.toFixed(2);
  return v.toFixed(3);
}

export function formatCurrencyFull(v: number): string {
  const sign = v < 0 ? "−" : "+";
  return `${sign}$${Math.abs(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Strip qty markers; keep K_1-style tokens for ProseMath rendering. */
export function formatLegLabel(label: string): string {
  return label
    .replace(/×\d+(\.\d+)?/g, "")
    .replace(/\bx\d+(\.\d+)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Full label for charts — never truncate math tokens mid-subscript. */
export function chartSeriesLabel(label: string, max = 28): string {
  const clean = formatLegLabel(label.replace(/^Component:\s*/i, "").trim());
  if (clean.length <= max) return clean;
  const strike = clean.match(/(K_[1-4]|K)\s*$/);
  if (strike) {
    const head = clean.slice(0, max - strike[0].length - 1).trimEnd();
    return `${head}… ${strike[0]}`;
  }
  return `${clean.slice(0, max - 1)}…`;
}

/** @deprecated Use chartSeriesLabel — kept for callers that need plain truncation. */
export function shortenLabel(label: string, max = 28): string {
  return chartSeriesLabel(label, max);
}

export function computeNiceTicks(min: number, max: number, count: number): number[] {
  if (min === max) return [min];
  const range = max - min;
  const step = range / Math.max(count - 1, 1);
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) ticks.push(min + step * i);
  return ticks;
}
