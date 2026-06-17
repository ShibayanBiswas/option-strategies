"""
Greek-profile parity check by finite differences.

For every computable single-expiry strategy we pull the live payoff/greeks
response from the Node API (net Greek curves + the per-leg type/strike/signedQty
the engine actually used), independently rebuild the Black-Scholes portfolio
value V(S, T, r, sigma) from those legs, and numerically differentiate it:

    delta = dV/dS      gamma = d2V/dS2
    vega  = dV/dsigma / 100     (per 1 vol point)
    theta = -dV/dT / 365        (per calendar day)
    rho   = dV/dr / 100         (per 1 rate point)

The finite-difference Greeks are compared, point-by-point on the interior of the
spot grid, against the engine's analytic Greek arrays. This validates both the
Black-Scholes Greek formulas and the per-leg sign/quantity assembly.

Run (from backend/python):
    .\\venv\\Scripts\\python.exe scripts\\verify_greeks.py
"""

import json
import sys
import urllib.request

import numpy as np
from scipy.stats import norm

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

NODE = "http://127.0.0.1:4000"

# Multi-expiry structures value the near leg at expiry (non-smooth intrinsic),
# so a smooth-BS finite difference does not apply — checked separately for shape.
MULTI_EXPIRY = {"calendar-call-spread", "calendar-put-spread", "diagonal-call-spread", "diagonal-put-spread"}

# Absolute tolerances (engine rounds delta/theta/vega/rho to 4dp, gamma to 6dp;
# add finite-difference truncation headroom).
TOL = {"delta": 3e-3, "gamma": 3e-3, "vega": 6e-3, "theta": 6e-3, "rho": 6e-3}

# Finite-difference steps.
H_S = 0.10
H_SIG = 1e-4
H_T = 1e-4
H_R = 1e-5


def get(url):
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.load(r)


def post(url, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def bs_price(kind, S, K, T, r, sigma):
    S = np.asarray(S, dtype=float)
    if kind == "stock":
        return S.copy()
    if T <= 0 or sigma <= 0:
        return np.maximum(S - K, 0.0) if kind == "call" else np.maximum(K - S, 0.0)
    sq = sigma * np.sqrt(T)
    d1 = (np.log(np.maximum(S, 1e-12) / K) + (r + 0.5 * sigma**2) * T) / sq
    d2 = d1 - sq
    if kind == "call":
        return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def portfolio_value(S, T, r, sigma, legs):
    total = np.zeros_like(np.asarray(S, dtype=float))
    for lg in legs:
        q = float(lg["signedQty"])
        total = total + q * bs_price(lg["type"], S, lg["strike"], T, r, sigma)
    return total


def main():
    strategies = get(f"{NODE}/api/strategies?scope=chapter")
    ids = [s["id"] for s in strategies]

    passed, failed, skipped = [], [], []
    print(f"Finite-difference Greek check for {len(ids)} strategies\n")

    for sid in ids:
        detail = get(f"{NODE}/api/strategies/{sid}")
        params = detail["defaultParams"]
        if not detail.get("hasPayoff"):
            skipped.append(sid)
            print(f"  {sid:32s} SKIP (no payoff)")
            continue
        if sid in MULTI_EXPIRY:
            skipped.append(sid)
            print(f"  {sid:32s} SKIP (multi-expiry near-leg intrinsic)")
            continue

        resp = post(f"{NODE}/api/payoff", {"strategyId": sid, "params": params})
        greeks = resp["greeks"]
        agg = greeks["aggregateProfiles"]
        legs = [
            {"type": lg["type"], "strike": lg["strike"], "signedQty": lg["signedQty"]}
            for lg in greeks["legs"]
        ]

        n = len(resp["payoffs"])
        if "spotMin" in params and "spotMax" in params:
            st = np.linspace(float(params["spotMin"]), float(params["spotMax"]), n)
        else:
            st = np.array(resp["spotPrices"], dtype=float)

        T = float(params.get("T", 0.25))
        r = float(params.get("r", 0.05))
        sigma = float(params.get("sigma", 0.25))

        v0 = portfolio_value(st, T, r, sigma, legs)
        vp = portfolio_value(st + H_S, T, r, sigma, legs)
        vm = portfolio_value(st - H_S, T, r, sigma, legs)
        delta_fd = (vp - vm) / (2 * H_S)
        gamma_fd = (vp - 2 * v0 + vm) / (H_S**2)
        vega_fd = (
            portfolio_value(st, T, r, sigma + H_SIG, legs)
            - portfolio_value(st, T, r, sigma - H_SIG, legs)
        ) / (2 * H_SIG) / 100.0
        theta_fd = -(
            portfolio_value(st, T + H_T, r, sigma, legs)
            - portfolio_value(st, T - H_T, r, sigma, legs)
        ) / (2 * H_T) / 365.0
        rho_fd = (
            portfolio_value(st, T, r + H_R, sigma, legs)
            - portfolio_value(st, T, r - H_R, sigma, legs)
        ) / (2 * H_R) / 100.0

        fd = {"delta": delta_fd, "gamma": gamma_fd, "vega": vega_fd, "theta": theta_fd, "rho": rho_fd}

        # Skip 3 points at each end (one-sided edges hurt the 2nd-difference).
        lo, hi = 3, n - 3
        worst = {}
        ok = True
        for g in ("delta", "gamma", "vega", "theta", "rho"):
            eng = np.array(agg[g], dtype=float)[lo:hi]
            num = fd[g][lo:hi]
            d = float(np.max(np.abs(eng - num)))
            worst[g] = d
            if d > TOL[g]:
                ok = False

        line = "  ".join(f"{g[0]}={worst[g]:.1e}" for g in ("delta", "gamma", "vega", "theta", "rho"))
        if ok:
            passed.append(sid)
            print(f"  {sid:32s} OK   {line}")
        else:
            failed.append(sid)
            bad = ",".join(g for g in TOL if worst[g] > TOL[g])
            print(f"  {sid:32s} FAIL [{bad}]  {line}")

    print(f"\nSummary: {len(passed)} match, {len(failed)} mismatch, {len(skipped)} skipped.")
    if failed:
        print("MISMATCHES:", ", ".join(failed))
        sys.exit(1)
    print("All single-expiry Greek profiles match finite differences.")


if __name__ == "__main__":
    main()
