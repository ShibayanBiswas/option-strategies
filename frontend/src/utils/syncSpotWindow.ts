/** Keep the chart spot window locked to S0 when the spot slider moves. */

function roundTo(value: number, step: number): number {
  if (!(step > 0)) return value;
  return Math.round(value / step) * step;
}

/**
 * When S0 changes, shift spotMin/spotMax by the same delta so the payoff
 * grid recenters. Leaves width and relative moneyness intact. No-op if the
 * window keys are missing (relative `range` mode) or S0 did not change.
 *
 * Default notebooks are unchanged until the user moves S0 — engine defaults stay perfect.
 */
export function syncSpotWindow(
  prev: Record<string, number>,
  next: Record<string, number>,
): Record<string, number> {
  const oldS0 = Number(prev.S0);
  const newS0 = Number(next.S0);
  if (!Number.isFinite(oldS0) || !Number.isFinite(newS0) || oldS0 === newS0) {
    return next;
  }
  if (next.spotMin == null || next.spotMax == null) return next;

  const lo = Number(next.spotMin);
  const hi = Number(next.spotMax);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return next;

  const delta = newS0 - oldS0;
  const step = newS0 > 1000 ? 5 : 1;
  let spotMin = roundTo(lo + delta, step);
  let spotMax = roundTo(hi + delta, step);

  // Guard rounding collapse / inversion
  if (spotMax <= spotMin) {
    spotMax = spotMin + Math.max(step, roundTo(hi - lo, step));
  }
  // Keep S0 inside the window
  if (newS0 < spotMin) spotMin = roundTo(newS0 - (spotMax - spotMin) * 0.15, step);
  if (newS0 > spotMax) spotMax = roundTo(newS0 + (spotMax - spotMin) * 0.15, step);

  return { ...next, spotMin, spotMax };
}

/** Stable fingerprint so seeded charts skip only the matching default POST. */
export function paramsFingerprint(params: Record<string, number>): string {
  return Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
}
