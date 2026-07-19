/** Shared framer-motion presets for cards across the desk UI */

export const cardEnter = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 320, damping: 28 },
};

export const cardHover = {
  y: -6,
  scale: 1.015,
  transition: { type: "spring" as const, stiffness: 420, damping: 22 },
};

export const cardTap = { scale: 0.985 };

export const cardInView = {
  initial: { opacity: 0, y: 22, scale: 0.97 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, amount: 0.18 },
  transition: { type: "spring" as const, stiffness: 280, damping: 24 },
};

export function staggerDelay(index: number, step = 0.05, cap = 0.45) {
  return Math.min(index * step, cap);
}
