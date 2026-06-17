"""Verify engine payoffs against reference notebook formulas."""
from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from engine import compute_payoff  # noqa: E402

ST_STD = np.linspace(50, 150, 500)
ST_VOL = np.linspace(20, 80, 500)
ST_CAL = np.linspace(30, 70, 500)


def grid(params):
    return np.linspace(params["spotMin"], params["spotMax"], 500)


def assert_close(name, got, expected, atol=0.05):
    g = np.array(got)
    e = np.array(expected)
    if g.shape != e.shape or np.max(np.abs(g - e)) > atol:
        raise AssertionError(f"{name}: max err {np.max(np.abs(g - e)):.4f}")


def p(strategy_id, **params):
    base = {"sigma": 0.25, "T": 0.25, "r": 0.05, "spotMin": 50, "spotMax": 150}
    base.update(params)
    return compute_payoff(strategy_id, base)["payoffs"]


def main():
    # Bull call spread — max profit = K2-K1-D = 15
    r = compute_payoff(
        "bull-call-spread",
        {"S0": 100, "K1": 95, "K2": 115, "D": 5, "sigma": 0.25, "T": 0.25, "r": 0.05, "spotMin": 50, "spotMax": 150},
    )
    assert abs(max(r["payoffs"]) - 15) < 0.01, max(r["payoffs"])

    # Bull call ladder — max = K2-K1-H = 5
    r = compute_payoff(
        "bull-call-ladder",
        {"S0": 100, "K1": 95, "K2": 105, "K3": 115, "H": 5, "sigma": 0.25, "T": 0.25, "r": 0.05, "spotMin": 50, "spotMax": 150},
    )
    assert abs(max(r["payoffs"]) - 5) < 0.01

    # Long straddle at notebook params
    st = ST_VOL
    d = 5
    k = 50
    expected = np.maximum(st - k, 0) + np.maximum(k - st, 0) - d
    got = p("long-straddle", S0=50, K=50, D=5, spotMin=20, spotMax=80)
    assert_close("long-straddle", got, expected)

    # Ratio call spread — credit H
    k1, k2, ns, nl, h = 45, 55, 2, 1, 5
    expected = nl * np.maximum(st - k2, 0) - ns * np.maximum(st - k1, 0) + h
    got = p("ratio-call-spread", S0=50, K1=k1, K2=k2, NS=ns, NL=nl, H=h, spotMin=20, spotMax=80)
    assert_close("ratio-call-spread", got, expected)

    # Long box — 2*D debit
    st = np.linspace(70, 130, 500)
    k1, k2, d = 110, 95, 5
    expected = (
        np.maximum(k1 - st, 0)
        - np.maximum(k2 - st, 0)
        + np.maximum(st - k2, 0)
        - np.maximum(st - k1, 0)
        - 2 * d
    )
    got = p("long-box", S0=100, K1=k1, K2=k2, D=d, spotMin=70, spotMax=130)
    assert_close("long-box", got, expected)

    # Calendar — spot grid 30-70
    r = compute_payoff(
        "calendar-call-spread",
        {
            "S0": 50,
            "K": 50,
            "T": 1,
            "T_short": 2 / 12,
            "sigma": 0.2,
            "r": 0.03,
            "D": 2,
            "spotMin": 30,
            "spotMax": 70,
        },
    )
    assert abs(r["spotPrices"][0] - 30) < 0.01
    assert abs(r["spotPrices"][-1] - 70) < 0.01
    assert max(r["payoffs"]) > 0

    print("All notebook alignment checks passed.")


if __name__ == "__main__":
    main()
