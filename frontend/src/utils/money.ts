/** Indian Rupee formatting for live metrics (Nifty / INR desk). */

const INR = "en-IN";

export function formatINR(
  value: number,
  opts: { signed?: boolean; digits?: number } = {}
): string {
  const { signed = false, digits = 2 } = opts;
  const abs = Math.abs(value);
  const body = abs.toLocaleString(INR, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  if (signed) {
    if (value < 0) return `−₹${body}`;
    if (value > 0) return `+₹${body}`;
    return `₹${body}`;
  }
  if (value < 0) return `−₹${body}`;
  return `₹${body}`;
}

/** Spot / strike levels — whole rupees when near-integer, else 2 dp. */
export function formatINRLevel(value: number): string {
  const nearest = Math.round(value);
  if (Math.abs(value - nearest) < 0.005) {
    return `₹${nearest.toLocaleString(INR)}`;
  }
  return formatINR(value, { digits: 2 });
}
