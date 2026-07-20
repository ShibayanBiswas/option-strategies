/** YYYY-MM-DD in Asia/Kolkata — NSE trading-day key. */
export function istMarketDay(input: Date | string | number = new Date()): string {
  const d = input instanceof Date ? input : new Date(input);
  if (!Number.isFinite(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** True when ATM moved enough to matter for Nifty strike grids (₹50). */
export function niftyAtmMoved(
  prevAtm: number | undefined | null,
  nextAtm: number | undefined | null,
  threshold = 50,
): boolean {
  const a = Number(prevAtm);
  const b = Number(nextAtm);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(b - a) >= threshold;
}
