"""NumPy-vectorised leg-based payoff and Greeks engine for all option strategies."""
from __future__ import annotations

from typing import Any

import numpy as np

from greeks import (
    GreekProfile,
    call_greeks,
    call_greeks_array,
    combine_profiles,
    combine_profiles_arrays,
    profile_to_dict,
    profiles_arrays_to_dict,
    put_greeks,
    put_greeks_array,
    scale_profile,
    scale_profile_arrays,
    stock_greeks,
    stock_greeks_array,
    value_at_spot,
)
from multi_expiry import MULTI_EXPIRY_IDS, compute_multi_expiry


def _spot_grid(params: dict, s0: float, points: int = 500) -> np.ndarray:
    """Spot axis — fixed limits when spotMin/spotMax are supplied."""
    if "spotMin" in params and "spotMax" in params:
        lo = float(params["spotMin"])
        hi = float(params["spotMax"])
        return np.linspace(lo, hi, points)
    width = float(params.get("range", 0.55))
    lo = max(1.0, s0 * (1 - width))
    hi = s0 * (1 + width)
    return np.linspace(lo, hi, points)


# Ratio spreads treat H as net premium received (+H), not paid.
_CREDIT_H_IDS = frozenset({"ratio-call-spread", "ratio-put-spread"})
_DOUBLE_DEBIT_D_IDS = frozenset({"long-box"})


def _metrics(st: np.ndarray, payoff: np.ndarray, s0: float) -> dict[str, Any]:
    breakevens: list[float] = []
    y = payoff
    x = st
    for i in range(len(x) - 1):
        if y[i] * y[i + 1] <= 0 and y[i] != y[i + 1]:
            x1, x2 = x[i], x[i + 1]
            y1, y2 = y[i], y[i + 1]
            breakevens.append(float(x1 - y1 * (x2 - x1) / (y2 - y1)))
    return {
        "maxProfit": float(np.max(payoff)),
        "maxLoss": float(np.min(payoff)),
        "breakevens": [round(b, 2) for b in sorted(set(breakevens))],
        "payoffAtSpot": float(np.interp(s0, st, payoff)),
    }


def _resolve(params: dict, key: str) -> float:
    mapping = {"K": "K", "K1": "K1", "K2": "K2", "K3": "K3", "K4": "K4", "K_put": "K_put", "K_call": "K_call"}
    pk = mapping.get(key, key)
    return float(params[pk])


def _leg_qty(leg: dict, params: dict) -> float:
    qty = leg.get("qty", 1)
    if isinstance(qty, str):
        return float(params.get(qty, 1))
    return float(qty)


def _leg_sign(leg: dict) -> float:
    return 1.0 if leg["side"] == "long" else -1.0


def _apply_premium(payoff: np.ndarray, params: dict, strategy_id: str | None = None) -> np.ndarray:
    out = payoff.copy()
    if "C" in params:
        out += float(params["C"])
    if "D" in params:
        mult = 2.0 if strategy_id in _DOUBLE_DEBIT_D_IDS else 1.0
        out -= mult * float(params["D"])
    if "H" in params:
        h = float(params["H"])
        if strategy_id in _CREDIT_H_IDS:
            out += h
        else:
            out -= h
    return out


def _long_box_condor_chart(st: np.ndarray, params: dict) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Notebook-style chart legs: bull call spread + bear put spread, each with premium D."""
    k1 = float(params["K1"])
    k2 = float(params["K2"])
    d = float(params["D"])
    bull_call = np.maximum(0.0, st - k2) - np.maximum(0.0, st - k1) - d
    bear_put = np.maximum(0.0, k1 - st) - np.maximum(0.0, k2 - st) - d
    payoff = bull_call + bear_put
    matrix = np.vstack([bull_call, bear_put])
    labels = ["Bull Call Spread", "Bear Put Spread"]
    return matrix, payoff, labels


def _vectorized_leg_payoffs(st: np.ndarray, s0: float, legs: list[dict], params: dict) -> np.ndarray:
    """Stack leg payoffs — shape (n_legs, n_spots), fully vectorised along spot axis."""
    n_legs = len(legs)
    n_spots = st.size
    matrix = np.zeros((n_legs, n_spots), dtype=np.float64)

    for i, leg in enumerate(legs):
        qty = _leg_qty(leg, params)
        sign = _leg_sign(leg)
        t = leg["type"]
        if t == "stock":
            matrix[i] = sign * qty * (st - s0)
        elif t == "call":
            strike = _resolve(params, leg["strike"])
            matrix[i] = sign * qty * np.maximum(0.0, st - strike)
        elif t == "put":
            strike = _resolve(params, leg["strike"])
            matrix[i] = sign * qty * np.maximum(0.0, strike - st)

    return matrix


def _vectorized_leg_greeks(
    st: np.ndarray, leg: dict, params: dict, s0: float, t: float, r: float, sigma: float
) -> tuple[dict[str, Any], Any]:
    """Per-leg vectorised Greek profiles over spot grid + scalar at S₀."""
    qty = _leg_qty(leg, params)
    sign = _leg_sign(leg)
    signed_qty = qty * sign
    ttype = leg["type"]

    if ttype == "stock":
        arrays = stock_greeks_array(st, signed_qty)
        scalar = stock_greeks(signed_qty)
        strike = None
    elif ttype == "call":
        strike = _resolve(params, leg["strike"])
        arrays = scale_profile_arrays(call_greeks_array(st, strike, t, r, sigma), signed_qty)
        scalar = scale_profile(call_greeks(s0, strike, t, r, sigma), signed_qty)
    else:
        strike = _resolve(params, leg["strike"])
        arrays = scale_profile_arrays(put_greeks_array(st, strike, t, r, sigma), signed_qty)
        scalar = scale_profile(put_greeks(s0, strike, t, r, sigma), signed_qty)

    leg_dict = {
        "type": ttype,
        "strike": strike,
        "direction": leg["side"],
        "qty": qty,
        "signedQty": round(signed_qty, 4),
        "label": _leg_label(leg, params),
        **profile_to_dict(scalar),
        "profiles": profiles_arrays_to_dict(arrays),
    }
    return leg_dict, arrays


def _strike_symbol(strike_key: str) -> str:
    if strike_key == "K":
        return "K"
    if strike_key.startswith("K") and strike_key[1:].isdigit():
        return f"K_{strike_key[1:]}"
    return strike_key


def _leg_label(leg: dict, params: dict) -> str:
    direction = "Long" if leg["side"] == "long" else "Short"
    ttype = leg["type"]
    if ttype == "stock":
        return f"{direction} Stock"
    strike_key = leg.get("strike", "K")
    sym = _strike_symbol(strike_key)
    return f"{direction} {ttype.capitalize()} {sym}"


def _directional_label(net_delta: float, threshold: float = 0.08) -> str:
    if net_delta > threshold:
        return "net-bullish"
    if net_delta < -threshold:
        return "net-bearish"
    return "net-neutral"


def _directional_block(
    aggregate: GreekProfile,
    greek_legs: list[dict],
    st: np.ndarray,
    payoff: np.ndarray,
    s0: float,
) -> dict[str, Any]:
    """Net directional movement — prose + LaTeX + vectorised slopes."""
    payoff_slope = np.gradient(payoff, st)
    idx = int(np.argmin(np.abs(st - s0)))
    slope_at_spot = float(payoff_slope[idx])
    label = _directional_label(aggregate.delta)

    leg_delta_terms = []
    for gl in greek_legs:
        sign = 1.0 if gl.get("direction") == "long" else -1.0
        leg_delta_terms.append(
            {
                "leg": gl.get("label") or f"{gl['direction']} {gl['type']}",
                "delta": gl["delta"],
                "contributionLatex": f"\\sigma_i \\Delta_i = ({sign:+.0f})({gl['delta']:+.4f})",
            }
        )

    delta_val = aggregate.delta
    slope_val = slope_at_spot
    return {
        "label": label,
        "netDelta": round(delta_val, 4),
        "netGamma": round(aggregate.gamma, 6),
        "netVega": round(aggregate.vega, 4),
        "netTheta": round(aggregate.theta, 4),
        "payoffSlopeAtSpot": round(slope_val, 4),
        "liveEquations": [
            f"\\Delta_{{\\text{{net}}}} = {delta_val:+.4f}",
            f"\\left.\\frac{{\\partial f_T}}{{\\partial S}}\\right|_{{S=S_0}} = {slope_val:+.4f}",
            (
                "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S"
                f" + \\frac{{1}}{{2}}\\Gamma_{{\\text{{net}}}}(\\Delta S)^2"
                f" + \\nu_{{\\text{{net}}}}\\,\\Delta\\sigma + \\Theta_{{\\text{{net}}}}\\,\\Delta t"
            ),
        ],
        "latex": {
            "payoffDecomposition": "f_T(S_T) = \\sum_{i=1}^{n} \\sigma_i\\,\\phi_i(S_T) - H",
            "netDelta": "\\Delta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Delta_i",
            "netGamma": "\\Gamma_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Gamma_i",
            "netVega": "\\nu_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\nu_i",
            "netTheta": "\\Theta_{\\text{net}} = \\sum_{i=1}^{n} \\sigma_i\\,\\Theta_i",
            "pnlApprox": (
                "\\Delta P \\approx \\Delta_{\\text{net}}\\,\\Delta S"
                " + \\frac{1}{2}\\Gamma_{\\text{net}}(\\Delta S)^2"
                " + \\nu_{\\text{net}}\\,\\Delta\\sigma + \\Theta_{\\text{net}}\\,\\Delta t"
            ),
            "payoffSlope": "\\left.\\frac{\\partial f_T}{\\partial S}\\right|_{S=S_0}",
            "signConvention": "\\sigma_i = +1 \\text{ (long)},\\; \\sigma_i = -1 \\text{ (short)}",
        },
        "legContributions": leg_delta_terms,
    }


def compute_from_legs(strategy_id: str, legs: list[dict], params: dict) -> dict:
    s0 = float(params.get("S0", 100))
    st = _spot_grid(params, s0)

    t = float(params.get("T", 0.25))
    r = float(params.get("r", 0.05))
    sigma = float(params.get("sigma", 0.25))

    if strategy_id in MULTI_EXPIRY_IDS:
        mx = compute_multi_expiry(strategy_id, st, s0, params, r, sigma)
        leg_payoff_matrix = mx["leg_matrix"]
        payoff = mx["payoff"]
        greek_legs = mx["greek_legs"]
        aggregate_arrays = mx["aggregate_arrays"]
        aggregate = mx["aggregate"]
        leg_labels = list(mx["labels"])
    else:
        if strategy_id == "long-box":
            leg_payoff_matrix, payoff, leg_labels = _long_box_condor_chart(st, params)
        else:
            leg_payoff_matrix = _vectorized_leg_payoffs(st, s0, legs, params)
            payoff = leg_payoff_matrix.sum(axis=0)
            payoff = _apply_premium(payoff, params, strategy_id)
            leg_labels = [_leg_label(leg, params) for leg in legs]

        greek_legs = []
        array_profiles = []
        for leg in legs:
            leg_dict, arrays = _vectorized_leg_greeks(st, leg, params, s0, t, r, sigma)
            greek_legs.append(leg_dict)
            array_profiles.append(arrays)

        aggregate_arrays = combine_profiles_arrays(*array_profiles) if array_profiles else stock_greeks_array(st, 0)
        aggregate = value_at_spot(aggregate_arrays, s0, st)

    directional = _directional_block(aggregate, greek_legs, st, payoff, s0)

    return {
        "spotPrices": [round(float(x), 2) for x in st],
        "payoffs": [round(float(x), 4) for x in payoff],
        "legPayoffs": {
            "labels": leg_labels,
            "legs": [
                [round(float(x), 4) for x in leg_payoff_matrix[i]]
                for i in range(leg_payoff_matrix.shape[0])
            ],
        },
        "metrics": _metrics(st, payoff, s0),
        "greeks": {
            "legs": greek_legs,
            "aggregate": profile_to_dict(aggregate),
            "aggregateProfiles": profiles_arrays_to_dict(aggregate_arrays),
        },
        "directional": directional,
    }


# Leg definitions aligned with strategy catalog
STRATEGY_LEGS: dict[str, list[dict]] = {
    "long-call": [{"side": "long", "type": "call", "strike": "K", "qty": 1}],
    "short-call": [{"side": "short", "type": "call", "strike": "K", "qty": 1}],
    "long-put": [{"side": "long", "type": "put", "strike": "K", "qty": 1}],
    "short-put": [{"side": "short", "type": "put", "strike": "K", "qty": 1}],
    "covered-call": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "short", "type": "call", "strike": "K", "qty": 1},
    ],
    "covered-put": [
        {"side": "short", "type": "stock", "qty": 1},
        {"side": "short", "type": "put", "strike": "K", "qty": 1},
    ],
    "protective-put": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "long", "type": "put", "strike": "K", "qty": 1},
    ],
    "protective-call": [
        {"side": "short", "type": "stock", "qty": 1},
        {"side": "long", "type": "call", "strike": "K", "qty": 1},
    ],
    "bull-call-spread": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
    ],
    "bull-put-spread": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "bear-call-spread": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
    ],
    "bear-put-spread": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "long-combo": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "short-combo": [
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
    ],
    "bull-call-ladder": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
    ],
    "bull-put-ladder": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "put", "strike": "K3", "qty": 1},
    ],
    "bear-call-ladder": [
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
    "bear-put-ladder": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "short", "type": "put", "strike": "K3", "qty": 1},
    ],
    "calendar-call-spread": [
        {"side": "long", "type": "call", "strike": "K", "qty": 1},
        {"side": "short", "type": "call", "strike": "K", "qty": 1},
    ],
    "calendar-put-spread": [
        {"side": "long", "type": "put", "strike": "K", "qty": 1},
        {"side": "short", "type": "put", "strike": "K", "qty": 1},
    ],
    "diagonal-call-spread": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
    ],
    "diagonal-put-spread": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "long-straddle": [
        {"side": "long", "type": "call", "strike": "K", "qty": 1},
        {"side": "long", "type": "put", "strike": "K", "qty": 1},
    ],
    "long-strangle": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
    ],
    "long-guts": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
    ],
    "short-straddle": [
        {"side": "short", "type": "call", "strike": "K", "qty": 1},
        {"side": "short", "type": "put", "strike": "K", "qty": 1},
    ],
    "short-strangle": [
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "short-guts": [
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "long-call-synthetic-straddle": [
        {"side": "short", "type": "stock", "qty": 1},
        {"side": "long", "type": "call", "strike": "K", "qty": 2},
    ],
    "long-put-synthetic-straddle": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "long", "type": "put", "strike": "K", "qty": 2},
    ],
    "short-call-synthetic-straddle": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "short", "type": "call", "strike": "K", "qty": 2},
    ],
    "short-put-synthetic-straddle": [
        {"side": "short", "type": "stock", "qty": 1},
        {"side": "short", "type": "put", "strike": "K", "qty": 2},
    ],
    "covered-short-straddle": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "short", "type": "call", "strike": "K", "qty": 1},
        {"side": "short", "type": "put", "strike": "K", "qty": 1},
    ],
    "covered-short-strangle": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
    ],
    "strap": [
        {"side": "long", "type": "call", "strike": "K", "qty": 2},
        {"side": "long", "type": "put", "strike": "K", "qty": 1},
    ],
    "strip": [
        {"side": "long", "type": "call", "strike": "K", "qty": 1},
        {"side": "long", "type": "put", "strike": "K", "qty": 2},
    ],
    "call-ratio-backspread": [
        {"side": "short", "type": "call", "strike": "K1", "qty": "NS"},
        {"side": "long", "type": "call", "strike": "K2", "qty": "NL"},
    ],
    "put-ratio-backspread": [
        {"side": "short", "type": "put", "strike": "K1", "qty": "NS"},
        {"side": "long", "type": "put", "strike": "K2", "qty": "NL"},
    ],
    "ratio-call-spread": [
        {"side": "short", "type": "call", "strike": "K1", "qty": "NS"},
        {"side": "long", "type": "call", "strike": "K2", "qty": "NL"},
    ],
    "ratio-put-spread": [
        {"side": "short", "type": "put", "strike": "K1", "qty": "NS"},
        {"side": "long", "type": "put", "strike": "K2", "qty": "NL"},
    ],
    "long-call-butterfly": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 2},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
    "modified-call-butterfly": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 2},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
    "long-put-butterfly": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 2},
        {"side": "long", "type": "put", "strike": "K3", "qty": 1},
    ],
    "modified-put-butterfly": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 2},
        {"side": "long", "type": "put", "strike": "K3", "qty": 1},
    ],
    "short-call-butterfly": [
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 2},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
    ],
    "short-put-butterfly": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 2},
        {"side": "short", "type": "put", "strike": "K3", "qty": 1},
    ],
    "long-iron-butterfly": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
    "short-iron-butterfly": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
    ],
    "long-call-condor": [
        {"side": "long", "type": "call", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
        {"side": "long", "type": "call", "strike": "K4", "qty": 1},
    ],
    "long-put-condor": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "short", "type": "put", "strike": "K3", "qty": 1},
        {"side": "long", "type": "put", "strike": "K4", "qty": 1},
    ],
    "short-call-condor": [
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
        {"side": "short", "type": "call", "strike": "K4", "qty": 1},
    ],
    "short-put-condor": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "put", "strike": "K3", "qty": 1},
        {"side": "short", "type": "put", "strike": "K4", "qty": 1},
    ],
    "long-iron-condor": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
        {"side": "long", "type": "call", "strike": "K4", "qty": 1},
    ],
    "short-iron-condor": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
        {"side": "short", "type": "call", "strike": "K4", "qty": 1},
    ],
    "long-box": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K1", "qty": 1},
    ],
    "collar": [
        {"side": "long", "type": "stock", "qty": 1},
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
    ],
    "bullish-short-seagull-spread": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "call", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
    ],
    "bearish-long-seagull-spread": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "call", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
    "bearish-short-seagull-spread": [
        {"side": "short", "type": "put", "strike": "K1", "qty": 1},
        {"side": "long", "type": "put", "strike": "K2", "qty": 1},
        {"side": "short", "type": "call", "strike": "K3", "qty": 1},
    ],
    "bullish-long-seagull-spread": [
        {"side": "long", "type": "put", "strike": "K1", "qty": 1},
        {"side": "short", "type": "put", "strike": "K2", "qty": 1},
        {"side": "long", "type": "call", "strike": "K3", "qty": 1},
    ],
}


def compute_payoff(strategy_id: str, params: dict) -> dict:
    if strategy_id not in STRATEGY_LEGS:
        raise ValueError(f"Unknown strategy: {strategy_id}")
    return compute_from_legs(strategy_id, STRATEGY_LEGS[strategy_id], params)
