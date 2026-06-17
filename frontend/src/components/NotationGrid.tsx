import { Latex } from "./Latex";
import { ProseMath } from "./ProseMath";

interface NotationItem {
  symbol: string;
  meaning: string;
}

export function NotationGrid({ items }: { items: NotationItem[] }) {
  if (!items?.length) return null;

  return (
    <dl className="math-notation-grid">
      {items.map((n) => (
        <div key={n.symbol} className="math-notation-item">
          <dt>
            <Latex math={n.symbol.replace(/\\\\/g, "\\")} />
          </dt>
          <dd>
            <ProseMath text={n.meaning} stripParens={false} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
