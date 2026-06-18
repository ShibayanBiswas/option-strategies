/** Long box condor: payoff chart shows 2 spreads; structure panel lists 4 option legs. */
export function structurePayoffLabels(
  strategyId: string | undefined,
  payoffLabels: string[],
  legCount: number,
): string[] | undefined {
  if (strategyId === "long-box" && legCount === 4) {
    return ["Bear Put Spread", "Bear Put Spread", "Bull Call Spread", "Bull Call Spread"];
  }
  if (payoffLabels.length === legCount) return payoffLabels;
  return undefined;
}

export function payoffChartHighlightIndex(
  strategyId: string | undefined,
  legIndex: number | null,
): number | null {
  if (legIndex === null || strategyId !== "long-box") return legIndex;
  return legIndex <= 1 ? 1 : 0;
}
