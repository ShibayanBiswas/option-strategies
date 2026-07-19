/**
 * Canonical strategy catalog — leg definitions align with src/analytics/engine.js STRATEGY_LEGS
 */
export const rawStrategies = [
  {
    id: "long-call",
    section: "2.1",
    name: "Long Call",
    description: "Buy a European call option paying net premium D at inception. The holder gains unlimited upside when S_T exceeds strike K while the maximum loss is limited to the premium paid.",
    outlook: "bullish",
    risk: "Premium at risk; unlimited upside above K",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(S_T - K, 0) - D",
    breakevenLatex: "S^* = K + D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "short-call",
    section: "2.1",
    name: "Short Call",
    description: "Sell a call receiving net premium C. The writer is obligated to deliver the underlying above K; this is an income strategy with unlimited upside risk for the seller.",
    outlook: "neutral-to-bearish",
    risk: "Unlimited loss above K; limited profit to premium",
    riskType: "income",
    payoffLatex: "f_T = C - \\max(S_T - K, 0)",
    breakevenLatex: "S^* = K + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "long-put",
    section: "2.1",
    name: "Long Put",
    description: "Buy a put paying premium D. Profits when the stock falls below K; used for bearish views or as portfolio insurance in protective put structures.",
    outlook: "bearish",
    risk: "Premium at risk; large profit if S_T falls sharply",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K - S_T, 0) - D",
    breakevenLatex: "S^* = K - D",
    maxProfitLatex: "P_{\\max} = K - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "short-put",
    section: "2.1",
    name: "Short Put",
    description: "Write a put receiving premium C. The writer must buy stock at K if assigned; neutral-to-bullish income with payoff equivalent to a covered call at the same strike.",
    outlook: "neutral-to-bullish",
    risk: "Large loss if S_T falls far below K",
    riskType: "income",
    payoffLatex: "f_T = C - \\max(K - S_T, 0)",
    breakevenLatex: "S^* = K - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = K - C",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "covered-call",
    section: "2.2",
    name: "Covered Call",
    description: "Buy stock and write a call with strike K against the stock position. The combined position has the same terminal payoff as a short put and generates income from periodically selling OTM calls.",
    outlook: "neutral-to-bullish",
    risk: "Stock downside below breakeven; upside capped at K",
    riskType: "income",
    payoffLatex: "f_T = S_T - S_0 - \\max(S_T - K, 0) + C",
    breakevenLatex: "S^* = S_0 - C",
    maxProfitLatex: "P_{\\max} = K - S_0 + C",
    maxLossLatex: "L_{\\max} = S_0 - C",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "covered-put",
    section: "2.3",
    name: "Covered Put",
    description: "Short stock and write a put with strike K against the position. Terminal payoff matches a short call; income is collected from selling OTM puts against the short stock.",
    outlook: "neutral-to-bearish",
    risk: "Unlimited upside risk on short stock",
    riskType: "income",
    payoffLatex: "f_T = S_0 - S_T - \\max(K - S_T, 0) + C",
    breakevenLatex: "S^* = S_0 + C",
    maxProfitLatex: "P_{\\max} = S_0 - K + C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "short",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "protective-put",
    section: "2.4",
    name: "Protective Put",
    description: "Buy stock and an ATM or OTM put with K \\leq S_0. The put hedges downside risk while retaining upside above the strike minus premium.",
    outlook: "bullish",
    risk: "Put premium cost; floor at K",
    riskType: "hedging",
    payoffLatex: "f_T = S_T - S_0 + \\max(K - S_T, 0) - D",
    breakevenLatex: "S^* = S_0 + D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = S_0 - K + D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "protective-call",
    section: "2.5",
    name: "Protective Call",
    description: "Short stock and buy an ATM or OTM call with K \\geq S_0. The call hedges upside risk on the short stock while profits accrue on declines.",
    outlook: "bearish",
    risk: "Call premium cost; capped upside loss",
    riskType: "hedging",
    payoffLatex: "f_T = S_0 - S_T + \\max(S_T - K, 0) - D",
    breakevenLatex: "S^* = S_0 - D",
    maxProfitLatex: "P_{\\max} = S_0 - D",
    maxLossLatex: "L_{\\max} = K - S_0 + D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "short",
        type: "stock",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "bull-call-spread",
    section: "2.6",
    name: "Bull Call Spread",
    description: "Long close-to-ATM call K_1 and short OTM call K_2 with K_2 > K_1. A net premium vertical spread that profits from a moderate rise in the stock price with defined risk and reward.",
    outlook: "bullish",
    risk: "Limited to net premium D",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) - \\max(S_T - K_2, 0) - D",
    breakevenLatex: "S^* = K_1 + D",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "bull-put-spread",
    section: "2.7",
    name: "Bull Put Spread",
    description: "Long OTM put K_1 and short OTM put K_2 with K_2 > K_1. A net premium vertical spread with bullish outlook that profits when the stock stays above K_2.",
    outlook: "bullish",
    risk: "Max loss K_2 - K_1 - C",
    riskType: "income",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) + C",
    breakevenLatex: "S^* = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = K_2 - K_1 - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "C"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "bear-call-spread",
    section: "2.8",
    name: "Bear Call Spread",
    description: "Short lower-strike call K_1 and long higher-strike call K_2 with K_2 > K_1. A net premium vertical spread with bearish outlook profiting when price stays below the short strike.",
    outlook: "bearish",
    risk: "Max loss K_2 - K_1 - C",
    riskType: "income",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) - \\max(S_T - K_2, 0) + C",
    breakevenLatex: "S^* = K_1 + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = K_2 - K_1 - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "bear-put-spread",
    section: "2.9",
    name: "Bear Put Spread",
    description: "Long close-to-ATM put K_1 and short OTM put K_2 with K_2 < K_1. A net premium vertical spread profiting from a moderate decline in the stock price.",
    outlook: "bearish",
    risk: "Limited to net premium D",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) - D",
    breakevenLatex: "S^* = K_1 - D",
    maxProfitLatex: "P_{\\max} = K_1 - K_2 - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "long-combo",
    section: "2.12",
    name: "Long Combo",
    description: "Long risk reversal: buy OTM call K_1 and sell OTM put K_2 with K_1 > K_2. Bullish capital gain strategy with unlimited upside and downside tails beyond the strikes.",
    outlook: "bullish",
    risk: "Unlimited both tails minus net premium",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) - \\max(K_2 - S_T, 0) - H",
    breakevenLatex: "S^*_{up} = K_1 + H;\\; S^*_{down} = K_2 - H",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = K_2 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "H"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "short-combo",
    section: "2.13",
    name: "Short Combo",
    description: "Short risk reversal: sell OTM call K_2 and buy OTM put K_1 with K_2 > K_1. Bearish capital gain strategy that collects premium with unlimited tail risk.",
    outlook: "bearish",
    risk: "Unlimited loss on large moves",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(S_T - K_2, 0) - H",
    breakevenLatex: "S^*_{down} = K_1 - H;\\; S^*_{up} = K_2 + H",
    maxProfitLatex: "P_{\\max} = K_1 - H",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "H"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      }
    ],
  },
  {
    id: "bull-call-ladder",
    section: "2.14",
    name: "Bull Call Ladder",
    description: "Bull call spread with long K_1 call and short K_2 call, financed by selling another out-of-the-money call at K_3. Adjusts a bullish outlook toward conservatively bullish or non-directional with extra short call risk above K_3.",
    outlook: "neutral-to-bullish",
    risk: "Uncapped short call exposure above K_3",
    riskType: "income",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) - \\max(S_T - K_2, 0) - \\max(S_T - K_3, 0) - H",
    breakevenLatex: "S^*_{up} = K_3 + K_2 - K_1 + H",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - H",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bull-put-ladder",
    section: "2.15",
    name: "Bull Put Ladder",
    description: "Bull put spread gone wrong when the stock trades lower: short K_1 put, long K_2 put, plus long K_3 put to adjust the position to a bearish outlook.",
    outlook: "bearish",
    risk: "Complex multi-put tail risk",
    riskType: "hedging",
    payoffLatex: "f_T = \\max(K_3 - S_T, 0) + \\max(K_2 - S_T, 0) - \\max(K_1 - S_T, 0) - H",
    maxProfitLatex: "P_{\\max} = K_3 + K_2 - K_1 - H",
    maxLossLatex: "L_{\\max} = K_1 - K_2 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bear-call-ladder",
    section: "2.16",
    name: "Bear Call Ladder",
    description: "Bear call spread gone wrong when the stock trades higher: short K_1 call, long K_2 call, plus long K_3 call to adjust to a bullish outlook.",
    outlook: "bullish",
    risk: "Residual short call risk below K_1",
    riskType: "hedging",
    payoffLatex: "f_T = \\max(S_T - K_3, 0) + \\max(S_T - K_2, 0) - \\max(S_T - K_1, 0) - H",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = K_2 - K_1 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bear-put-ladder",
    section: "2.17",
    name: "Bear Put Ladder",
    description: "Bear put spread with long K_1 put and short K_2 put, financed by selling another out-of-the-money put at K_3. Adjusts a bearish outlook toward conservatively bearish or non-directional.",
    outlook: "neutral-to-bearish",
    risk: "Uncapped short put exposure below K_3",
    riskType: "income",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) - \\max(K_3 - S_T, 0) - H",
    maxProfitLatex: "P_{\\max} = K_1 - K_2 - H",
    maxLossLatex: "L_{\\max} = K_3 + K_2 - K_1 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "calendar-call-spread",
    section: "2.18",
    name: "Calendar Call Spread",
    description: "Long ATM call with TTM T and short call at the same strike K with shorter TTM T' < T. Best outcome at the near expiry is S_{T'} = K; resembles a covered call with periodic short-dated sales.",
    outlook: "neutral-to-bullish",
    risk: "Time decay differential; no single f_T at long expiry",
    riskType: "income",
    payoffLatex: "P(S_{T'}) = V_{\\text{call}}(S_{T'}, K, T-T') - \\max(S_{T'}-K, 0) - D",
    breakevenLatex: "S^* \\text{ from net curve at } T'",
    maxProfitLatex: "P_{\\max} \\text{ near } S_{T'} = K",
    maxLossLatex: "L_{\\max} \\approx D",
    paramKeys: ["S0", "sigma", "T", "T_short", "K", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "calendar-put-spread",
    section: "2.19",
    name: "Calendar Put Spread",
    description: "Long ATM put with TTM T and short put at strike K with shorter TTM T' < T. Best case at near expiry is S_{T'} = K; resembles covered put with periodic short-dated sales.",
    outlook: "neutral-to-bearish",
    risk: "Time decay differential; path-dependent",
    riskType: "income",
    payoffLatex: "P(S_{T'}) = V_{\\text{put}}(S_{T'}, K, T-T') - \\max(K-S_{T'}, 0) - D",
    breakevenLatex: "S^* \\text{ from net curve at } T'",
    maxProfitLatex: "P_{\\max} \\text{ near } S_{T'} = K",
    maxLossLatex: "L_{\\max} \\approx D",
    paramKeys: ["S0", "sigma", "T", "T_short", "K", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "diagonal-call-spread",
    section: "2.20",
    name: "Diagonal Call Spread",
    description: "Long deep in-the-money call at K_1 with time to expiry T and short out-of-the-money call at K_2 with shorter expiry T'. The deep in-the-money long call mimics stock while protecting against a sharp rise.",
    outlook: "bullish",
    risk: "Multi-expiry path dependence",
    riskType: "income",
    payoffLatex: "P(S_{T'}) = V_{\\text{call}}(S_{T'}, K_1, T-T') - \\max(S_{T'}-K_2, 0) - D",
    breakevenLatex: "S^* \\text{ from net curve at } T'",
    maxProfitLatex: "P_{\\max} \\text{ from BS + intrinsic net}",
    maxLossLatex: "L_{\\max} \\approx D",
    paramKeys: ["S0", "sigma", "T", "T_short", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "diagonal-put-spread",
    section: "2.21",
    name: "Diagonal Put Spread",
    description: "Long deep in-the-money put at K_1 with time to expiry T and short out-of-the-money put at K_2 with shorter expiry T'. The deep in-the-money long put mimics short stock while protecting against a sharp drop.",
    outlook: "bearish",
    risk: "Multi-expiry path dependence",
    riskType: "income",
    payoffLatex: "P(S_{T'}) = V_{\\text{put}}(S_{T'}, K_1, T-T') - \\max(K_2-S_{T'}, 0) - D",
    paramKeys: ["S0", "sigma", "T", "T_short", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "long-straddle",
    section: "2.22",
    name: "Long Straddle",
    description: "Long ATM call and long ATM put at strike K. Net premium volatility strategy that profits from large moves in either direction when |S_T - K| exceeds total premium.",
    outlook: "volatility",
    risk: "Premium lost if S_T pins near K",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(S_T - K, 0) + \\max(K - S_T, 0) - D = |S_T - K| - D",
    breakevenLatex: "S^*_{up} = K + D;\\; S^*_{down} = K - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "long-strangle",
    section: "2.23",
    name: "Long Strangle",
    description: "Long OTM call K_1 and long OTM put K_2 with K_1 < S_0 < K_2. Cheaper than a straddle but requires a larger move to reach breakeven; profits from large moves beyond the wings.",
    outlook: "volatility",
    risk: "Total premium at risk",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) + \\max(K_2 - S_T, 0) - D",
    breakevenLatex: "S^*_{up} = K_1 + D;\\; S^*_{down} = K_2 - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D - (K_2 - K_1)",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "long-guts",
    section: "2.24",
    name: "Long Guts",
    description: "Long ITM call K_1 and long ITM put K_2 with K_1 < K_2. More costly than a straddle; assumes D > K_2 - K_1 and profits from large moves beyond the ITM strikes.",
    outlook: "volatility",
    risk: "Higher upfront cost than straddle",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) + \\max(K_2 - S_T, 0) - D",
    breakevenLatex: "S^*_{up} = K_1 + D;\\; S^*_{down} = K_2 - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D - (K_2 - K_1)",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "short-straddle",
    section: "2.25",
    name: "Short Straddle",
    description: "Short ATM call and short ATM put at strike K. Net premium sideways income strategy profiting if the stock price stays near K at expiry.",
    outlook: "neutral",
    risk: "Unlimited loss on large moves",
    riskType: "income",
    payoffLatex: "f_T = -\\max(S_T - K, 0) - \\max(K - S_T, 0) + C = C - |S_T - K|",
    breakevenLatex: "S^*_{up} = K + C;\\; S^*_{down} = K - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "short-strangle",
    section: "2.26",
    name: "Short Strangle",
    description: "Short OTM call K_1 and short OTM put K_2 with K_1 < S_0 < K_2. Less risky than a short straddle but lower initial premium; profits when S_T stays between the strikes.",
    outlook: "neutral",
    risk: "Tail risk beyond OTM strikes",
    riskType: "income",
    payoffLatex: "f_T = -\\max(S_T - K_1, 0) - \\max(K_2 - S_T, 0) + C",
    breakevenLatex: "S^*_{up} = K_1 + C;\\; S^*_{down} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "short-guts",
    section: "2.27",
    name: "Short Guts",
    description: "Short ITM call K_1 and short ITM put K_2. Higher premium than short straddle but higher risk; assumes C > K_2 - K_1.",
    outlook: "neutral",
    risk: "Large loss if S_T moves outside ITM band",
    riskType: "income",
    payoffLatex: "f_T = -\\max(S_T - K_1, 0) - \\max(K_2 - S_T, 0) + C",
    breakevenLatex: "S^*_{up} = K_1 + C;\\; S^*_{down} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "long-call-synthetic-straddle",
    section: "2.28",
    name: "Long Call Synthetic Straddle",
    description: "Short stock and buy two ATM or nearest ITM calls at K. Equivalent to a long straddle with the put replaced by a synthetic put; assumes S_0 \\geq K and D > S_0 - K.",
    outlook: "volatility",
    risk: "Limited loss below; unlimited above",
    riskType: "volatility",
    payoffLatex: "f_T = S_0 - S_T + 2 \\cdot \\max(S_T - K, 0) - D",
    breakevenLatex: "S^*_{up} = 2K - S_0 + D;\\; S^*_{down} = S_0 - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D - (S_0 - K)",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "short",
        type: "stock",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 2
      }
    ],
  },
  {
    id: "long-put-synthetic-straddle",
    section: "2.29",
    name: "Long Put Synthetic Straddle",
    description: "Long stock and buy two ATM or nearest ITM puts at K. Equivalent to a long straddle with the call replaced by a synthetic call; assumes S_0 \\leq K and D > K - S_0.",
    outlook: "volatility",
    risk: "Limited loss above; unlimited below",
    riskType: "volatility",
    payoffLatex: "f_T = S_T - S_0 + 2 \\cdot \\max(K - S_T, 0) - D",
    breakevenLatex: "S^*_{up} = S_0 + D;\\; S^*_{down} = 2K - S_0 - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D - (K - S_0)",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 2
      }
    ],
  },
  {
    id: "short-call-synthetic-straddle",
    section: "2.30",
    name: "Short Call Synthetic Straddle",
    description: "Long stock and sell two ATM or nearest OTM calls at K. Equivalent to a short straddle with the put replaced by a synthetic put; assumes S_0 \\leq K.",
    outlook: "neutral",
    risk: "Unlimited upside loss",
    riskType: "capital-gain",
    payoffLatex: "f_T = S_T - S_0 - 2 \\cdot \\max(S_T - K, 0) + C",
    breakevenLatex: "S^*_{up} = 2K - S_0 + C;\\; S^*_{down} = S_0 - C",
    maxProfitLatex: "P_{\\max} = K - S_0 + C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 2
      }
    ],
  },
  {
    id: "short-put-synthetic-straddle",
    section: "2.31",
    name: "Short Put Synthetic Straddle",
    description: "Short stock and sell two ATM or nearest OTM puts at K. Equivalent to a short straddle with the call replaced by a synthetic call; assumes S_0 \\geq K.",
    outlook: "neutral",
    risk: "Unlimited downside loss",
    riskType: "capital-gain",
    payoffLatex: "f_T = S_0 - S_T - 2 \\cdot \\max(K - S_T, 0) + C",
    breakevenLatex: "S^*_{up} = S_0 + C;\\; S^*_{down} = 2K - S_0 - C",
    maxProfitLatex: "P_{\\max} = S_0 - K + C",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "short",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 2
      }
    ],
  },
  {
    id: "covered-short-straddle",
    section: "2.32",
    name: "Covered Short Straddle",
    description: "Covered call augmented by writing a put at the same strike K and expiry, increasing premium income. Bullish outlook with combined stock and short option exposure.",
    outlook: "bullish",
    risk: "Stock downside; short vol risk at K",
    riskType: "income",
    payoffLatex: "f_T = S_T - S_0 - \\max(S_T - K, 0) - \\max(K - S_T, 0) + C",
    breakevenLatex: "S^*_{up} = K + C;\\; S^*_{down} = K - C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = S_0 - C",
    paramKeys: ["S0", "sigma", "T", "K", "C"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "covered-short-strangle",
    section: "2.33",
    name: "Covered Short Strangle",
    description: "Covered call augmented by an additional short OTM put at K_2 alongside short OTM call K_1 (K_2 below spot, K_1 at or above spot), increasing collected premium. Bullish outlook with a wider profit band than a covered short straddle.",
    outlook: "bullish",
    risk: "Tail risk beyond strangle wings",
    riskType: "income",
    payoffLatex: "f_T = S_T - S_0 - \\max(S_T - K_1, 0) - \\max(K_2 - S_T, 0) + C",
    breakevenLatex: "S^*_{up} = K_1 + C;\\; S^*_{down} = K_2 - C",
    maxProfitLatex: "P_{\\max} = C - (K_2 - K_1)",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "C"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "strap",
    section: "2.34",
    name: "Strap",
    description: "Long two ATM calls and long one ATM put at strike K. Net premium volatility strategy with bullish bias — double call exposure on upside moves.",
    outlook: "bullish",
    risk: "Premium at risk; needs large upside move",
    riskType: "volatility",
    payoffLatex: "f_T = 2 \\cdot \\max(S_T - K, 0) + \\max(K - S_T, 0) - D",
    breakevenLatex: "S^*_{up} = K + D/2;\\; S^*_{down} = K - D",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 2
      },
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 1
      }
    ],
  },
  {
    id: "strip",
    section: "2.35",
    name: "Strip",
    description: "Long one ATM call and long two ATM puts at strike K. Net premium volatility strategy with bearish bias — double put exposure on downside moves.",
    outlook: "bearish",
    risk: "Premium at risk; needs large downside move",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(S_T - K, 0) + 2 \\cdot \\max(K - S_T, 0) - D",
    breakevenLatex: "S^*_{up} = K + D;\\; S^*_{down} = K - D/2",
    maxProfitLatex: "P_{\\max} = 2K - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K",
        qty: 2
      }
    ],
  },
  {
    id: "call-ratio-backspread",
    section: "2.36",
    name: "Call Ratio Backspread",
    description: "Short N_S close-to-ATM calls K_1 and long N_L OTM calls K_2 with N_L > N_S, typically 2:1 or 3:2. Strongly bullish capital gain with tail convexity above K_2.",
    outlook: "bullish",
    risk: "Limited loss near K_1; unlimited upside",
    riskType: "capital-gain",
    payoffLatex: "f_T = N_L \\cdot \\max(S_T - K_2, 0) - N_S \\cdot \\max(S_T - K_1, 0) - H",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "NL", "NS", "H"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: "NS"
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: "NL"
      }
    ],
  },
  {
    id: "put-ratio-backspread",
    section: "2.37",
    name: "Put Ratio Backspread",
    description: "Long N_L OTM puts K_1 and short N_S closer-to-ATM puts K_2 with N_L > N_S (K_1 < K_2). Strongly bearish capital gain with tail convexity below K_1.",
    outlook: "bearish",
    risk: "Limited loss near K_2; large profit on crash",
    riskType: "capital-gain",
    payoffLatex: "f_T = N_L \\cdot \\max(K_1 - S_T, 0) - N_S \\cdot \\max(K_2 - S_T, 0) - H",
    maxProfitLatex: "P_{\\max} = N_L K_1 - N_S K_2 - H",
    maxLossLatex: "L_{\\max} = H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "NL", "NS", "H"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: "NL"
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: "NS"
      }
    ],
  },
  {
    id: "ratio-call-spread",
    section: "2.38",
    name: "Ratio Call Spread",
    description: "Long N_L closer-to-ATM calls K_1 and short N_S OTM calls K_2 with N_S > N_L, typically 1:2. Income if net premium; neutral to mildly bearish with naked short-call risk above K_2.",
    outlook: "neutral-to-bearish",
    risk: "Naked short calls above K_2",
    riskType: "income",
    payoffLatex: "f_T = N_L \\cdot \\max(S_T - K_1, 0) - N_S \\cdot \\max(S_T - K_2, 0) - H",
    maxProfitLatex: "P_{\\max} = N_L(K_2 - K_1) - H",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "NL", "NS", "H"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: "NL"
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: "NS"
      }
    ],
  },
  {
    id: "ratio-put-spread",
    section: "2.39",
    name: "Ratio Put Spread",
    description: "Short N_S close-to-ATM puts K_1 and long N_L ITM puts K_2 with N_L < N_S. Income if net premium; neutral to bullish with naked short put risk below K_1.",
    outlook: "neutral-to-bullish",
    risk: "Naked short puts below K_1",
    riskType: "income",
    payoffLatex: "f_T = N_L \\cdot \\max(K_2 - S_T, 0) - N_S \\cdot \\max(K_1 - S_T, 0) - H",
    maxProfitLatex: "P_{\\max} = N_L(K_2 - K_1) - H",
    maxLossLatex: "L_{\\max} = N_S K_1 - N_L K_2 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "NL", "NS", "H"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: "NS"
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: "NL"
      }
    ],
  },
  {
    id: "long-call-butterfly",
    section: "2.40",
    name: "Long Call Butterfly",
    description: "Long OTM call K_1, short two ATM calls K_2, long ITM call K_3 with equidistant strikes \\kappa. Low-cost premium sideways strategy peaking at K_2.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) + \\max(S_T - K_3, 0) - 2 \\cdot \\max(S_T - K_2, 0) - D",
    breakevenLatex: "S^*_{down} = K_1 + D;\\; S^*_{up} = K_3 - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 2
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "modified-call-butterfly",
    section: "2.40.1",
    name: "Modified Call Butterfly",
    description: "Variation of the long call butterfly with unequal spacing K_1 - K_2 < K_2 - K_3, yielding a sideways strategy with bullish bias and asymmetric wing widths.",
    outlook: "neutral-to-bullish",
    risk: "Limited to net premium D",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) + \\max(S_T - K_3, 0) - 2 \\cdot \\max(S_T - K_2, 0) - D",
    maxProfitLatex: "P_{\\max} = K_3 - K_2 - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 2
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "long-put-butterfly",
    section: "2.41",
    name: "Long Put Butterfly",
    description: "Long OTM put K_1, short two ATM puts K_2, long ITM put K_3 with equidistant strikes \\kappa. Low-cost premium sideways strategy peaking at K_2.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) + \\max(K_3 - S_T, 0) - 2 \\cdot \\max(K_2 - S_T, 0) - D",
    breakevenLatex: "S^*_{down} = K_1 + D;\\; S^*_{up} = K_3 - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 2
      },
      {
        side: "long",
        type: "put",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "modified-put-butterfly",
    section: "2.41.1",
    name: "Modified Put Butterfly",
    description: "Variation of the long put butterfly with unequal spacing K_3 - K_2 < K_2 - K_1, yielding a sideways strategy with bullish bias and asymmetric wing spacing.",
    outlook: "neutral-to-bullish",
    risk: "Limited to net premium H",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) + \\max(K_3 - S_T, 0) - 2 \\cdot \\max(K_2 - S_T, 0) - H",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - H",
    maxLossLatex: "L_{\\max} = H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 2
      },
      {
        side: "long",
        type: "put",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "short-call-butterfly",
    section: "2.42",
    name: "Short Call Butterfly",
    description: "Short ITM call K_1, long two ATM calls K_2, short OTM call K_3 with equidistant strikes. Net premium trade with limited reward compared to short straddle.",
    outlook: "neutral",
    risk: "Limited profit; larger loss away from K_2",
    riskType: "income",
    payoffLatex: "f_T = 2 \\cdot \\max(S_T - K_2, 0) - \\max(S_T - K_1, 0) - \\max(S_T - K_3, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 2
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "short-put-butterfly",
    section: "2.43",
    name: "Short Put Butterfly",
    description: "Short ITM put K_1, long two ATM puts K_2, short OTM put K_3 with equidistant strikes. Net premium income strategy with limited maximum reward.",
    outlook: "neutral",
    risk: "Limited profit; larger loss away from K_2",
    riskType: "income",
    payoffLatex: "f_T = 2 \\cdot \\max(K_2 - S_T, 0) - \\max(K_1 - S_T, 0) - \\max(K_3 - S_T, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "C"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 2
      },
      {
        side: "short",
        type: "put",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "long-iron-butterfly",
    section: "2.44",
    name: "Long Iron Butterfly",
    description: "Bull put spread plus bear call spread: long OTM put K_1, short ATM put/call K_2, long OTM call K_3 with equidistant strikes. Net premium income strategy.",
    outlook: "neutral",
    risk: "Max loss wing width minus premium C",
    riskType: "income",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) - \\max(S_T - K_2, 0) + \\max(S_T - K_3, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "C"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "short-iron-butterfly",
    section: "2.45",
    name: "Short Iron Butterfly",
    description: "Bear put spread plus bull call spread: short OTM put K_1, long ATM put/call K_2, short OTM call K_3. Net premium volatility strategy peaking at K_2.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(K_2 - S_T, 0) + \\max(S_T - K_2, 0) - \\max(K_1 - S_T, 0) - \\max(S_T - K_3, 0) - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "D"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "long-call-condor",
    section: "2.46",
    name: "Long Call Condor",
    description: "Long ITM call K_1, short ITM call K_2, short OTM call K_3, long OTM call K_4 with equidistant strikes. Low-cost premium sideways strategy with flat top between K_2 and K_3.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(S_T - K_1, 0) - \\max(S_T - K_2, 0) - \\max(S_T - K_3, 0) + \\max(S_T - K_4, 0) - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "D"],
    legs: [
      {
        side: "long",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "long-put-condor",
    section: "2.47",
    name: "Long Put Condor",
    description: "Long OTM put K_1, short OTM put K_2, short ITM put K_3, long ITM put K_4 with equidistant strikes. Low-cost premium sideways strategy with flat top between K_2 and K_3.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "sideways",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) - \\max(K_3 - S_T, 0) + \\max(K_4 - S_T, 0) - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K3",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "short-call-condor",
    section: "2.48",
    name: "Short Call Condor",
    description: "Short ITM call K_1, long ITM call K_2, long OTM call K_3, short OTM call K_4 with equidistant strikes. Low net premium volatility strategy rather than pure income.",
    outlook: "neutral",
    risk: "Limited profit; loss beyond wings",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(S_T - K_2, 0) + \\max(S_T - K_3, 0) - \\max(S_T - K_1, 0) - \\max(S_T - K_4, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "C"],
    legs: [
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "short-put-condor",
    section: "2.49",
    name: "Short Put Condor",
    description: "Short OTM put K_1, long OTM put K_2, long ITM put K_3, short ITM put K_4 with equidistant strikes. Low net premium volatility strategy.",
    outlook: "neutral",
    risk: "Limited profit; loss beyond wings",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(K_2 - S_T, 0) + \\max(K_3 - S_T, 0) - \\max(K_1 - S_T, 0) - \\max(K_4 - S_T, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "C"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K3",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "long-iron-condor",
    section: "2.50",
    name: "Long Iron Condor",
    description: "Bull put spread plus bear call spread with four equidistant OTM strikes K_1 < K_2 < K_3 < K_4. Net premium income strategy profiting when S_T stays between K_2 and K_3.",
    outlook: "neutral",
    risk: "Max loss wing width minus premium C",
    riskType: "income",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) + \\max(S_T - K_4, 0) - \\max(K_2 - S_T, 0) - \\max(S_T - K_3, 0) + C",
    maxProfitLatex: "P_{\\max} = C",
    maxLossLatex: "L_{\\max} = \\kappa - C",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "C"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "short-iron-condor",
    section: "2.51",
    name: "Short Iron Condor",
    description: "Bear put spread plus bull call spread with four equidistant OTM strikes. Net premium volatility strategy that profits from moves outside the inner wings.",
    outlook: "neutral",
    risk: "Limited to net premium D",
    riskType: "volatility",
    payoffLatex: "f_T = \\max(K_2 - S_T, 0) + \\max(S_T - K_3, 0) - \\max(K_1 - S_T, 0) - \\max(S_T - K_4, 0) - D",
    maxProfitLatex: "P_{\\max} = \\kappa - D",
    maxLossLatex: "L_{\\max} = D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "K4", "D"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K4",
        qty: 1
      }
    ],
  },
  {
    id: "long-box",
    section: "2.52",
    name: "Long Box Condor",
    description: "Long box condor: a bull call spread plus a bear put spread—long put K_1, short put K_2, long call K_2, short call K_1, paid for with total premium 2D. The terminal payoff is locked at the constant K_1 - K_2 - 2D for every spot, a synthetic risk-free loan / interest-rate arbitrage structure.",
    outlook: "neutral",
    risk: "Arbitrage/interest-rate play; limited by premium",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) + \\max(S_T - K_2, 0) - \\max(S_T - K_1, 0) - 2D = K_1 - K_2 - 2D",
    maxProfitLatex: "P_{\\max} = (K_1 - K_2) - 2D",
    maxLossLatex: "L_{\\max} = 2D",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "D"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K1",
        qty: 1
      }
    ],
  },
  {
    id: "collar",
    section: "2.53",
    name: "Collar",
    description: "Covered call augmented by long OTM put K_1 as insurance: long stock, long put K_1, short call K_2. Moderately bullish capital gain with bounded downside and upside.",
    outlook: "neutral-to-bullish",
    risk: "Upside capped at K_2; floor at K_1",
    riskType: "capital-gain",
    payoffLatex: "f_T = S_T - S_0 + \\max(K_1 - S_T, 0) - \\max(S_T - K_2, 0) - H",
    maxProfitLatex: "P_{\\max} = K_2 - S_0 - H",
    maxLossLatex: "L_{\\max} = S_0 - K_1 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "H"],
    legs: [
      {
        side: "long",
        type: "stock",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      }
    ],
  },
  {
    id: "bullish-short-seagull-spread",
    section: "2.54",
    name: "Bullish Short Seagull Spread",
    description: "Bull call spread financed by selling an OTM put: short put K_1, long call K_2, short call K_3. Ideally zero-cost; bullish capital gain strategy.",
    outlook: "bullish",
    risk: "Short put tail risk below K_1",
    riskType: "capital-gain",
    payoffLatex: "f_T = -\\max(K_1 - S_T, 0) + \\max(S_T - K_2, 0) - \\max(S_T - K_3, 0) - H",
    maxProfitLatex: "P_{\\max} = K_3 - K_2 - H",
    maxLossLatex: "L_{\\max} = K_1 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bearish-long-seagull-spread",
    section: "2.55",
    name: "Bearish Long Seagull Spread",
    description: "Short combo hedged by long OTM call: long put K_1, short call K_2, long call K_3. Ideally zero-cost; bearish capital gain strategy.",
    outlook: "bearish",
    risk: "Unlimited upside above K_3",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(S_T - K_2, 0) + \\max(S_T - K_3, 0) - H",
    maxProfitLatex: "P_{\\max} = K_1 - H",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bearish-short-seagull-spread",
    section: "2.56",
    name: "Bearish Short Seagull Spread",
    description: "Bear put spread financed by selling an OTM call: short put K_1, long put K_2, short call K_3. Ideally zero-cost; bearish capital gain strategy.",
    outlook: "bearish",
    risk: "Short call tail risk above K_3",
    riskType: "capital-gain",
    payoffLatex: "f_T = -\\max(K_1 - S_T, 0) + \\max(K_2 - S_T, 0) - \\max(S_T - K_3, 0) - H",
    maxProfitLatex: "P_{\\max} = K_2 - K_1 - H",
    maxLossLatex: "L_{\\max} = \\infty",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "short",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "long",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "short",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  },
  {
    id: "bullish-long-seagull-spread",
    section: "2.57",
    name: "Bullish Long Seagull Spread",
    description: "Long combo hedged by long OTM put: long put K_1, short put K_2, long call K_3. Ideally zero-cost; bullish capital gain strategy.",
    outlook: "bullish",
    risk: "Large loss if S_T falls below K_1",
    riskType: "capital-gain",
    payoffLatex: "f_T = \\max(K_1 - S_T, 0) - \\max(K_2 - S_T, 0) + \\max(S_T - K_3, 0) - H",
    maxProfitLatex: "P_{\\max} = \\infty",
    maxLossLatex: "L_{\\max} = K_1 + H",
    paramKeys: ["S0", "sigma", "T", "K1", "K2", "K3", "H"],
    legs: [
      {
        side: "long",
        type: "put",
        strike: "K1",
        qty: 1
      },
      {
        side: "short",
        type: "put",
        strike: "K2",
        qty: 1
      },
      {
        side: "long",
        type: "call",
        strike: "K3",
        qty: 1
      }
    ],
  }
];
