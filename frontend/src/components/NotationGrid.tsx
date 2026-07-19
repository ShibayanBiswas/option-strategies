import { motion } from "framer-motion";
import { Latex } from "./Latex";
import { ProseMath } from "./ProseMath";

export interface NotationItem {
  symbol: string;
  meaning: string;
}

/** Symbol-reference cards in a horizontal scroll rail (used on every page). */
export function NotationGrid({ items }: { items: NotationItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="math-notation-rail">
      <dl className="math-notation-grid">
        {items.map((n, i) => (
          <motion.div
            key={`${n.symbol}-${i}`}
            className="math-notation-item"
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 24,
              delay: Math.min(i * 0.05, 0.45),
            }}
            whileHover={{ y: -5, scale: 1.035 }}
            whileTap={{ scale: 0.98 }}
          >
            <dt className="math-notation-symbol">
              <span className="math-notation-glyph">
                <Latex math={n.symbol} emphasize />
              </span>
            </dt>
            <dd className="math-notation-meaning">
              <ProseMath text={n.meaning} stripParens={false} />
            </dd>
          </motion.div>
        ))}
      </dl>
    </div>
  );
}
