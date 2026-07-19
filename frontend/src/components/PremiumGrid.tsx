import { CartesianGrid, ReferenceLine } from "recharts";
import type { ChartThemeTokens } from "../utils/chartTheme";

/** Triple-layer desk grid — gold major + maroon fine + stone minor (SP dashboard recipe). */
export function PremiumGrid({
  theme,
  vertical = true,
  showZero = false,
}: {
  theme: ChartThemeTokens;
  vertical?: boolean;
  showZero?: boolean;
}) {
  return (
    <>
      <CartesianGrid stroke={theme.gridFine} strokeDasharray="3 12" vertical={vertical} horizontal />
      <CartesianGrid stroke={theme.gridMajor} strokeDasharray="1 5" vertical={vertical} horizontal />
      <CartesianGrid stroke={theme.gridMinor} strokeDasharray="6 10" vertical={vertical} horizontal />
      {showZero && <ReferenceLine y={0} stroke={theme.zero} strokeWidth={1.5} />}
    </>
  );
}
