/** Helpers to turn MathBlock equation lists into FormulaDeck records. */

import type { EquationSpec } from "../components/MathBlock";

const LABEL_KEYS: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /breakeven/i, key: "breakeven" },
  { pattern: /max(?:imum)?\s*profit/i, key: "maxProfit" },
  { pattern: /max(?:imum)?\s*loss/i, key: "maxLoss" },
  { pattern: /payoff|terminal|single-leg|multi-leg/i, key: "netPayoff" },
  { pattern: /call.*put|prices/i, key: "bsPrices" },
  { pattern: /d[₁1]|d[₂2]|auxiliary/i, key: "bsAux" },
  { pattern: /moneyness/i, key: "moneyness" },
];

export function equationsToFormulaRecord(
  equations: EquationSpec[],
  keyPrefix = "eq",
): Record<string, EquationSpec> {
  const out: Record<string, EquationSpec> = {};
  equations.forEach((eq, i) => {
    const label = eq.label || "";
    let key = `${keyPrefix}${i}`;
    for (const rule of LABEL_KEYS) {
      if (rule.pattern.test(label)) {
        key = rule.key;
        break;
      }
    }
    let unique = key;
    let n = 2;
    while (out[unique]) {
      unique = `${key}_${n}`;
      n += 1;
    }
    out[unique] = eq;
  });
  return out;
}
