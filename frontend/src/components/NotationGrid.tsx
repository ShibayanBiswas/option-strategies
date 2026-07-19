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
          <div key={`${n.symbol}-${i}`} className="math-notation-item">
            <dt className="math-notation-symbol">
              <span className="math-notation-glyph">
                <Latex math={n.symbol} emphasize />
              </span>
            </dt>
            <dd className="math-notation-meaning">
              <ProseMath text={n.meaning} stripParens={false} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
