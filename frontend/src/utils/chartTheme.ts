/** Shared Recharts styling — Anand Rathi SP desk palette */

export type ChartThemeTokens = {
  gridFine: string;
  gridMajor: string;
  gridMinor: string;
  axisLine: string;
  tick: string;
  cursor: string;
  zero: string;
  spot: string;
  profit: string;
  loss: string;
  breakeven: string;
  netStroke: string;
};

export const chartThemeLight: ChartThemeTokens = {
  gridFine: "rgba(122, 30, 44, 0.1)",
  gridMajor: "rgba(212, 178, 76, 0.35)",
  gridMinor: "rgba(120, 113, 108, 0.1)",
  axisLine: "rgba(120, 113, 108, 0.35)",
  tick: "#57534e",
  cursor: "rgba(212, 178, 76, 0.45)",
  zero: "rgba(120, 113, 108, 0.55)",
  spot: "#d4b24c",
  profit: "#16a34a",
  loss: "#c2410c",
  breakeven: "#d4b24c",
  netStroke: "#d4b24c",
};

export const chartThemeDark: ChartThemeTokens = {
  gridFine: "rgba(212, 178, 76, 0.06)",
  gridMajor: "rgba(212, 178, 76, 0.22)",
  gridMinor: "rgba(80, 70, 60, 0.16)",
  axisLine: "rgba(212, 178, 76, 0.32)",
  tick: "#faf8f5",
  cursor: "rgba(255, 217, 90, 0.45)",
  zero: "rgba(212, 178, 76, 0.35)",
  spot: "#ffd95a",
  profit: "#6ee7a8",
  loss: "#e8a04a",
  breakeven: "#d4b24c",
  netStroke: "#ffd95a",
};

export function getChartTheme(isDark: boolean): ChartThemeTokens {
  return isDark ? chartThemeDark : chartThemeLight;
}
