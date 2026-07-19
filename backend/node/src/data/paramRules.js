/**
 * Strike-order constraints so slider combinations stay structurally valid.
 * Payoff math always runs; this keeps K ordering aligned with each strategy's definition.
 */

const GAP = 1;

/** @type {Record<string, Array<[string, '<' | '>', string]>>} */
const ORDER_RULES = {
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
  "collar": [["K1", "<", "K2"]],
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

function applyRule(values, left, op, right) {
  const a = values[left];
  const b = values[right];
  if (a == null || b == null) return;

  if (op === "<") {
    if (a >= b) values[right] = a + GAP;
  } else if (a <= b) {
    values[right] = a - GAP;
  }
}

/** Enforce structural strike ordering after a slider move (mutates copy). */
export function constrainParams(strategyId, values, _changedKey) {
  const rules = ORDER_RULES[strategyId];
  if (!rules) return { ...values };

  const out = { ...values };
  for (let pass = 0; pass < 4; pass += 1) {
    for (const [left, op, right] of rules) {
      applyRule(out, left, op, right);
    }
  }
  return out;
}

export function hasParamRules(strategyId) {
  return Boolean(ORDER_RULES[strategyId]);
}
