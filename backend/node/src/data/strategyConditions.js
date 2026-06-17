// Structural conditions for every strategy: strike orderings, premium type, and
// moneyness assumptions required for the position to behave as advertised.
// Each entry is an ordered list of { latex, note } rendered in the §1 overview.

export const STRATEGY_CONDITIONS = {
  // --- 2.1 single legs ---
  "long-call": [
    { latex: "D > 0", note: "Pay a net premium D for the call." },
    { latex: "S_T > K + D", note: "Profitable only above the breakeven; loss capped at the premium D." },
  ],
  "short-call": [
    { latex: "C > 0", note: "Collect a net premium C for writing the call." },
    { latex: "S_T < K + C", note: "Keep the premium below breakeven; loss is unlimited above it." },
  ],
  "long-put": [
    { latex: "D > 0", note: "Pay a net premium D for the put." },
    { latex: "S_T < K - D", note: "Profitable below breakeven; loss capped at the premium D." },
  ],
  "short-put": [
    { latex: "C > 0", note: "Collect a net premium C for writing the put." },
    { latex: "S_T > K - C", note: "Keep the premium above breakeven; loss grows as spot falls." },
  ],

  // --- income / hedge ---
  "covered-call": [
    { latex: "K \\ge S_0", note: "Write an at- or out-of-the-money call against long stock." },
    { latex: "C > 0", note: "Net premium C received; upside capped at K." },
  ],
  "covered-put": [
    { latex: "K \\le S_0", note: "Write an at- or out-of-the-money put against short stock." },
    { latex: "C > 0", note: "Net premium C received; downside profit capped at K." },
  ],
  "protective-put": [
    { latex: "K \\le S_0", note: "Buy an at- or out-of-the-money put as a floor under long stock." },
    { latex: "D > 0", note: "Net premium D paid; loss limited below K." },
  ],
  "protective-call": [
    { latex: "K \\ge S_0", note: "Buy an at- or out-of-the-money call as a cap over short stock." },
    { latex: "D > 0", note: "Net premium D paid; loss limited above K." },
  ],
  collar: [
    { latex: "K_1 \\le S_0 \\le K_2", note: "Long put floor at K_1, short call cap at K_2 around long stock." },
    { latex: "K_1 < K_2", note: "Floor strictly below the cap; both gains and losses are bounded." },
  ],

  // --- vertical spreads ---
  "bull-call-spread": [
    { latex: "K_1 < K_2", note: "Long the lower-strike call, short the higher-strike call." },
    { latex: "D > 0", note: "Established for a net premium D; max profit = (K_2 - K_1) - D." },
  ],
  "bull-put-spread": [
    { latex: "K_1 < K_2", note: "Long the lower-strike put, short the higher-strike put." },
    { latex: "C > 0", note: "Established for a net premium C; max profit = C." },
  ],
  "bear-call-spread": [
    { latex: "K_1 > K_2", note: "Long the higher-strike call, short the lower-strike call." },
    { latex: "C > 0", note: "Established for a net premium C; max profit = C." },
  ],
  "bear-put-spread": [
    { latex: "K_1 > K_2", note: "Long the higher-strike put, short the lower-strike put." },
    { latex: "D > 0", note: "Established for a net premium D; max profit = (K_1 - K_2) - D." },
  ],
  "long-combo": [
    { latex: "K_1 > K_2", note: "Long call at K_1, short put at K_2 — a synthetic long with a gap." },
    { latex: "K_2 < S_0 < K_1", note: "Strikes straddle spot so entry can be near zero cost." },
  ],
  "short-combo": [
    { latex: "K_2 > K_1", note: "Short call at K_2, long put at K_1 — a synthetic short with a gap." },
    { latex: "K_1 < S_0 < K_2", note: "Strikes straddle spot so entry can be near zero cost." },
  ],

  // --- ladders ---
  "bull-call-ladder": [
    { latex: "K_1 < K_2 < K_3", note: "Long call K_1, short calls K_2 and K_3." },
    { latex: "S_0 \\approx K_1", note: "Bullish but with naked upside above K_3." },
  ],
  "bull-put-ladder": [
    { latex: "K_1 > K_2 > K_3", note: "Short put K_1, long puts K_2 and K_3." },
    { latex: "S_0 \\approx K_1", note: "Profits on a large down-move; capped gain in the middle." },
  ],
  "bear-call-ladder": [
    { latex: "K_1 < K_2 < K_3", note: "Short call K_1, long calls K_2 and K_3." },
    { latex: "S_0 \\approx K_1", note: "Profits on a large up-move; capped loss in the middle." },
  ],
  "bear-put-ladder": [
    { latex: "K_1 > K_2 > K_3", note: "Long put K_1, short puts K_2 and K_3." },
    { latex: "S_0 \\approx K_1", note: "Bearish but with naked downside below K_3." },
  ],

  // --- calendars / diagonals ---
  "calendar-call-spread": [
    { latex: "K_{\\text{near}} = K_{\\text{far}}", note: "Same strike on both calls." },
    { latex: "T < T'", note: "Short the near expiry, long the far expiry; net premium D." },
  ],
  "calendar-put-spread": [
    { latex: "K_{\\text{near}} = K_{\\text{far}}", note: "Same strike on both puts." },
    { latex: "T < T'", note: "Short the near expiry, long the far expiry; net premium D." },
  ],
  "diagonal-call-spread": [
    { latex: "K_1 < K_2", note: "Long the lower-strike (far) call, short the higher-strike (near) call." },
    { latex: "T < T'", note: "Near leg expires first; net premium D." },
  ],
  "diagonal-put-spread": [
    { latex: "K_1 > K_2", note: "Long the higher-strike (far) put, short the lower-strike (near) put." },
    { latex: "T < T'", note: "Near leg expires first; net premium D." },
  ],

  // --- straddles / strangles / guts ---
  "long-straddle": [
    { latex: "K = S_0", note: "Long call and long put at the same at-the-money strike." },
    { latex: "D > 0", note: "Net premium D; breakevens at K ± D." },
  ],
  "short-straddle": [
    { latex: "K = S_0", note: "Short call and short put at the same at-the-money strike." },
    { latex: "C > 0", note: "Net premium C; loss grows outside K ± C." },
  ],
  "long-strangle": [
    { latex: "K_1 < K_2", note: "Long call K_1 and long put K_2 with split strikes." },
    { latex: "D > 0", note: "Cheaper than a straddle; needs a larger move to pay off." },
  ],
  "short-strangle": [
    { latex: "K_1 < K_2", note: "Short call K_1 and short put K_2 with split strikes." },
    { latex: "C > 0", note: "Net premium C; profits if spot stays between the strikes." },
  ],
  "long-guts": [
    { latex: "K_1 < K_2", note: "Long in-the-money call K_1 and long in-the-money put K_2." },
    { latex: "D > K_2 - K_1", note: "Premium exceeds the strike gap; breakevens at K_1 - (D-(K_2-K_1)) and K_2 + (D-(K_2-K_1))." },
  ],
  "short-guts": [
    { latex: "K_1 < K_2", note: "Short in-the-money call K_1 and short in-the-money put K_2." },
    { latex: "C > K_2 - K_1", note: "Premium exceeds the strike gap for a net premium edge." },
  ],
  strap: [
    { latex: "K = S_0", note: "Two long calls and one long put at the same strike." },
    { latex: "D > 0", note: "Volatility play tilted bullish (2:1 calls)." },
  ],
  strip: [
    { latex: "K = S_0", note: "One long call and two long puts at the same strike." },
    { latex: "D > 0", note: "Volatility play tilted bearish (1:2 calls:puts)." },
  ],

  // --- synthetic straddles / covered combos ---
  "long-call-synthetic-straddle": [
    { latex: "K = S_0", note: "Short stock plus two long calls at the money." },
    { latex: "D > 0", note: "Reconstructs a long straddle synthetically." },
  ],
  "long-put-synthetic-straddle": [
    { latex: "K = S_0", note: "Long stock plus two long puts at the money." },
    { latex: "D > 0", note: "Reconstructs a long straddle synthetically." },
  ],
  "short-call-synthetic-straddle": [
    { latex: "K = S_0", note: "Long stock plus two short calls at the money." },
    { latex: "C > 0", note: "Reconstructs a short straddle synthetically." },
  ],
  "short-put-synthetic-straddle": [
    { latex: "K = S_0", note: "Short stock plus two short puts at the money." },
    { latex: "C > 0", note: "Reconstructs a short straddle synthetically." },
  ],
  "covered-short-straddle": [
    { latex: "K = S_0", note: "Long stock plus a short straddle at the money." },
    { latex: "C > 0", note: "High income, large downside if spot falls far." },
  ],
  "covered-short-strangle": [
    { latex: "K_2 < K_1 \\le S_0", note: "Long stock, short call K_1, short put K_2." },
    { latex: "C > 0", note: "Income with a wider neutral band than the covered straddle." },
  ],

  // --- ratio spreads / backspreads ---
  "call-ratio-backspread": [
    { latex: "K_1 < K_2", note: "Short N_S calls at K_1, long N_L calls at K_2." },
    { latex: "N_L > N_S", note: "More longs than shorts — unlimited upside, often entered for a premium." },
  ],
  "put-ratio-backspread": [
    { latex: "K_1 < K_2", note: "Long N_L puts at K_1, short N_S puts at K_2." },
    { latex: "N_L > N_S", note: "More longs than shorts — large downside payoff, often a premium." },
  ],
  "ratio-call-spread": [
    { latex: "K_1 < K_2", note: "Long N_L calls at K_1, short N_S calls at K_2." },
    { latex: "N_S > N_L", note: "More shorts than longs — naked upside risk above K_2." },
  ],
  "ratio-put-spread": [
    { latex: "K_1 < K_2", note: "Long N_L puts at K_2, short N_S puts at K_1." },
    { latex: "N_S > N_L", note: "More shorts than longs — naked downside risk below K_1." },
  ],

  // --- butterflies ---
  "long-call-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Long calls K_1 and K_3, short two calls at the body K_2." },
    { latex: "K_2 - K_1 = K_3 - K_2", note: "Equidistant strikes give the symmetric tent; net premium D." },
  ],
  "long-put-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Long puts K_1 and K_3, short two puts at the body K_2." },
    { latex: "K_2 - K_1 = K_3 - K_2", note: "Equidistant strikes give the symmetric tent; net premium D." },
  ],
  "modified-call-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Long call K_1, short two calls K_2, long call K_3." },
    { latex: "K_3 - K_2 > K_2 - K_1", note: "Wider upper wing skews the payoff bullish." },
  ],
  "modified-put-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Long put K_1, short two puts K_2, long put K_3." },
    { latex: "K_2 - K_1 > K_3 - K_2", note: "Wider lower wing skews the payoff bearish." },
  ],
  "short-call-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Short calls K_1 and K_3, long two calls at the body K_2." },
    { latex: "C > 0", note: "Net premium C; profits on a large move either way." },
  ],
  "short-put-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Short puts K_1 and K_3, long two puts at the body K_2." },
    { latex: "C > 0", note: "Net premium C; profits on a large move either way." },
  ],
  "long-iron-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Short straddle at K_2 with long wings at K_1 and K_3." },
    { latex: "K_2 - K_1 = K_3 - K_2,\\ C > 0", note: "Equidistant wings; net premium C with capped risk." },
  ],
  "short-iron-butterfly": [
    { latex: "K_1 < K_2 < K_3", note: "Long straddle at K_2 with short wings at K_1 and K_3." },
    { latex: "K_2 - K_1 = K_3 - K_2,\\ D > 0", note: "Equidistant wings; net premium D, profits on a big move." },
  ],

  // --- condors ---
  "long-call-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Long calls K_1, K_4; short calls K_2, K_3." },
    { latex: "K_2 - K_1 = K_4 - K_3,\\ D > 0", note: "Symmetric wings; net premium D with a wide flat top." },
  ],
  "long-put-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Long puts K_1, K_4; short puts K_2, K_3." },
    { latex: "K_2 - K_1 = K_4 - K_3,\\ D > 0", note: "Symmetric wings; net premium D with a wide flat top." },
  ],
  "short-call-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Short calls K_1, K_4; long calls K_2, K_3." },
    { latex: "C > 0", note: "Net premium C; profits on a large move beyond the wings." },
  ],
  "short-put-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Short puts K_1, K_4; long puts K_2, K_3." },
    { latex: "C > 0", note: "Net premium C; profits on a large move beyond the wings." },
  ],
  "long-iron-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Bull put spread (K_1,K_2) plus bear call spread (K_3,K_4)." },
    { latex: "C > 0", note: "Net premium C; profits while spot stays between K_2 and K_3." },
  ],
  "short-iron-condor": [
    { latex: "K_1 < K_2 < K_3 < K_4", note: "Long the inner strangle, short the outer wings." },
    { latex: "D > 0", note: "Net premium D; profits on a large move outside K_1 or K_4." },
  ],

  // --- box ---
  "long-box": [
    { latex: "K_1 > K_2", note: "Long put K_1 + short put K_2 + long call K_2 + short call K_1." },
    { latex: "f_T = K_1 - K_2 - 2D", note: "Payoff is locked at a constant for every spot — a synthetic loan." },
    { latex: "K_1 - K_2 > 2D", note: "Arbitrage only when the strike gap exceeds the total premium 2D." },
  ],

  // --- seagulls ---
  "bullish-long-seagull-spread": [
    { latex: "K_1 < K_2 < K_3", note: "Long put K_1, short put K_2, long call K_3." },
    { latex: "K_2 < S_0 < K_3", note: "Bullish bias financed by the short put." },
  ],
  "bullish-short-seagull-spread": [
    { latex: "K_1 < K_2 < K_3", note: "Short put K_1, long call K_2, short call K_3." },
    { latex: "K_1 < S_0 < K_2", note: "Bullish bias financed by the short wings." },
  ],
  "bearish-long-seagull-spread": [
    { latex: "K_1 < K_2 < K_3", note: "Long put K_1, short call K_2, long call K_3." },
    { latex: "K_1 < S_0 < K_2", note: "Bearish bias financed by the short call." },
  ],
  "bearish-short-seagull-spread": [
    { latex: "K_1 < K_2 < K_3", note: "Short put K_1, long put K_2, short call K_3." },
    { latex: "K_2 < S_0 < K_3", note: "Bearish bias financed by the short wings." },
  ],
};

export function conditionsFor(id) {
  return STRATEGY_CONDITIONS[id] || null;
}
