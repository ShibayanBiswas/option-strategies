import {
  capParagraphs,
  buildAdditionalEquations,
  buildPayoffEquationBlock,
} from "./equationMeta.js";
import { applyNotebookDefaults, SPOT_RANGES } from "./notebookDefaults.js";

/**
 * Normalize whitespace in user-facing prose. Parentheses are preserved because
 * they often carry math content, e.g. N(d_1), (1/2), max(S_T - K, 0).
 */
export function cleanProse(s) {
  if (!s) return s;
  return s.replace(/\s+/g, " ").trim();
}

export const COMMON_PARAMS = {
  S0: { key: "S0", label: "Spot S_0", min: 50, max: 200, step: 1 },
  K: { key: "K", label: "Strike K", min: 50, max: 200, step: 1 },
  K1: { key: "K1", label: "Strike K_1", min: 50, max: 200, step: 1 },
  K2: { key: "K2", label: "Strike K_2", min: 50, max: 200, step: 1 },
  K3: { key: "K3", label: "Strike K_3", min: 50, max: 200, step: 1 },
  K4: { key: "K4", label: "Strike K_4", min: 50, max: 200, step: 1 },
  C: { key: "C", label: "Option Premium C", min: 0.5, max: 30, step: 0.5 },
  D: { key: "D", label: "Option Premium D", min: 0.5, max: 30, step: 0.5 },
  H: { key: "H", label: "Net Option Premium H", min: 0, max: 30, step: 0.5 },
  NL: { key: "NL", label: "Long leg qty N_L", min: 1, max: 5, step: 1 },
  NS: { key: "NS", label: "Short leg qty N_S", min: 1, max: 5, step: 1 },
  sigma: { key: "sigma", label: "Implied Vol σ", min: 0.05, max: 0.8, step: 0.001 },
  T: { key: "T", label: "Long Expiry T", min: 0.02, max: 2, step: 0.001 },
  T_short: { key: "T_short", label: "Near Expiry T'", min: 0.02, max: 1.5, step: 0.001 },
};

export const DEFAULTS = {
  S0: 100,
  K: 100,
  K1: 95,
  K2: 105,
  K3: 105,
  K4: 110,
  C: 5,
  D: 5,
  H: 5,
  NL: 2,
  NS: 1,
  sigma: 0.25,
  T: 0.25,
  T_short: 2 / 12,
  r: 0.05,
  spotMin: SPOT_RANGES.standard.spotMin,
  spotMax: SPOT_RANGES.standard.spotMax,
};

export function buildParamSchema(keys) {
  return keys.filter((k) => COMMON_PARAMS[k]).map((k) => COMMON_PARAMS[k]);
}

export function buildDefaultParams(keys, raw = null) {
  const p = {
    S0: DEFAULTS.S0,
    sigma: DEFAULTS.sigma,
    T: DEFAULTS.T,
    r: DEFAULTS.r,
    spotMin: DEFAULTS.spotMin,
    spotMax: DEFAULTS.spotMax,
  };
  keys.forEach((k) => {
    if (DEFAULTS[k] !== undefined) p[k] = DEFAULTS[k];
  });
  if (raw?.id) {
    applyNotebookDefaults(p, raw.id, keys);
  }
  return p;
}

const LAYMAN_GREEK_BASE = {
  delta: {
    title: "Delta — Direction",
    plain:
      "Think of delta as how much your position wins or loses when the underlying moves. Positive delta leans with the market; negative delta leans against it. Stock carries full unit delta; options sit between minus one and plus one depending on moneyness and side.",
    formula: "\\Delta = \\frac{\\partial V}{\\partial S}",
  },
  gamma: {
    title: "Gamma — Acceleration",
    plain:
      "Gamma tells you how quickly delta itself changes. High gamma means a small price move can flip you from mildly bullish to strongly bullish—or the opposite. Long options usually have positive gamma; short options have negative gamma, which is why sudden gaps hurt option sellers.",
    formula: "\\Gamma = \\frac{\\partial \\Delta}{\\partial S}",
  },
  theta: {
    title: "Theta — Time Decay",
    plain:
      "Every day that passes, options lose a little time value unless something else moves in your favour. Theta is that daily bleed. Buyers typically have negative theta—they pay for the chance of a big move. Sellers often have positive theta—they earn income while waiting, but take tail risk.",
    formula: "\\Theta = \\frac{\\partial V}{\\partial t}",
  },
  vega: {
    title: "Vega — Volatility",
    plain:
      "Vega measures how option prices react when implied volatility changes. When the market expects bigger swings, options get more expensive—vega captures that. Even if the stock ends at the same price at expiry, your mark-to-market P/L can move a lot from vol alone before then.",
    formula: "\\nu = \\frac{\\partial V}{\\partial \\sigma}",
  },
  rho: {
    title: "Rho — Interest Rates",
    plain:
      "Rho is how much your option value shifts when interest rates move. For short-dated stock options it is usually the smallest effect, but calls tend to benefit slightly from higher rates and puts the opposite. It completes the full risk picture alongside delta, gamma, theta, and vega.",
    formula: "\\rho = \\frac{\\partial V}{\\partial r}",
  },
};

function strategyGreekTip(key, raw, category, outlook) {
  const name = raw.name;
  const tips = {
    delta: {
      basics: `On ${name}, delta is your main directional dial—watch the live Δ_net badge to see whether you are net long or short the market at current settings.`,
      spreads: `${name} trims raw delta versus a naked option—the spread's long and short legs partially cancel, giving you controlled directional exposure.`,
      volatility: `${name} is often built to be delta-neutral at the start; large moves in either direction change delta quickly—check the profile chart near your body strike.`,
      wings: `${name} keeps delta modest in the centre of the structure; big moves toward the wings shift delta as different legs activate.`,
      "income-hedge": `${name} blends stock delta with option delta—your net number reflects both the share exposure and the hedge or income leg.`,
      synthetic: `${name} uses options to mimic stock-like delta without holding shares; net delta can resemble a long or short stock position with extra curvature.`,
      complex: `${name} has several legs—aggregate delta is the signed sum; click each leg in the structure panel to see who contributes what.`,
    },
    gamma: {
      basics: `A single long option on ${name} has positive gamma—good for catching sharp moves, bad if the stock sits still. Short single options flip that sign.`,
      spreads: `Spreads usually lower gamma versus naked options—that is part of why max loss is capped on ${name}.`,
      volatility: `Long-vol structures like ${name} often carry high gamma near the strike—quiet days hurt, explosive days help. Short-vol is the mirror image.`,
      wings: `${name} concentrates gamma near the body strikes—small spot drifts near the pin can change your hedge needs quickly.`,
      "income-hedge": `On ${name}, gamma comes mainly from the option leg; stock has no gamma. Large moves can reshape your hedge faster than delta alone suggests.`,
      synthetic: `${name} inherits option gamma on top of stock-like delta—watch the chart where strikes overlap.`,
      complex: `Ratio and calendar legs on ${name} can create lopsided gamma—scan the Γ profile to find where convexity spikes.`,
    },
    theta: {
      basics: `${name} as a long option bleeds time each session; as a short option it typically earns theta if the stock cooperates.`,
      spreads: `${name} net theta tells you whether you are paying or collecting time decay after netting both legs.`,
      volatility: `Long ${name} fights theta every day unless vol or spot moves help; short ${name} collects theta but faces gap risk.`,
      wings: `${name} often earns theta near the sweet spot and pays it on the wings—see whether Θ_net is positive at S₀.`,
      "income-hedge": `Income versions of ${name} lean on positive theta from short options; protective versions often pay theta on the long put.`,
      synthetic: `${name} theta reflects net premium paid or received across combo legs.`,
      complex: `Multi-leg ${name} can mix long and short expiry—theta differs by leg; aggregate Θ_net is your daily carry.`,
    },
    vega: {
      basics: `Long ${name} gains if implied vol rises before expiry; short ${name} loses—ν_net shows the size of that bet.`,
      spreads: `${name} usually has smaller vega than a naked option because legs offset.`,
      volatility: `${name} is often a vol trade first—ν_net is as important as delta for pre-expiry P/L.`,
      wings: `${name} vega is muted versus straddles because wings hedge vol exposure.`,
      "income-hedge": `On ${name}, vega comes from the option leg; a vol spike can help or hurt the hedge depending on long vs short options.`,
      synthetic: `${name} vega stacks from each option leg—check ν_net before earnings or vol events.`,
      complex: `Calendar ${name} splits vega across expiries—near leg vs far leg can move differently on vol shocks.`,
    },
    rho: {
      basics: `For ${name}, rho is usually secondary for short-dated trades but appears in the full table for completeness.`,
      spreads: `${name} rho is small relative to delta and theta for typical equity tenors.`,
      volatility: `${name} rho matters more on long-dated legs; still check ρ_net on large books.`,
      wings: `${name} rho is modest—focus on delta, gamma, and theta first unless rates move sharply.`,
      "income-hedge": `${name} rho blends stock and option effects; usually the smallest daily driver.`,
      synthetic: `${name} rho follows the net call/put mix in the combo.`,
      complex: `${name} aggregates rho like other Greeks—signed sum across legs.`,
    },
  };
  const cat = category in tips[key] ? category : "complex";
  if (outlook === "volatility" && key === "vega") {
    return `${name} is sensitive to implied volatility—ν_net shows how much a one-point vol move affects mark-to-market value before expiry.`;
  }
  return tips[key][cat] || tips[key].complex;
}

function buildLaymanGreekBlocks(raw, category, outlook) {
  return ["delta", "gamma", "theta", "vega", "rho"].map((key) => ({
    key,
    title: LAYMAN_GREEK_BASE[key].title,
    plain: LAYMAN_GREEK_BASE[key].plain,
    strategyTip: strategyGreekTip(key, raw, category, outlook),
    formula: LAYMAN_GREEK_BASE[key].formula,
  }));
}

const CATEGORY_MAP = {
  "income-hedge": ["covered-call", "covered-put", "protective-put", "protective-call", "collar"],
  spreads: ["bull-call-spread", "bull-put-spread", "bear-call-spread", "bear-put-spread"],
  synthetic: ["long-combo", "short-combo", "long-box"],
  volatility: [
    "long-straddle", "long-strangle", "long-guts", "short-straddle", "short-strangle", "short-guts",
    "long-call-synthetic-straddle", "long-put-synthetic-straddle", "short-call-synthetic-straddle",
    "short-put-synthetic-straddle", "strap", "strip", "short-iron-butterfly", "short-iron-condor",
    "short-call-condor", "short-put-condor",
  ],
  wings: [
    "long-call-butterfly", "modified-call-butterfly", "long-put-butterfly", "modified-put-butterfly",
    "short-call-butterfly", "short-put-butterfly", "long-iron-butterfly", "short-iron-butterfly",
    "long-call-condor", "long-put-condor", "short-call-condor", "short-put-condor",
    "long-iron-condor", "short-iron-condor",
  ],
  complex: [
    "bull-call-ladder", "bull-put-ladder", "bear-call-ladder", "bear-put-ladder",
    "calendar-call-spread", "calendar-put-spread", "diagonal-call-spread", "diagonal-put-spread",
    "call-ratio-backspread", "put-ratio-backspread", "ratio-call-spread", "ratio-put-spread",
    "covered-short-straddle", "covered-short-strangle",
    "bullish-short-seagull-spread", "bearish-long-seagull-spread", "bearish-short-seagull-spread",
    "bullish-long-seagull-spread",
  ],
  basics: ["long-call", "short-call", "long-put", "short-put"],
};

export function categoryFor(id) {
  for (const [cat, ids] of Object.entries(CATEGORY_MAP)) {
    if (ids.includes(id)) return cat;
  }
  return "complex";
}

const OUTLOOK_PLAIN = {
  bullish: "You expect the stock to rise. The structure is built to earn more when price finishes higher, though time decay and volatility can still move mark-to-market before expiry.",
  bearish: "You expect the stock to fall. Downside moves help the position; sharp rallies may hurt depending on how calls and puts are stacked.",
  "neutral-to-bullish": "You are mildly optimistic: you want stability or a gentle drift higher, often while collecting premium from short options.",
  "neutral-to-bearish": "You lean cautious—comfortable if price slips or stays flat, but not betting on a large rally.",
  neutral: "You expect the stock to stay in a range. Profit often comes from time decay or low realized volatility rather than a one-way move.",
  volatility: "You expect a big move but may not know the direction—or you are trading a view that realized volatility will differ from implied volatility.",
};

const CATEGORY_PLAIN = {
  basics: "This is a single-option building block. Master it before combining legs into spreads and hedges.",
  "income-hedge": "This structure mixes stock and/or options to generate income, cap risk, or insure a portfolio.",
  spreads: "A vertical spread pairs long and short options at different strikes to limit both cost and risk.",
  synthetic: "Options replicate stock-like payoffs without necessarily holding the underlying.",
  volatility: "The trade is primarily about movement or volatility, not just direction.",
  wings: "Butterflies and condors pin profit near chosen strikes and cap loss on the wings.",
  complex: "Multiple expiries or ratios add path dependence—monitor every leg together.",
};

function legTypeName(type) {
  if (type === "stock") return "Stock";
  if (type === "call") return "Call";
  return "Put";
}

/** K1 → K_1, K → K for LaTeX-ready prose */
export function strikeToSymbol(strikeKey) {
  if (!strikeKey) return "";
  if (strikeKey === "K") return "K";
  const m = /^K(\d+)$/.exec(strikeKey);
  if (m) return `K_${m[1]}`;
  return strikeKey;
}

function buildLegRole(leg) {
  const long = leg.side === "long";
  if (leg.type === "stock") {
    return long
      ? "You own the underlying. You participate rupee-for-rupee in price rises and falls."
      : "You are short the underlying. You gain when price falls and lose when it rises.";
  }
  if (leg.type === "call") {
    return long
      ? "You bought upside leverage. You pay premium for the right to buy at the strike."
      : "You sold upside. You collect premium but may have to deliver stock above the strike.";
  }
  return long
    ? "You bought downside protection or bearish exposure. You pay premium for the right to sell at the strike."
    : "You sold downside. You collect premium but may have to buy stock below the strike.";
}

/** Clean leg objects for interactive UI — no × symbols */
export function buildDisplayLegs(rawLegs) {
  return (rawLegs || []).map((l, i) => {
    const isLong = l.side === "long";
    const typeName = legTypeName(l.type);
    const strikeKey = l.strike || null;
    return {
      id: `leg-${i}`,
      index: i,
      direction: isLong ? "Long" : "Short",
      type: l.type,
      typeName,
      strike: strikeKey,
      qty: l.qty,
      title: `${isLong ? "Long" : "Short"} ${typeName}`,
      subtitle: strikeKey ? `Strike ${strikeToSymbol(strikeKey)}` : l.type === "stock" ? "Underlying position" : "",
      role: cleanProse(buildLegRole(l)),
      directionTag: isLong ? "long" : "short",
    };
  });
}

function payoffParagraphs(raw) {
  const isMultiExpiry = raw.id?.includes("calendar") || raw.id?.includes("diagonal");
  if (isMultiExpiry) {
    return [
      "This structure uses two expiries. The live chart plots profit or loss at the near expiry T' when the short leg settles to intrinsic value and the long leg is re-priced with Black–Scholes at remaining time T − T'.",
      "Near T', the best outcome often pins spot near the body strike while time-decay differentials work in your favour—the curve is humped, not a flat vertical spread at long expiry.",
      "Greeks combine live Black–Scholes sensitivities on the long leg with intrinsic delta on the expired short leg at each spot on the grid; adjust T, T', σ, and premium in the sidebar to reshape both curves.",
    ];
  }
  return [
    "At expiration, profit or loss is fixed by the formula below: intrinsic value of every leg minus net premium paid or plus net premium received.",
    raw.breakevenLatex
      ? "Breakeven is where the net curve crosses zero—above or below that spot you make or lose money at expiry."
      : "Scan the payoff chart for zero crossings to locate breakeven zones.",
    raw.maxProfitLatex && raw.maxLossLatex
      ? "Maximum profit and loss are bounded by the spread widths and premium unless a naked short option creates tail risk."
      : "Use the metrics under the chart for numeric max profit, max loss, and P/L at current spot.",
  ];
}

export function buildDirectionalProfile(raw) {
  const biasMap = {
    bullish: "net-bullish with positive delta",
    bearish: "net-bearish with negative delta",
    "neutral-to-bullish": "mildly positive delta",
    "neutral-to-bearish": "mildly negative delta",
    neutral: "near delta-neutral",
    volatility: "vol-driven; spot magnitude matters more than direction",
  };
  const bias = biasMap[raw.outlook] || biasMap.neutral;

  return {
    label: raw.outlook,
    paragraphs: capParagraphs([
      "Net directional exposure at spot S_0 is measured by aggregate delta Δ_net = Σ_{i=1}^{n} σ_i Δ_i, where σ_i = +1 on long legs and σ_i = −1 on short legs. A positive Δ_net means mark-to-market value V rises when S increases by ΔS; a negative Δ_net means V falls when S rises. The live compass below reports Δ_net evaluated at the current sidebar settings for S_0, σ, and T.",
      `For ${raw.name}, the structural outlook is ${raw.outlook.replace(/-/g, " ")}—typically ${bias}. Each call leg contributes Δ_i = N(d_1) before expiry; each put leg contributes Δ_i = N(d_1) − 1; stock contributes Δ = ±1. Summing with signs σ_i yields the blended hedge ratio displayed on the strategy page and traced on the Greek profile chart.`,
      "The first-order mark-to-market identity is ΔP ≈ Δ_net ΔS + (1/2) Γ_net (ΔS)² + ν_net Δσ + Θ_net Δt. The term Δ_net ΔS is linear direction; (1/2) Γ_net (ΔS)² adds convexity when |ΔS| is not small; ν_net Δσ isolates volatility repricing; Θ_net Δt is carry from time decay. This expansion is accurate for small moves before expiration.",
      "At expiration, the terminal payoff f_T(S_T) replaces V and the relevant slope is ∂f_T/∂S|_{S_0} from the payoff grid—this expiry slope need not equal Δ_net because Δ measures pre-expiry sensitivity under Black–Scholes while ∂f_T/∂S measures the piecewise-linear intrinsic profile at T.",
      "Use the live equations below for numeric Δ_net and ∂f_T/∂S|_{S_0} at your parameters. Click any leg in the structure panel to highlight its Δ_i on the profile chart; leg tables list σ_i and Δ_i without contract multipliers so each row is one unit of the stated position.",
    ]),
    latex: {
      netDelta: "\\Delta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Delta_i",
      netGamma: "\\Gamma_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Gamma_i",
      pnlApprox: (
        "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S"
        + " + \\frac{1}{2}\\Gamma_{\\text{net}}(\\Delta S)^2"
        + " + \\nu_{\\text{net}}\\,\\Delta\\sigma + \\Theta_{\\text{net}}\\,\\Delta t"
      ),
      payoffSlope: "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0}",
      signConvention: "\\sigma_i = +1 \\text{ (long)},\\; \\sigma_i = -1 \\text{ (short)}",
    },
  };
}

export function sectionSortKey(section) {
  if (!section) return 9999;
  const parts = String(section).split(".").map(Number);
  return (parts[0] || 0) * 1000 + (parts[1] || 0);
}

/** Four strategy-specific Greek intuition paragraphs — layman-first, detailed */
function buildGreekIntuition(raw, outlook, category) {
  const name = raw.name;
  const legs = raw.legs || [];
  const hasStock = legs.some((l) => l.type === "stock");
  const longOpts = legs.filter((l) => l.side === "long" && l.type !== "stock").length;
  const shortOpts = legs.filter((l) => l.side === "short" && l.type !== "stock").length;
  const id = raw.id || "";

  let p1 = "";
  let p2 = "";

  if (id === "long-box") {
    p1 = `${name} pairs a bull call spread with a bear put spread. At expiry the net payoff is the constant K_1 - K_2 - 2D regardless of spot—delta-neutral by construction.`;
    p2 = `Before expiry, mark-to-market still moves with volatility and time even though terminal payoff is fixed; net delta, gamma, and vega should stay near zero when the structure is built correctly.`;
  } else if (id === "long-call" || id === "long-put") {
    const opt = id === "long-call" ? "call" : "put";
    p1 = `${name} is the simplest options trade: you pay premium upfront for the right to buy or sell at the strike. You are not obligated to exercise—you can let it expire if the move never comes. That limited downside is why the chart shows a flat loss equal to premium on the wrong side of the strike.`;
    p2 = `Delta on ${name} tells you how much mark-to-market value roughly gains or loses per unit move in the underlying today. Long ${opt}s have positive gamma and vega—you benefit from sharp favourable moves and rising volatility—but negative theta, meaning quiet days slowly erode the option unless price helps you.`;
  } else if (id === "short-call" || id === "short-put") {
    const opt = id === "short-call" ? "call" : "put";
    p1 = `${name} means you collect the option premium today and accept obligation if the stock crosses the strike. Your best case is often a slow drift or range—the green zone on the payoff chart shows where you keep the full premium. Your worst case can be large if the market gaps through the strike.`;
    p2 = `Short ${opt}s flip the Greek signs versus the long side: delta points the other way, gamma is negative so adverse moves accelerate losses, vega hurts if vol spikes, and theta is usually positive because time decay works in your favour when the stock stays cooperative.`;
  } else if (category === "income-hedge") {
    p1 = `${name} combines stock with options—think of it as owning the business while renting out upside, buying insurance, or both. The stock leg moves rupee-for-rupee with the share price and has no gamma or vega; the option leg adds curvature, vol sensitivity, and time decay.`;
    p2 = `Net delta blends share exposure with option delta: covered calls often sit mildly bullish but capped; protective puts reduce delta on dips. Theta on income structures is frequently positive when you sell options; protective structures often pay theta on the long put you bought.`;
  } else if (category === "spreads") {
    p1 = `${name} buys one option and sells another at a different strike—like paying for a cheaper ticket with a narrower prize zone. Max loss is usually the net premium paid or the spread width minus the premium received, which is why the payoff chart shows a flat loss floor instead of unlimited risk.`;
    p2 = `Because one leg offsets the other, vega and gamma are smaller than naked options. Delta still tells your directional bias: bull spreads lean positive, bear spreads negative. Check whether net theta is positive—you are collecting time—or negative—you are paying for the spread.`;
  } else if (category === "synthetic") {
    p1 = `${name} uses calls and puts together to mimic holding or shorting stock without tying up as much capital in shares. The combo can look like a stock position on the payoff chart while still behaving like options before expiry.`;
    p2 = `Delta often resembles ±1 near the money but gamma and vega remain from the option legs—so the book is not identical to stock. Watch how delta evolves as spot crosses strikes; vega and theta reflect the net premium paid or collected on entry.`;
  } else if (category === "volatility" || outlook === "volatility") {
    p1 = `${name} is built for movement or volatility—not necessarily direction. You often start near delta-neutral: the stock can go up or down and you still win if the move or vol expansion is large enough. Quiet, range-bound markets typically hurt long-vol structures.`;
    p2 = `Gamma and vega dominate before expiry: gamma peaks near the body strike where delta swings fastest; vega tells you how much a vol crush or spike changes mark-to-market P/L even if the terminal payoff looks unchanged. Short-vol structures flip the signs—positive theta, negative gamma and vega.`;
  } else if (category === "wings") {
    p1 = `${name} shapes a tent or plateau on the payoff chart—profit near chosen strikes, capped loss on the wings. Think of it as betting the stock finishes in a zone while paying for insurance on extreme moves.`;
    p2 = `Delta stays modest near the centre; gamma can spike near body strikes where the tent bends. Vega is usually smaller than a naked straddle because long and short wings partially offset vol exposure. Theta tells you whether you are earning or paying carry at S₀.`;
  } else if (category === "complex") {
    p1 = `${name} stacks ${legs.length} legs—sometimes different expiries or size ratios—so no single Greek tells the whole story. Ladder payoffs use terminal intrinsic at expiry; calendar and diagonal charts use near-expiry Black–Scholes plus intrinsic valuation.`;
    p2 = `Each leg adds signed delta, gamma, vega, and theta. Ratio legs amplify one side of the book. Read aggregate numbers first, then click legs in the structure panel to see who drives each sensitivity on the chart.`;
  } else {
    p1 = `${name} nets ${longOpts} long and ${shortOpts} short option legs${hasStock ? " plus stock" : ""}. Long legs add rights and usually pay theta; short legs collect premium and add obligation. The payoff chart sums every leg after premium.`;
    p2 = `Aggregate Greeks are the signed sum: delta for direction, gamma for how delta shifts, vega for vol, theta for daily decay, rho for rates. Start with Δ_net and Θ_net—they explain most day-to-day P/L for beginners.`;
  }

  return [cleanProse(p1), cleanProse(p2)];
}

export function buildGreeksProfile(raw, outlook, category) {
  const legs = raw.legs || [];
  const legBreakdown = legs.map((l, i) => {
    const dir = l.side === "long" ? "Long" : "Short";
    const name = legTypeName(l.type);
    const strike = l.strike ? ` ${strikeToSymbol(l.strike)}` : "";
    let signPlain = "";
    if (l.type === "stock")
      signPlain =
        "Stock moves one-for-one with price—delta about ±1, no gamma, vega, or theta from the option model. It is pure direction.";
    else if (l.type === "call")
      signPlain =
        l.side === "long"
          ? "Long call: positive delta when in-the-money, positive gamma and vega, negative theta—you pay for upside leverage and vol exposure."
          : "Short call: negative delta, negative gamma and vega, positive theta—you collect premium but face rising losses if the stock rallies hard.";
    else
      signPlain =
        l.side === "long"
          ? "Long put: negative delta when protecting downside, positive gamma and vega, negative theta—insurance that costs a little each day."
          : "Short put: positive delta when out-of-the-money, negative gamma and vega, positive theta—income with obligation to buy if the stock falls.";

    return {
      id: `leg-${i}`,
      label: `${dir} ${name}${strike}`,
      text: cleanProse(signPlain),
      latex:
        l.type === "call"
          ? "\\Delta_{\\text{call}} = N(d_1)"
          : l.type === "put"
            ? "\\Delta_{\\text{put}} = N(d_1) - 1"
            : "\\Delta_{\\text{stock}} = \\pm 1",
    };
  });

  const intuition = capParagraphs(buildGreekIntuition(raw, outlook, category));

  return {
    summary: "Live option sensitivities for each leg and the combined position—explained in plain English and shown as interactive numbers and charts.",
    intuition,
    paragraphs: intuition,
    laymanGreeks: buildLaymanGreekBlocks(raw, category, outlook),
    legBreakdown,
    aggregate:
      "The five tiles above are your whole book summed together at the current spot, volatility, and time to expiry. They explain day-to-day P/L together with the directional compass in the next section.",
  };
}

/** At most five paragraphs per strategy overview section */
export function buildStrategyParagraphs(raw, greeksProfile, category, directionalProfile) {
  const outlookText =
    raw.id === "long-box"
      ? "Terminal profit is locked at K_1 - K_2 - 2D for every spot at expiry—a synthetic loan / arbitrage structure, not a directional range bet."
      : OUTLOOK_PLAIN[raw.outlook] || OUTLOOK_PLAIN.neutral;
  const categoryText = CATEGORY_PLAIN[category] || CATEGORY_PLAIN.complex;
  const legNames = buildDisplayLegs(raw.legs)
    .map((l) => (l.subtitle ? `${l.title} — ${l.subtitle}` : l.title))
    .join("; ");
  const isMultiExpiry = raw.id?.includes("calendar") || raw.id?.includes("diagonal");
  const payoffNote = isMultiExpiry
    ? "This structure uses two expiries; the live chart plots P/L at the near expiry T'—long leg valued with Black–Scholes at T − T' minus short-leg intrinsic minus premium—rather than a single long-dated terminal payoff."
    : raw.id === "long-box"
      ? "At expiration the solid gold line is flat at K_1 - K_2 - 2D; dashed curves show the bull call spread and bear put spread (each paying premium D) that compose the box."
      : "At expiration, profit or loss is fixed by intrinsic value of every leg minus net premium paid or plus net premium received; the breakeven is wherever the solid net curve crosses zero, and the green shaded region on the chart marks spots where you finish above that line.";

  const legCount = (raw.legs || []).length;
  const legWord = legCount === 1 ? "1 leg" : `${legCount} legs`;
  const structureNote =
    raw.id === "long-box"
      ? `How the position fits together: you combine ${legWord}—${legNames || "see the structure panel"}. On the payoff chart, dashed curves are the bull call spread and bear put spread (premium D each); the solid gold line is the locked long box condor payoff at K_1 - K_2 - 2D. Click any leg card to highlight its contribution on both payoff and Greek charts.`
      : `How the position fits together: you combine ${legWord}—${legNames || "see the structure panel"}. Long legs pay premium or cash to acquire rights; short legs collect premium and accept obligations if the market moves against you. Each leg appears as a dashed coloured curve on the payoff chart, while the solid gold line sums them after entry premium. Click any leg card to highlight its contribution on both payoff and Greek charts.`;

  return capParagraphs([
    cleanProse(
      `${raw.description} In plain terms: ${outlookText} This trade sits in the ${category.replace("-", " ")} family as a ${(raw.riskType || "multi-leg").replace("-", " ")} structure. ${categoryText} The sections below follow the same monograph layout as the introduction—interactive charts you can stress-test from the sidebar.`
    ),
    cleanProse(structureNote),
    cleanProse(
      raw.risk
        ? `Risk in plain language: ${raw.risk}. Before expiry, gaps and volatility spikes can hurt even when your directional view eventually proves correct, because mark-to-market P/L moves with delta, gamma, and vega along the way. Always locate short strikes on the chart, identify tail exposure, and compare max loss under the chart with the worst region on the payoff curve.`
        : "Risk depends on net premium, strike placement, and whether you are net long or short options. Spreads usually cap both profit and loss; naked short options can carry substantial tail risk that does not show up in a calm week but appears quickly on a gap. Use the metrics row under the payoff chart for numeric max profit, max loss, breakevens, and P/L at current spot."
    ),
    cleanProse(
      `${payoffNote} Hover the payoff chart for rupee values at any spot; the legend identifies every series. Default parameters and spot-axis limits are tuned for each strategy. ${raw.breakevenLatex ? "Formal breakeven identities appear in section §5 with notation grids." : "Scan zero crossings on the chart if no single breakeven formula is listed."}`
    ),
    cleanProse(
      "Use the parameter panel as a laboratory: move spot, strikes, volatility, and time while watching breakevens, max profit and loss, Greeks, and highlighted legs update instantly. Section §3 explains sensitivities with live tiles and curves; section §4 covers net directional movement with typeset identities. Each section is capped at five paragraphs; every equation includes symbol definitions."
    ),
  ].map(cleanProse));
}

export { buildPayoffEquationBlock, buildAdditionalEquations, capParagraphs };

export const categories = [
  { id: "income-hedge", name: "Income & Hedging", icon: "Shield" },
  { id: "spreads", name: "Vertical Spreads", icon: "TrendingUp" },
  { id: "synthetic", name: "Synthetic & Combo", icon: "GitBranch" },
  { id: "volatility", name: "Volatility Plays", icon: "Activity" },
  { id: "wings", name: "Butterflies & Condors", icon: "Layers" },
  { id: "complex", name: "Ladders & Advanced", icon: "Zap" },
];
