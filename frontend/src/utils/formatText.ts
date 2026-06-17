/** Title-case labels for cards and headings */
export function titleCase(text: string): string {
  return text
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalize whitespace for display prose. We intentionally KEEP parentheses
 * because they often contain math, e.g. N(d_1), (1/2), max(S_T - K, 0).
 */
export function stripParentheticals(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function displayProse(text: string | undefined): string {
  if (!text) return "";
  return stripParentheticals(text);
}
