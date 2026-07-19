/** Introduction content — proprietary analytics platform copy */
import { rawStrategies } from "./strategyBase.js";
import {
  buildDirectionalProfile,
  buildGreeksProfile,
  buildStrategyParagraphs,
  categoryFor,
  cleanProse,
} from "./catalogHelpers.js";
import {
  capParagraphs,
  CORE_NOTATION,
  GREEK_NOTATION,
  greekFormulaMeta,
  INTRO_BS_EQUATIONS,
  INTRO_MATH_EQUATIONS,
  INTRO_MONEYNESS_EQUATIONS,
} from "./equationMeta.js";
import { NOTEBOOK_BY_ID } from "./notebookDefaults.js";

export const INTRO_NOTATION = [
  { symbol: "S_0", meaning: "Spot price at entry" },
  { symbol: "S_T", meaning: "Spot price at expiration" },
  { symbol: "K", meaning: "Strike price" },
  { symbol: "T", meaning: "Time to expiration in years" },
  { symbol: "D", meaning: "Net option premium paid at entry" },
  { symbol: "C", meaning: "Net option premium received at entry" },
  { symbol: "f_T", meaning: "Terminal profit or loss at expiry" },
  { symbol: "V", meaning: "Option mark-to-market value before expiry" },
  { symbol: "V^{\\text{intr}}", meaning: "Intrinsic value at current spot" },
  { symbol: "V^{\\text{time}}", meaning: "Time value remaining in the premium" },
];

export const optionsIntro = {
  title: "Options Foundations",
  subtitle: "Quantitative Strategy Analytics — Technical Monograph",
  abstract:
    "This monograph introduces European-style equity options, moneyness classification, terminal payoffs, and live sensitivity analysis in a single consistent layout used on every strategy page. Prose is set in a clean sans-serif with justified paragraphs; formal notation is compact and collapsed where possible. All structures are explored through parameter-driven charts with component leg decomposition, green profit shading above zero, and plain-English Greek guides before optional formulas.",
  paragraphs: capParagraphs([
    "Welcome to the Options Strategy Analytics Platform—a complete workspace for exploring how single and multi-leg option structures behave at expiration and before it. Every strategy page mirrors this introduction: numbered sections (at most five paragraphs each), interactive payoff charts with green profit zones, and Greek panels with notation grids beside every equation.",
    "An option is a contract giving the holder the right, without obligation, to buy or sell an underlying at strike K by expiry T. Calls gain when S_T > K; puts gain when S_T < K. Premium D or C at entry shifts the entire payoff curve, which is why the solid net line always includes that entry cost.",
    "Moneyness classifies where S sits relative to K: in-the-money options carry positive intrinsic value, at-the-money options sit near K where Γ and Θ are often largest, and out-of-the-money options hold mostly time value. The vocabulary ITM, ATM, OTM recurs on every strategy page because it drives payoff shape and which Greeks dominate.",
    "Payoff diagrams plot each leg as a dashed curve and net f_T as a solid line with green shading where f_T > 0. Greek charts map Δ, Γ, ν, Θ, and ρ—aggregate and by leg—computed live across a spot grid. Default parameters are tuned so beginners usually see part of the chart above zero on first load.",
    "Proceed through moneyness below, the single-leg laboratory, the strategy catalog, and the Greek carousel. Each monograph repeats the same section layout; every displayed equation includes a notation grid explaining each symbol.",
  ]),
  math: {
    title: "Definition 1.1 — Terminal Payoffs",
    context:
      "At expiration T, option value equals intrinsic value. Net strategy f_T subtracts the premium D paid or adds the premium C received at entry.",
    notation: CORE_NOTATION,
    equations: INTRO_MATH_EQUATIONS,
  },
  moneyness: {
    title: "Definition 1.2 — Moneyness Classification",
    paragraphs: capParagraphs([
      "Moneyness is where S sits relative to K. For a call, ITM means S > K; for a put, ITM means S < K. ATM means S ≈ K, where Δ often sits near ±0.5 and Γ peaks before expiry.",
      "Before expiration, V = V^{intr} + V^{time}: intrinsic is the exercise value now; time value is extrinsic premium for future movement. OTM options have V^{intr} = 0 but may still cost premium because σ and T remain.",
      "ATM options near expiry concentrate Γ and |Θ| because Δ swings rapidly as S crosses K. Deep ITM contracts behave like stock with |Δ| → 1; deep OTM weeklies carry little ν because extrinsic value is small.",
      "Strategy design maps to moneyness: income trades sell OTM options; protective structures buy OTM or ATM puts; spreads pair strikes in different moneyness zones to cap cost and risk.",
      "Use the table and cards below, then the laboratory: move S across ITM, ATM, and OTM and watch payoff shading and Greeks respond.",
    ]),
    table: [
      { instrument: "Call", itm: "S > K", atm: "S ≈ K", otm: "S < K" },
      { instrument: "Put", itm: "S < K", atm: "S ≈ K", otm: "S > K" },
    ],
    cards: [
      {
        label: "In-The-Money",
        abbr: "ITM",
        callDef: "S > K — positive call intrinsic value, the excess of spot over strike",
        putDef: "S < K — positive put intrinsic value, the excess of strike over spot",
        tone: "itm",
      },
      {
        label: "At-The-Money",
        abbr: "ATM",
        callDef: "S ≈ K — delta near 0.5; gamma peaks",
        putDef: "S ≈ K — delta near −0.5; gamma peaks",
        tone: "atm",
      },
      {
        label: "Out-Of-The-Money",
        abbr: "OTM",
        callDef: "S < K — no intrinsic; pure time value",
        putDef: "S > K — no intrinsic; pure time value",
        tone: "otm",
      },
    ],
    equations: INTRO_MONEYNESS_EQUATIONS,
  },
  labNote:
    "Interactive laboratory below: dashed curves show leg payoffs; solid curves show net profit or loss including premium. Adjust parameters to traverse ITM, ATM, and OTM regions.",
};

function basicOptionEntry(id, direction, greeksText) {
  const raw = rawStrategies.find((s) => s.id === id);
  const nb = NOTEBOOK_BY_ID[id] || {};
  return {
    id: raw.id,
    name: raw.name,
    direction,
    description: cleanProse(raw.description),
    payoffLatex: raw.payoffLatex,
    breakevenLatex: raw.breakevenLatex,
    greeksText,
    defaultParams: {
      sigma: 0.25,
      T: 0.25,
      r: 0.05,
      ...nb,
    },
    paramSchema: [
      { key: "S0", label: "Spot S_0", min: 50, max: 200, step: 1 },
      { key: "K", label: "Strike K", min: 50, max: 200, step: 1 },
      {
        key: id.includes("short") ? "C" : "D",
        label: id.includes("short") ? "Premium C" : "Premium D",
        min: 0.5,
        max: 25,
        step: 0.5,
      },
      { key: "sigma", label: "Volatility σ", min: 0.05, max: 0.8, step: 0.01 },
      { key: "T", label: "Time To Expiry T", min: 0.02, max: 2, step: 0.01 },
    ],
  };
}

export const basicOptions = [
  basicOptionEntry("long-call", "Long", "Long call: you pay premium for the right to buy at the strike. Profit grows when the stock rises above the strike plus what you paid; worst case is losing the premium if the stock stays below."),
  basicOptionEntry("short-call", "Short", "Short call: you collect premium and accept obligation if the stock rallies above the strike. You keep the premium if the stock stays below; losses grow if the rally continues."),
  basicOptionEntry("long-put", "Long", "Long put: you pay premium for the right to sell at the strike—insurance against a drop. Profit rises as the stock falls below the strike minus premium."),
  basicOptionEntry("short-put", "Short", "Short put: you collect premium and may have to buy stock if price falls below the strike. You earn theta when the stock holds above the strike."),
];

export const greeksIntro = {
  title: "Option Greeks",
  subtitle: "Live sensitivity analysis for every strategy",
  notation: GREEK_NOTATION,
  paragraphs: capParagraphs([
    "The Greeks are partial derivatives of portfolio value V with respect to market inputs: Δ = ∂V/∂S measures spot direction, Γ = ∂²V/∂S² measures convexity in S, Θ = ∂V/∂t measures carry from the passage of time, ν = ∂V/∂σ measures exposure to implied volatility σ, and ρ = ∂V/∂r measures rate sensitivity. For a European call priced under Black–Scholes, Δ_call = N(d_1) and for a put Δ_put = N(d_1) − 1; deep in-the-money contracts have |Δ| → 1 while out-of-the-money contracts have |Δ| → 0 as S moves away from K.",
    "For an n-leg book, net sensitivities aggregate with the sign convention σ_i = +1 on long legs and σ_i = −1 on short legs: Δ_net = Σ_{i=1}^{n} σ_i Δ_i, Γ_net = Σ_{i=1}^{n} σ_i Γ_i, Θ_net = Σ_{i=1}^{n} σ_i Θ_i, ν_net = Σ_{i=1}^{n} σ_i ν_i, and ρ_net = Σ_{i=1}^{n} σ_i ρ_i. Each leg contributes its own Greek at the current spot S_0, volatility σ, and time T shown in the parameter panel; the platform evaluates these identities on a spot grid and reports both scalars at S_0 and full sensitivity curves.",
    "Before expiration, a second-order Taylor expansion in ΔS, Δσ, and Δt gives the mark-to-market approximation ΔP ≈ Δ_net ΔS + (1/2) Γ_net (ΔS)² + ν_net Δσ + Θ_net Δt. The linear term Δ_net ΔS is the directional piece; the quadratic term (1/2) Γ_net (ΔS)² captures convexity from long or short gamma; ν_net Δσ isolates repricing from volatility alone; Θ_net Δt is the daily bleed or carry while S and σ are held fixed. At expiration T, only the terminal payoff f_T(S_T) matters and the live slope ∂f_T/∂S|_{S_0} describes expiry directionality rather than the hedge ratio Δ_net.",
    "Moneyness and time reshape each Greek: at-the-money options near expiry concentrate Γ and |Θ| because Δ swings rapidly as S crosses K; deep in-the-money calls have Δ ≈ +1 and behave like stock with negligible ν; deep out-of-the-money weeklies carry little ν because extrinsic value is small. Calendar and diagonal structures mix expiries T and T' so Θ_net and ν_net differ leg-by-leg; ladder and spread structures superpose intrinsic payoffs max(S − K, 0) or max(K − S, 0) at a single T, producing piecewise-linear f_T with kinks at each strike.",
    "Definition 4.1 states European call and put values C and P; the carousel below expands each Greek with its defining derivative and notation grid. Every strategy monograph repeats the same layout—live tiles at S_0, leg tables, and profile charts. Read Δ_net and Θ_net first on quiet sessions; add Γ_net before gap risk and ν_net before vol events.",
  ]),
  bsEquations: INTRO_BS_EQUATIONS,
  directionalLatex: {
    netDelta: "\\Delta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Delta_i",
    netGamma: "\\Gamma_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Gamma_i",
    netTheta: "\\Theta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Theta_i",
    netVega: "\\nu_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\nu_i",
    pnlApprox: "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S + \\frac{1}{2}\\Gamma_{\\text{net}}(\\Delta S)^2 + \\nu_{\\text{net}}\\,\\Delta\\sigma + \\Theta_{\\text{net}}\\,\\Delta t",
    payoffSlope: "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0}",
    signConvention: "\\sigma_i = +1 \\text{ (long)},\\; \\sigma_i = -1 \\text{ (short)}",
  },
  greeks: [
    {
      symbol: "\\Delta",
      name: "Delta",
      formula: "\\Delta = \\frac{\\partial V}{\\partial S}",
      formulaContext: "First partial derivative of option value with respect to spot S.",
      formulaNotation: [
        { symbol: "V", meaning: "Option or portfolio value" },
        { symbol: "S", meaning: "Underlying spot price" },
      ],
      paragraphs: capParagraphs([
        "Delta is the easiest Greek to start with: it answers how much your option position gains or loses when the stock moves one dollar. If delta is +0.50, a one-dollar rise in the stock adds about fifty cents to your position value, and a one-dollar fall subtracts about fifty cents.",
        "Call deltas run from 0 to +1—deep out-of-the-money calls near zero, deep in-the-money calls near +1. Put deltas run from −1 to 0. Owning 100 shares is like delta +100; a long call might behave like owning 50 shares when delta is 0.50.",
        "Market makers use delta to hedge—they buy or sell stock to stay neutral. As a retail trader, delta tells you whether you are effectively long or short the market at this moment, before expiry.",
        "Delta is not fixed: it changes as the stock moves and as time passes. That change is measured by gamma. Near expiry, at-the-money options have deltas that swing quickly—why weeklies feel jumpy.",
        "On every strategy page, leg deltas sum to Δ_net. Click a leg to see its piece of the total highlighted on the live chart.",
      ]),
      callProfile: "\\Delta_{\\text{call}} = N(d_1)",
      putProfile: "\\Delta_{\\text{put}} = N(d_1) - 1",
    },
    {
      symbol: "\\Gamma",
      name: "Gamma",
      formula: "\\Gamma = \\frac{\\partial^2 V}{\\partial S^2} = \\frac{\\partial \\Delta}{\\partial S}",
      formulaContext: greekFormulaMeta("Gamma").context,
      formulaNotation: greekFormulaMeta("Gamma").notation,
      paragraphs: capParagraphs([
        "Gamma is the rate at which delta itself changes when the stock moves—it measures convexity or acceleration in your position. If delta tells you the speed of profit and loss today, gamma tells you how quickly that speed will increase or decrease on the next tick. Long options typically carry positive gamma, which helps on sharp favourable moves but hurts on sharp reversals after a run.",
        "Short options flip the sign: negative gamma means adverse moves hurt increasingly quickly, which is why naked short calls or puts can feel manageable until a gap blows through the strike. Market makers who are short options must buy stock into rallies and sell into selloffs to stay hedged—that rebalancing is gamma in action.",
        "Gamma peaks at-the-money and near expiry, exactly where delta swings fastest. That is why weeklies and earnings trades feel jumpy: a small spot move can reclassify an option from out-of-the-money to in-the-money and shift delta by tens of percentage points in a session.",
        "Butterflies and condors can show modest net delta yet meaningful gamma near the body strike—the position looks quiet until spot drifts into the pin zone. Comparing Γ_net on the live chart with the payoff tent shows where convexity concentrates before you hold through a volatile week.",
        "Use the profile chart below to plot gamma versus spot for the whole book and each leg. Dashed leg lines show who contributes convexity; the solid aggregate line shows whether you are net long or short acceleration at S_0.",
      ]),
      callProfile: "\\Gamma_{\\text{call}} = \\dfrac{N'(d_1)}{S\\,\\sigma\\sqrt{T}}",
      putProfile: "\\Gamma_{\\text{put}} = \\dfrac{N'(d_1)}{S\\,\\sigma\\sqrt{T}}",
    },
    {
      symbol: "\\Theta",
      name: "Theta",
      formula: "\\Theta = \\frac{\\partial V}{\\partial t}",
      formulaContext: greekFormulaMeta("Theta").context,
      formulaNotation: greekFormulaMeta("Theta").notation,
      paragraphs: capParagraphs([
        "Theta is time decay—the amount of option value that bleeds away each day if spot, volatility, and rates stay unchanged. It is the carry you pay as a buyer or collect as a seller while waiting for your thesis to play out. Quiet sessions often show up first in theta rather than delta when nothing much happens to the stock.",
        "Option buyers usually fight negative theta: you need movement or vol expansion to offset the daily erosion of premium. Sellers earn positive theta on cooperative days but accept obligation if the market breaks out. Covered calls and short puts are classic positive-theta income structures when spot stays above or below the short strike.",
        "Decay is not linear—it accelerates into expiration, especially for at-the-money contracts. The last week of a short-dated option can dominate total theta, which is why traders roll or close positions before expiry rather than assuming a smooth daily bleed.",
        "Theta trades off with vega on many structures: selling premium wins on calm, range-bound weeks but loses quickly if implied volatility spikes or the underlying trends hard. Reading Θ_net alongside ν_net tells you whether you are paid to wait or paying for lottery tickets.",
        "On income trades, compare Θ_net with max loss on the payoff chart—that is the daily carry you earn for accepting tail risk. On long-vol trades, negative theta is the cost of keeping convexity and vega alive until the move arrives.",
      ]),
      callProfile:
        "\\Theta_{\\text{call}} = -\\dfrac{S\\,N'(d_1)\\,\\sigma}{2\\sqrt{T}} - r K e^{-rT} N(d_2)",
      putProfile:
        "\\Theta_{\\text{put}} = -\\dfrac{S\\,N'(d_1)\\,\\sigma}{2\\sqrt{T}} + r K e^{-rT} N(-d_2)",
    },
    {
      symbol: "\\nu",
      name: "Vega",
      formula: "\\nu = \\frac{\\partial V}{\\partial \\sigma}",
      formulaContext: greekFormulaMeta("Vega").context,
      formulaNotation: greekFormulaMeta("Vega").notation,
      paragraphs: capParagraphs([
        "Vega measures sensitivity to implied volatility—the market’s forecast of future movement baked into option prices. When vol rises, options usually become more expensive even if spot has not moved; vega quantifies that mark-to-market effect. A long straddle or strangle is primarily a bet on movement or vol expansion, which shows up as positive vega before expiry.",
        "Short-vol structures such as iron condors or short straddles carry negative vega: you benefit from a vol crush after events but suffer if uncertainty reprices higher. Income traders watch vega around earnings, FOMC, and macro headlines because the terminal payoff at expiry may be unchanged while mark-to-market P/L moves sharply beforehand.",
        "At-the-money options with more time to expiration generally carry the most vega per dollar of premium; deep out-of-the-money weeklies have little vega because there is not much extrinsic value left to reprice. That is why calendar spreads and diagonals mix different vega profiles across expiries.",
        "Even when your expiry payoff looks fixed, pre-expiry profit and loss can swing on vol alone—that is vega at work. Compare realized movement with implied vol when diagnosing why a directionally correct trade still lost money on a quiet week.",
        "Use ν_net on the live tiles and profile chart to see whether you are net long or short vol at S_0. Pair that reading with gamma when sizing trades into known event dates.",
      ]),
      callProfile: "\\nu_{\\text{call}} = S\\,N'(d_1)\\sqrt{T}",
      putProfile: "\\nu_{\\text{put}} = S\\,N'(d_1)\\sqrt{T}",
    },
    {
      symbol: "\\rho",
      name: "Rho",
      formula: "\\rho = \\frac{\\partial V}{\\partial r}",
      formulaContext: greekFormulaMeta("Rho").context,
      formulaNotation: greekFormulaMeta("Rho").notation,
      paragraphs: capParagraphs([
        "Rho measures sensitivity to the risk-free interest rate used in option pricing. Calls tend to have positive rho because higher rates increase the present-value benefit of deferring cash outlay for stock; puts tend to have negative rho for the mirror reason. In practice rho is often the smallest Greek for short-dated equity options.",
        "Long-dated LEAPS and rate-sensitive underlyings show more rho exposure, but for standard monthly equity trades delta, gamma, theta, and vega dominate day-to-day profit and loss. Rho still belongs in a complete risk report because large rate shifts can nudge deep in-the-money calls and puts by measurable amounts.",
        "Portfolio managers hedging dividend and funding costs sometimes aggregate rho across books even when individual trades ignore it. Our engine includes the risk-free rate in discounting, so rho captures the model’s aggregate rate sensitivity rather than a hand-tuned adjustment.",
        "When comparing calls and puts at the same strike, rho helps explain small price differences that delta alone does not capture—especially for longer maturities where discounting matters more.",
        "Read ρ_net last after delta, theta, vega, and gamma: it completes the five-factor picture without overstating its role on short-dated single-stock structures.",
      ]),
      callProfile: "\\rho_{\\text{call}} = K T e^{-rT} N(d_2)",
      putProfile: "\\rho_{\\text{put}} = -K T e^{-rT} N(-d_2)",
    },
  ],
};
