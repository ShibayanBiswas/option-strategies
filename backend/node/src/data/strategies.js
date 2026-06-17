import { INTRO_NOTATION } from "./introData.js";
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
    notation: INTRO_NOTATION,
    payoffEquationBlock: buildPayoffEquationBlock(raw),
    additionalEquations: buildAdditionalEquations(raw),
  };
}

export const strategies = rawStrategies.map(enrich).sort((a, b) => sectionSortKey(a.section) - sectionSortKey(b.section));
export const chapterStrategies = strategies.filter((s) => s.section !== "2.1");
