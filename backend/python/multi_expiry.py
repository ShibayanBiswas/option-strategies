"""Calendar and diagonal spread PnL/Greeks — matches reference notebook at near expiry."""
from __future__ import annotations

from typing import Any

import numpy as np

from greeks import (
    call_greeks,
    call_greeks_array,
    call_price_array,
    combine_profiles_arrays,
    expired_call_greeks_array,
    expired_put_greeks_array,
    profile_to_dict,
    profiles_arrays_to_dict,
    put_greeks,
    put_greeks_array,
    put_price_array,
    scale_profile,
    scale_profile_arrays,
    value_at_spot,
)

MULTI_EXPIRY_IDS = frozenset(
    {
        "calendar-call-spread",
        "calendar-put-spread",
        "diagonal-call-spread",
        "diagonal-put-spread",
    }
)


def _resolve(params: dict, key: str) -> float:
    return float(params[key])


def _time_params(params: dict) -> tuple[float, float, float]:
    t_long = float(params.get("T", 1.0))
    default_short = min(2.0 / 12.0, t_long * 0.5)
    t_short = float(params.get("T_short", default_short))
    t_short = min(max(t_short, 1e-4), max(t_long - 1e-4, 1e-4))
    t_rem = max(t_long - t_short, 1e-4)
    return t_long, t_short, t_rem


def _apply_premium(payoff: np.ndarray, params: dict) -> np.ndarray:
    out = payoff.copy()
    if "C" in params:
        out += float(params["C"])
    if "D" in params:
        out -= float(params["D"])
    if "H" in params:
        out -= float(params["H"])
    return out


def _leg_label(direction: str, opt_type: str, strike_sym: str) -> str:
    return f"{direction} {opt_type.capitalize()} {strike_sym}"


def compute_multi_expiry(
    strategy_id: str,
    st: np.ndarray,
    s0: float,
    params: dict,
    r: float,
    sigma: float,
) -> dict[str, Any]:
    """Notebook PnL at short-leg expiry: long BS value minus short intrinsic minus premium."""
    _, _, t_rem = _time_params(params)
    qty_long = 1.0
    qty_short = -1.0

    if strategy_id == "calendar-call-spread":
        k = _resolve(params, "K")
        long_value = call_price_array(st, k, t_rem, r, sigma)
        short_payoff = np.maximum(st - k, 0.0)
        long_arrays = scale_profile_arrays(call_greeks_array(st, k, t_rem, r, sigma), qty_long)
        short_arrays = expired_call_greeks_array(st, k, qty_short)
        long_scalar = scale_profile(call_greeks(s0, k, t_rem, r, sigma), qty_long)
        short_scalar = value_at_spot(expired_call_greeks_array(st, k, qty_short), s0, st)
        leg_types = ("call", "call")
        labels = (_leg_label("Long", "call", "K"), _leg_label("Short", "call", "K"))
    elif strategy_id == "calendar-put-spread":
        k = _resolve(params, "K")
        long_value = put_price_array(st, k, t_rem, r, sigma)
        short_payoff = np.maximum(k - st, 0.0)
        long_arrays = scale_profile_arrays(put_greeks_array(st, k, t_rem, r, sigma), qty_long)
        short_arrays = expired_put_greeks_array(st, k, qty_short)
        long_scalar = scale_profile(put_greeks(s0, k, t_rem, r, sigma), qty_long)
        short_scalar = value_at_spot(expired_put_greeks_array(st, k, qty_short), s0, st)
        leg_types = ("put", "put")
        labels = (_leg_label("Long", "put", "K"), _leg_label("Short", "put", "K"))
    elif strategy_id == "diagonal-call-spread":
        k1 = _resolve(params, "K1")
        k2 = _resolve(params, "K2")
        long_value = call_price_array(st, k1, t_rem, r, sigma)
        short_payoff = np.maximum(st - k2, 0.0)
        long_arrays = scale_profile_arrays(call_greeks_array(st, k1, t_rem, r, sigma), qty_long)
        short_arrays = expired_call_greeks_array(st, k2, qty_short)
        long_scalar = scale_profile(call_greeks(s0, k1, t_rem, r, sigma), qty_long)
        short_scalar = value_at_spot(expired_call_greeks_array(st, k2, qty_short), s0, st)
        leg_types = ("call", "call")
        labels = (_leg_label("Long", "call", "K_1"), _leg_label("Short", "call", "K_2"))
    elif strategy_id == "diagonal-put-spread":
        k1 = _resolve(params, "K1")
        k2 = _resolve(params, "K2")
        long_value = put_price_array(st, k1, t_rem, r, sigma)
        short_payoff = np.maximum(k2 - st, 0.0)
        long_arrays = scale_profile_arrays(put_greeks_array(st, k1, t_rem, r, sigma), qty_long)
        short_arrays = expired_put_greeks_array(st, k2, qty_short)
        long_scalar = scale_profile(put_greeks(s0, k1, t_rem, r, sigma), qty_long)
        short_scalar = value_at_spot(expired_put_greeks_array(st, k2, qty_short), s0, st)
        leg_types = ("put", "put")
        labels = (_leg_label("Long", "put", "K_1"), _leg_label("Short", "put", "K_2"))
    else:
        raise ValueError(f"Not a multi-expiry strategy: {strategy_id}")

    leg_matrix = np.array([long_value, -short_payoff])
    payoff = _apply_premium(leg_matrix.sum(axis=0), params)
    aggregate_arrays = combine_profiles_arrays(long_arrays, short_arrays)
    aggregate = value_at_spot(aggregate_arrays, s0, st)

    greek_legs = [
        {
            "type": leg_types[0],
            "strike": None,
            "direction": "long",
            "qty": 1,
            "signedQty": qty_long,
            "label": labels[0],
            **profile_to_dict(long_scalar),
            "profiles": profiles_arrays_to_dict(long_arrays),
        },
        {
            "type": leg_types[1],
            "strike": None,
            "direction": "short",
            "qty": 1,
            "signedQty": qty_short,
            "label": labels[1],
            **profile_to_dict(short_scalar),
            "profiles": profiles_arrays_to_dict(short_arrays),
        },
    ]

    return {
        "leg_matrix": leg_matrix,
        "payoff": payoff,
        "labels": labels,
        "greek_legs": greek_legs,
        "aggregate_arrays": aggregate_arrays,
        "aggregate": aggregate,
    }
