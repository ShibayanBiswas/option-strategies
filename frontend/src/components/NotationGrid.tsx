import { motion } from "framer-motion";
import { Latex } from "./Latex";
import { ProseMath } from "./ProseMath";

interface NotationItem {
  symbol: string;
  meaning: string;
}

function isWideSymbol(symbol: string): boolean {
  return /\\ln|\\frac|\\dfrac|\\\\left|\\sum/.test(symbol);
}

export function NotationGrid({ items }: { items: NotationItem[] }) {
  if (!items?.length) return null;

  return (
    <dl className="math-notation-grid">
      {items.map((n) => (
        <motion.div
          key={n.symbol}
          className={`math-notation-item ${isWideSymbol(n.symbol) ? "math-notation-item-wide" : ""}`}
          whileHover={{ y: -3, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
        >
          <dt className="math-notation-symbol">
            <Latex math={n.symbol.replace(/\\\\/g, "\\")} />
          </dt>
          <dd className="math-notation-meaning">
            <ProseMath text={n.meaning} stripParens={false} />
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}
