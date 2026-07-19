/** Client-side strike ordering — mirrors backend/node/src/data/paramRules.js */

/** Nifty-scale strikes use 50-pt gaps; textbook scales keep gap 1. */
function strikeGap(values: Record<string, number>): number {
  const s0 = Number(values.S0);
  if (Number.isFinite(s0) && s0 > 1000) return 50;
  return 1;
}

type Rule = [string, "<" | ">", string];

const ORDER_RULES: Record<string, Rule[]> = {
  "bull-call-spread": [["K1", "<", "K2"]],
  "bull-put-spread": [["K1", "<", "K2"]],
  "bear-call-spread": [["K1", ">", "K2"]],
  "bear-put-spread": [["K1", ">", "K2"]],
  "long-combo": [["K1", ">", "K2"]],
  "short-combo": [["K2", ">", "K1"]],
  "long-strangle": [["K1", "<", "K2"]],
  "short-strangle": [["K1", "<", "K2"]],
  "long-guts": [["K1", "<", "K2"]],
  "short-guts": [["K1", "<", "K2"]],
  "long-box": [["K1", ">", "K2"]],
  collar: [["K1", "<", "K2"]],
  "bull-call-ladder": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "bear-call-ladder": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "bear-put-ladder": [
    ["K1", ">", "K2"],
    ["K2", ">", "K3"],
  ],
  "bull-put-ladder": [
    ["K1", ">", "K2"],
    ["K2", ">", "K3"],
  ],
  "diagonal-call-spread": [["K1", "<", "K2"]],
  "diagonal-put-spread": [["K1", ">", "K2"]],
  "call-ratio-backspread": [["K1", "<", "K2"]],
  "put-ratio-backspread": [["K1", "<", "K2"]],
  "ratio-call-spread": [["K1", "<", "K2"]],
  "ratio-put-spread": [["K1", "<", "K2"]],
  "long-call-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "long-put-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "modified-call-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "modified-put-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "short-call-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "short-put-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "long-iron-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "short-iron-butterfly": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "long-call-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "long-put-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "short-call-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "short-put-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "long-iron-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "short-iron-condor": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
    ["K3", "<", "K4"],
  ],
  "covered-short-strangle": [["K2", "<", "K1"]],
  "bullish-long-seagull-spread": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "bullish-short-seagull-spread": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "bearish-long-seagull-spread": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
  "bearish-short-seagull-spread": [
    ["K1", "<", "K2"],
    ["K2", "<", "K3"],
  ],
};

function applyRule(
  values: Record<string, number>,
  left: string,
  op: "<" | ">",
  right: string,
  gap: number,
) {
  const a = values[left];
  const b = values[right];
  if (a == null || b == null) return;
  if (op === "<" && a >= b) values[right] = a + gap;
  if (op === ">" && a <= b) values[right] = a - gap;
}

export function constrainParams(
  strategyId: string | undefined,
  values: Record<string, number>,
): Record<string, number> {
  const rules = strategyId ? ORDER_RULES[strategyId] : undefined;
  if (!rules) return { ...values };

  const out = { ...values };
  const gap = strikeGap(out);
  for (let pass = 0; pass < 4; pass += 1) {
    for (const [left, op, right] of rules) {
      applyRule(out, left, op, right, gap);
    }
  }
  return out;
}

export function hasStrikeRules(strategyId: string | undefined): boolean {
  return Boolean(strategyId && ORDER_RULES[strategyId]);
}
