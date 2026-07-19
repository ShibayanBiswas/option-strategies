import {
  buildAdditionalEquations,
  buildPayoffEquationBlock,
} from "./equationMeta.js";
import { rawStrategies } from "./strategyBase.js";
import { applyPaperIdentities } from "./paperIdentities.js";
import { conditionsFor } from "./strategyConditions.js";
import {
  buildDefaultParams,
  buildParamSchema,
  buildDirectionalProfile,
  buildDisplayLegs,
  buildGreeksProfile,
  buildStrategyParagraphs,
  categories,
  categoryFor,
  cleanProse,
  sectionSortKey,
} from "./catalogHelpers.js";
export { categories } from "./catalogHelpers.js";
export { optionsIntro, greeksIntro, basicOptions } from "./introData.js";

/** All strategies with Python leg definitions — live payoffs enabled */
export const COMPUTABLE_IDS = new Set([
  "long-call", "short-call", "long-put", "short-put",
  ...rawStrategies.filter((s) => s.section !== "2.1").map((s) => s.id),
]);

const STRIKE_ORDINAL = { K1: "First", K2: "Second", K3: "Third", K4: "Fourth" };

/** Symbol reference limited to the symbols this specific strategy actually uses. */
function buildStrategyNotation(raw, paramKeys) {
  const keys = new Set(paramKeys || []);
  const legs = raw.legs || [];

  const strikeKeys = new Set();
  for (const l of legs) if (l.strike) strikeKeys.add(l.strike);
  for (const k of keys) if (/^K[1-4]?$/.test(k)) strikeKeys.add(k);

  const notation = [
    { symbol: "S_0", meaning: "Spot price at entry (today's price)" },
    { symbol: "S_T", meaning: "Spot price at expiration" },
  ];

  const ordered = ["K", "K1", "K2", "K3", "K4"].filter((k) => strikeKeys.has(k));
  if (ordered.length === 1 && ordered[0] === "K") {
    notation.push({ symbol: "K", meaning: "Strike price of the option" });
  } else {
    for (const k of ordered) {
      const sym = k === "K" ? "K" : `K_${k.slice(1)}`;
      notation.push({ symbol: sym, meaning: `${STRIKE_ORDINAL[k] || ""} strike price`.trim() });
    }
  }

  notation.push({ symbol: "T", meaning: "Time to expiration in years" });
  if (keys.has("T_short")) notation.push({ symbol: "T'", meaning: "Near expiry of the short leg" });

  const hasStock = legs.some((l) => l.type === "stock");
  if (hasStock) notation.push({ symbol: "S", meaning: "Underlying share position" });

  if (keys.has("D")) notation.push({ symbol: "D", meaning: "Net option premium paid at entry" });
  if (keys.has("C")) notation.push({ symbol: "C", meaning: "Net option premium received at entry" });
  if (keys.has("H")) notation.push({ symbol: "H", meaning: "Net option premium across the structure" });
  if (keys.has("NL")) notation.push({ symbol: "N_L", meaning: "Number of long contracts" });
  if (keys.has("NS")) notation.push({ symbol: "N_S", meaning: "Number of short contracts" });

  notation.push({ symbol: "f_T", meaning: "Terminal profit or loss at expiry" });
  if (legs.some((l) => l.type === "call" || l.type === "put")) {
    notation.push({ symbol: "(x)^+", meaning: "Positive part — max(x, 0)" });
  }
  if (legs.length > 1) {
    notation.push({ symbol: "\\sigma_i", meaning: "Leg sign: +1 long, −1 short" });
  }

  return notation;
}

function enrich(rawInput) {
  const raw = applyPaperIdentities(rawInput);
  const paramKeys = raw.paramKeys || ["S0", "K", "D"];
  const category = categoryFor(raw.id);
  const legs = buildDisplayLegs(raw.legs);
  const greeksProfile = buildGreeksProfile(raw, raw.outlook, category);
  const directionalProfile = buildDirectionalProfile(raw);
  const paragraphs = buildStrategyParagraphs(raw, greeksProfile, category, directionalProfile);

  return {
    id: raw.id,
    name: raw.name,
    section: raw.section,
    category,
    outlook: raw.outlook,
    risk: raw.risk,
    riskType: raw.riskType,
    hasPayoff: COMPUTABLE_IDS.has(raw.id),
    isApproximate: raw.payoffLatex == null,
    description: cleanProse(raw.description),
    paragraphs,
    legs,
    payoffLatex: raw.payoffLatex,
    breakevenLatex: raw.breakevenLatex,
    maxProfitLatex: raw.maxProfitLatex,
    maxLossLatex: raw.maxLossLatex,
    conditions: conditionsFor(raw.id),
    greeksProfile,
    directionalProfile,
    defaultParams: buildDefaultParams(paramKeys, raw),
    paramSchema: buildParamSchema(paramKeys),
    notation: buildStrategyNotation(raw, paramKeys),
    payoffEquationBlock: buildPayoffEquationBlock(raw),
    additionalEquations: buildAdditionalEquations(raw),
  };
}

export const strategies = rawStrategies.map(enrich).sort((a, b) => sectionSortKey(a.section) - sectionSortKey(b.section));
export const chapterStrategies = strategies.filter((s) => s.section !== "2.1");
