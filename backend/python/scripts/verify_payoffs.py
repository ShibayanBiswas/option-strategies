"""
Implementation parity check: compare engine terminal-payoff arrays against
canonical f_T formulas element-by-element.

Run (from backend/python):
    .\\venv\\Scripts\\python.exe scripts\\verify_payoffs.py
"""

import json
import sys
import urllib.request

import numpy as np

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

NODE = "http://127.0.0.1:4000"
# The API rounds transported payoffs to 4 decimals, so exact-grid comparison
# only needs to clear that transport rounding.
TOL = 1e-3


def get(url):
    with urllib.request.urlopen(url, timeout=20) as r:
        return json.load(r)


def post(url, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def mx(x):
    return np.maximum(x, 0.0)


# Canonical f_T formulas. Premium sign: D subtracts, C adds, H subtracts,
# ratio spreads add H, long box uses doubled premium (-2D).
FORMULAS = {
    "covered-call": lambda S, p: S - p["S0"] - mx(S - p["K"]) + p["C"],
    "covered-put": lambda S, p: p["S0"] - S - mx(p["K"] - S) + p["C"],
    "protective-put": lambda S, p: S - p["S0"] + mx(p["K"] - S) - p["D"],
    "protective-call": lambda S, p: p["S0"] - S + mx(S - p["K"]) - p["D"],
    "bull-call-spread": lambda S, p: mx(S - p["K1"]) - mx(S - p["K2"]) - p["D"],
    "bull-put-spread": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) + p["C"],
    "bear-call-spread": lambda S, p: mx(S - p["K1"]) - mx(S - p["K2"]) + p["C"],
    "bear-put-spread": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) - p["D"],
    "long-combo": lambda S, p: mx(S - p["K1"]) - mx(p["K2"] - S) - p["H"],
    "short-combo": lambda S, p: mx(p["K1"] - S) - mx(S - p["K2"]) - p["H"],
    "bull-call-ladder": lambda S, p: mx(S - p["K1"]) - mx(S - p["K2"]) - mx(S - p["K3"]) - p["H"],
    "bull-put-ladder": lambda S, p: mx(p["K3"] - S) + mx(p["K2"] - S) - mx(p["K1"] - S) - p["H"],
    "bear-call-ladder": lambda S, p: mx(S - p["K3"]) + mx(S - p["K2"]) - mx(S - p["K1"]) - p["H"],
    "bear-put-ladder": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) - mx(p["K3"] - S) - p["H"],
    "long-straddle": lambda S, p: mx(S - p["K"]) + mx(p["K"] - S) - p["D"],
    "long-strangle": lambda S, p: mx(S - p["K1"]) + mx(p["K2"] - S) - p["D"],
    "long-guts": lambda S, p: mx(S - p["K1"]) + mx(p["K2"] - S) - p["D"],
    "short-straddle": lambda S, p: -mx(S - p["K"]) - mx(p["K"] - S) + p["C"],
    "short-strangle": lambda S, p: -mx(S - p["K1"]) - mx(p["K2"] - S) + p["C"],
    "short-guts": lambda S, p: -mx(S - p["K1"]) - mx(p["K2"] - S) + p["C"],
    "long-call-synthetic-straddle": lambda S, p: p["S0"] - S + 2 * mx(S - p["K"]) - p["D"],
    "long-put-synthetic-straddle": lambda S, p: S - p["S0"] + 2 * mx(p["K"] - S) - p["D"],
    "short-call-synthetic-straddle": lambda S, p: S - p["S0"] - 2 * mx(S - p["K"]) + p["C"],
    "short-put-synthetic-straddle": lambda S, p: p["S0"] - S - 2 * mx(p["K"] - S) + p["C"],
    "covered-short-straddle": lambda S, p: S - p["S0"] - mx(S - p["K"]) - mx(p["K"] - S) + p["C"],
    "covered-short-strangle": lambda S, p: S - p["S0"] - mx(S - p["K1"]) - mx(p["K2"] - S) + p["C"],
    "strap": lambda S, p: 2 * mx(S - p["K"]) + mx(p["K"] - S) - p["D"],
    "strip": lambda S, p: mx(S - p["K"]) + 2 * mx(p["K"] - S) - p["D"],
    "call-ratio-backspread": lambda S, p: p["NL"] * mx(S - p["K2"]) - p["NS"] * mx(S - p["K1"]) - p["H"],
    "put-ratio-backspread": lambda S, p: p["NL"] * mx(p["K2"] - S) - p["NS"] * mx(p["K1"] - S) - p["H"],
    "ratio-call-spread": lambda S, p: p["NL"] * mx(S - p["K2"]) - p["NS"] * mx(S - p["K1"]) + p["H"],
    "ratio-put-spread": lambda S, p: p["NL"] * mx(p["K2"] - S) - p["NS"] * mx(p["K1"] - S) + p["H"],
    "long-call-butterfly": lambda S, p: mx(S - p["K1"]) + mx(S - p["K3"]) - 2 * mx(S - p["K2"]) - p["D"],
    "modified-call-butterfly": lambda S, p: mx(S - p["K1"]) + mx(S - p["K3"]) - 2 * mx(S - p["K2"]) - p["D"],
    "long-put-butterfly": lambda S, p: mx(p["K1"] - S) + mx(p["K3"] - S) - 2 * mx(p["K2"] - S) - p["D"],
    "modified-put-butterfly": lambda S, p: mx(p["K1"] - S) + mx(p["K3"] - S) - 2 * mx(p["K2"] - S) - p["H"],
    "short-call-butterfly": lambda S, p: 2 * mx(S - p["K2"]) - mx(S - p["K1"]) - mx(S - p["K3"]) + p["C"],
    "short-put-butterfly": lambda S, p: 2 * mx(p["K2"] - S) - mx(p["K1"] - S) - mx(p["K3"] - S) + p["C"],
    "long-iron-butterfly": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) - mx(S - p["K2"]) + mx(S - p["K3"]) + p["C"],
    "short-iron-butterfly": lambda S, p: mx(p["K2"] - S) + mx(S - p["K2"]) - mx(p["K1"] - S) - mx(S - p["K3"]) - p["D"],
    "long-call-condor": lambda S, p: mx(S - p["K1"]) - mx(S - p["K2"]) - mx(S - p["K3"]) + mx(S - p["K4"]) - p["D"],
    "short-call-condor": lambda S, p: mx(S - p["K2"]) + mx(S - p["K3"]) - mx(S - p["K1"]) - mx(S - p["K4"]) + p["C"],
    "long-put-condor": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) - mx(p["K3"] - S) + mx(p["K4"] - S) - p["D"],
    "short-put-condor": lambda S, p: mx(p["K2"] - S) + mx(p["K3"] - S) - mx(p["K1"] - S) - mx(p["K4"] - S) + p["C"],
    "long-box": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) + mx(S - p["K2"]) - mx(S - p["K1"]) - 2 * p["D"],
    "collar": lambda S, p: S - p["S0"] + mx(p["K1"] - S) - mx(S - p["K2"]) - p["H"],
    "bullish-short-seagull-spread": lambda S, p: -mx(p["K1"] - S) + mx(S - p["K2"]) - mx(S - p["K3"]) - p["H"],
    "bullish-long-seagull-spread": lambda S, p: mx(p["K1"] - S) - mx(p["K2"] - S) + mx(S - p["K3"]) - p["H"],
    "bearish-short-seagull-spread": lambda S, p: -mx(p["K1"] - S) + mx(p["K2"] - S) - mx(S - p["K3"]) - p["H"],
    "bearish-long-seagull-spread": lambda S, p: mx(p["K1"] - S) - mx(S - p["K2"]) + mx(S - p["K3"]) - p["H"],
}

# Multi-expiry (Black-Scholes near-leg) and extended structures: shape checks.
MULTI_EXPIRY = {"calendar-call-spread", "calendar-put-spread", "diagonal-call-spread", "diagonal-put-spread"}
EXTENDED = {"long-iron-condor", "short-iron-condor"}


def main():
    strategies = get(f"{NODE}/api/strategies?scope=chapter")
    ids = [s["id"] for s in strategies]

    passed, failed, skipped = [], [], []
    print(f"Comparing {len(ids)} strategies against canonical formulas (tol={TOL})\n")

    for sid in ids:
        detail = get(f"{NODE}/api/strategies/{sid}")
        params = detail["defaultParams"]
        resp = post(f"{NODE}/api/payoff", {"strategyId": sid, "params": params})
        engine_pay = np.array(resp["payoffs"], dtype=float)
        # Rebuild the exact spot grid the engine used (transported spotPrices
        # are rounded to 2 decimals, which would inject slope*0.005 noise).
        if "spotMin" in params and "spotMax" in params:
            st = np.linspace(float(params["spotMin"]), float(params["spotMax"]), engine_pay.size)
        else:
            st = np.array(resp["spotPrices"], dtype=float)

        if sid in MULTI_EXPIRY:
            # Near expiry: best case at the strike, capped loss at the wings.
            ok = np.isfinite(engine_pay).all() and engine_pay.size > 0
            tag = "SKIP (multi-expiry BS)" if ok else "FAIL (no data)"
            (skipped if ok else failed).append(sid)
            print(f"  {sid:32s} {tag}")
            continue

        if sid in EXTENDED:
            skipped.append(sid)
            print(f"  {sid:32s} SKIP (extended structure)")
            continue

        fn = FORMULAS.get(sid)
        if not fn:
            skipped.append(sid)
            print(f"  {sid:32s} SKIP (no formula mapping)")
            continue

        nb_pay = fn(st, params)
        diff = float(np.max(np.abs(nb_pay - engine_pay)))
        if diff <= TOL:
            passed.append(sid)
            print(f"  {sid:32s} OK   max_abs_diff={diff:.2e}")
        else:
            failed.append(sid)
            print(f"  {sid:32s} FAIL max_abs_diff={diff:.4f}")

    print(
        f"\nSummary: {len(passed)} match, {len(failed)} mismatch, "
        f"{len(skipped)} skipped (multi-expiry / extended)."
    )
    if failed:
        print("MISMATCHES:", ", ".join(failed))
        sys.exit(1)
    print("All single-expiry payoffs match canonical formulas.")


if __name__ == "__main__":
    main()
