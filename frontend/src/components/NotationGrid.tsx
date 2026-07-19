import { motion } from "framer-motion";
import { Latex } from "./Latex";
import { ProseMath } from "./ProseMath";
import { staggerDelay } from "../motion/cardMotion";

export interface NotationItem {
  symbol: string;
  meaning: string;
}

/** Symbol-reference cards — polished gold chips with enter/hover motion (notation only). */
export function NotationGrid({ items }: { items: NotationItem[] }) {
  if (!items?.length) return null;

  return (
    <div className="math-notation-rail">
      <dl className="math-notation-grid">
        {items.map((n, i) => (
          <motion.div
            key={`${n.symbol}-${i}`}
            className="math-notation-item"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 0.45,
              delay: staggerDelay(i, 0.07, 0.42),
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{
              y: -5,
              scale: 1.03,
              transition: { type: "spring", stiffness: 380, damping: 22 },
            }}
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
