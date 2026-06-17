"""Black-Scholes Greeks — NumPy-vectorised for spot grids and leg portfolios."""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from scipy.stats import norm


@dataclass
class GreekProfile:
    delta: float
    gamma: float
    theta: float
    vega: float
    rho: float


@dataclass
class GreekProfileArrays:
    delta: np.ndarray
    gamma: np.ndarray
    theta: np.ndarray
    vega: np.ndarray
    rho: np.ndarray


def _as_array(x: float | np.ndarray) -> np.ndarray:
    return np.asarray(x, dtype=np.float64)


def _d1_d2(S: np.ndarray, K: float, T: float, r: float, sigma: float) -> tuple[np.ndarray, np.ndarray]:
    S = _as_array(S)
    if T <= 0 or sigma <= 0 or K <= 0:
        return np.zeros_like(S), np.zeros_like(S)
    safe_s = np.maximum(S, 1e-12)
    d1 = (np.log(safe_s / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return d1, d2


def call_greeks_array(S: np.ndarray, K: float, T: float, r: float, sigma: float) -> GreekProfileArrays:
    """Vectorised call Greeks at each spot in S."""
    S = _as_array(S)
    d1, d2 = _d1_d2(S, K, T, r, sigma)
    if T <= 0 or sigma <= 0:
        delta = np.where(S > K, 1.0, 0.0)
        z = np.zeros_like(S)
        return GreekProfileArrays(delta, z, z, z, z)

    sqrt_t = np.sqrt(T)
    pdf_d1 = norm.pdf(d1)
    delta = norm.cdf(d1)
    gamma = pdf_d1 / (np.maximum(S, 1e-12) * sigma * sqrt_t)
    theta = (
        -(S * pdf_d1 * sigma) / (2 * sqrt_t) - r * K * np.exp(-r * T) * norm.cdf(d2)
    ) / 365.0
    vega = S * pdf_d1 * sqrt_t / 100.0
    rho = K * T * np.exp(-r * T) * norm.cdf(d2) / 100.0
    return GreekProfileArrays(delta, gamma, theta, vega, rho)


def put_greeks_array(S: np.ndarray, K: float, T: float, r: float, sigma: float) -> GreekProfileArrays:
    """Vectorised put Greeks at each spot in S."""
    S = _as_array(S)
    d1, d2 = _d1_d2(S, K, T, r, sigma)
    if T <= 0 or sigma <= 0:
        delta = np.where(S < K, -1.0, 0.0)
        z = np.zeros_like(S)
        return GreekProfileArrays(delta, z, z, z, z)

    sqrt_t = np.sqrt(T)
    pdf_d1 = norm.pdf(d1)
    delta = norm.cdf(d1) - 1.0
    gamma = pdf_d1 / (np.maximum(S, 1e-12) * sigma * sqrt_t)
    theta = (
        -(S * pdf_d1 * sigma) / (2 * sqrt_t) + r * K * np.exp(-r * T) * norm.cdf(-d2)
    ) / 365.0
    vega = S * pdf_d1 * sqrt_t / 100.0
    rho = -K * T * np.exp(-r * T) * norm.cdf(-d2) / 100.0
    return GreekProfileArrays(delta, gamma, theta, vega, rho)


def stock_greeks_array(S: np.ndarray, qty: float = 1.0) -> GreekProfileArrays:
    S = _as_array(S)
    delta = np.full_like(S, qty, dtype=np.float64)
    z = np.zeros_like(S)
    return GreekProfileArrays(delta, z, z, z, z)


def call_price_array(S: np.ndarray, K: float, T: float, r: float, sigma: float) -> np.ndarray:
    """Black-Scholes call prices across a spot grid."""
    S = _as_array(S)
    if T <= 0 or sigma <= 0:
        return np.maximum(S - K, 0.0)
    d1, d2 = _d1_d2(S, K, T, r, sigma)
    return S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2)


def put_price_array(S: np.ndarray, K: float, T: float, r: float, sigma: float) -> np.ndarray:
    """Black-Scholes put prices across a spot grid."""
    S = _as_array(S)
    if T <= 0 or sigma <= 0:
        return np.maximum(K - S, 0.0)
    d1, d2 = _d1_d2(S, K, T, r, sigma)
    return K * np.exp(-r * T) * norm.cdf(-d2) - S * norm.cdf(-d1)


def expired_call_greeks_array(S: np.ndarray, K: float, signed_qty: float) -> GreekProfileArrays:
    """Short-dated leg at expiry — intrinsic delta only."""
    S = _as_array(S)
    z = np.zeros_like(S)
    delta = np.where(S > K, signed_qty, 0.0)
    return GreekProfileArrays(delta, z, z, z, z)


def expired_put_greeks_array(S: np.ndarray, K: float, signed_qty: float) -> GreekProfileArrays:
    """Short-dated leg at expiry — intrinsic delta only."""
    S = _as_array(S)
    z = np.zeros_like(S)
    delta = np.where(S < K, signed_qty * (-1.0), 0.0)
    return GreekProfileArrays(delta, z, z, z, z)


def call_greeks(S: float, K: float, T: float, r: float, sigma: float) -> GreekProfile:
    g = call_greeks_array(np.array([S]), K, T, r, sigma)
    return GreekProfile(
        float(g.delta[0]), float(g.gamma[0]), float(g.theta[0]), float(g.vega[0]), float(g.rho[0])
    )


def put_greeks(S: float, K: float, T: float, r: float, sigma: float) -> GreekProfile:
    g = put_greeks_array(np.array([S]), K, T, r, sigma)
    return GreekProfile(
        float(g.delta[0]), float(g.gamma[0]), float(g.theta[0]), float(g.vega[0]), float(g.rho[0])
    )


def stock_greeks(qty: float = 1.0) -> GreekProfile:
    return GreekProfile(delta=qty, gamma=0.0, theta=0.0, vega=0.0, rho=0.0)


def scale_profile_arrays(profile: GreekProfileArrays, qty: float) -> GreekProfileArrays:
    return GreekProfileArrays(
        profile.delta * qty,
        profile.gamma * qty,
        profile.theta * qty,
        profile.vega * qty,
        profile.rho * qty,
    )


def combine_profiles(*profiles: GreekProfile) -> GreekProfile:
    return GreekProfile(
        delta=sum(p.delta for p in profiles),
        gamma=sum(p.gamma for p in profiles),
        theta=sum(p.theta for p in profiles),
        vega=sum(p.vega for p in profiles),
        rho=sum(p.rho for p in profiles),
    )


def combine_profiles_arrays(*profiles: GreekProfileArrays) -> GreekProfileArrays:
    if not profiles:
        z = np.array([0.0])
        return GreekProfileArrays(z, z, z, z, z)
    return GreekProfileArrays(
        delta=sum(p.delta for p in profiles),
        gamma=sum(p.gamma for p in profiles),
        theta=sum(p.theta for p in profiles),
        vega=sum(p.vega for p in profiles),
        rho=sum(p.rho for p in profiles),
    )


def scale_profile(profile: GreekProfile, qty: float) -> GreekProfile:
    return GreekProfile(
        delta=profile.delta * qty,
        gamma=profile.gamma * qty,
        theta=profile.theta * qty,
        vega=profile.vega * qty,
        rho=profile.rho * qty,
    )


def profile_to_dict(profile: GreekProfile) -> dict[str, float]:
    return {
        "delta": round(profile.delta, 4),
        "gamma": round(profile.gamma, 6),
        "theta": round(profile.theta, 4),
        "vega": round(profile.vega, 4),
        "rho": round(profile.rho, 4),
    }


def profiles_arrays_to_dict(profile: GreekProfileArrays) -> dict[str, list[float]]:
    return {
        "delta": [round(float(x), 4) for x in profile.delta],
        "gamma": [round(float(x), 6) for x in profile.gamma],
        "theta": [round(float(x), 4) for x in profile.theta],
        "vega": [round(float(x), 4) for x in profile.vega],
        "rho": [round(float(x), 4) for x in profile.rho],
    }


def value_at_spot(profile: GreekProfileArrays, s0: float, spot_grid: np.ndarray) -> GreekProfile:
    idx = int(np.argmin(np.abs(spot_grid - s0)))
    return GreekProfile(
        float(profile.delta[idx]),
        float(profile.gamma[idx]),
        float(profile.theta[idx]),
        float(profile.vega[idx]),
        float(profile.rho[idx]),
    )
