/** Shared framer-motion presets — calm enter only; no hover/tap transforms. */

export const cardEnter = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.18 },
};

export const cardInView = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.18 },
};

export function staggerDelay(index: number, step = 0.03, cap = 0.25) {
  return Math.min(index * step, cap);
}
