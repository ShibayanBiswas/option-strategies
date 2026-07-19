import { useState } from "react";
import { GREEK_META, GREEK_ORDER, type GreekKey } from "./greekTheme";
import { ProseMath } from "./ProseMath";
import { Latex } from "./Latex";

export interface LaymanGreekBlock {
  key: GreekKey;
  title: string;
  plain: string;
  strategyTip: string;
  formula?: string;
}

export function LaymanGreekCards({ blocks }: { blocks: LaymanGreekBlock[] }) {
  const [active, setActive] = useState<GreekKey>(blocks[0]?.key ?? "delta");
  const block = blocks.find((b) => b.key === active) ?? blocks[0];
  if (!block) return null;

  const meta = GREEK_META[block.key];
  const Icon = meta.icon;

  return (
    <div className="layman-greek-panel">
      <p className="layman-greek-intro">
        Tap each sensitivity for a plain-English explanation—no prior options math required. Live numeric Greeks appear in the tiles and charts below.
      </p>
      <div className="layman-greek-tabs">
        {blocks.map((b) => {
          const m = GREEK_META[b.key];
          const TabIcon = m.icon;
          return (
            <button
              key={b.key}
              type="button"
              onClick={() => setActive(b.key)}
              className={`layman-greek-tab layman-tab-${b.key} ${active === b.key ? "layman-greek-tab-active" : ""}`}
            >
              <TabIcon className="w-4 h-4" strokeWidth={1.75} />
              <span className="layman-tab-symbol">{m.symbol}</span>
            </button>
          );
        })}
      </div>
      <div className={`layman-greek-card layman-card-${block.key}`}>
        <div className="layman-greek-card-head">
          <div className={`layman-greek-badge layman-badge-${block.key}`}>
            <Icon className="w-5 h-5" strokeWidth={1.5} />
            <span className="layman-greek-symbol">{meta.symbol}</span>
          </div>
          <h4 className="layman-greek-title">{block.title}</h4>
        </div>
        <p className="layman-greek-plain">
          <ProseMath text={block.plain} />
        </p>
        <div className="layman-greek-tip">
          <span className="layman-greek-tip-label">For This Strategy</span>
          <p>
            <ProseMath text={block.strategyTip} />
          </p>
        </div>
        {block.formula && (
          <div className="layman-greek-formula">
            <Latex math={block.formula} block fullWidth />
          </div>
        )}
      </div>
    </div>
  );
}

/** Compact row showing all five keys for quick reference */
export function LaymanGreekLegend() {
  return (
    <div className="layman-greek-legend">
      {GREEK_ORDER.map((key) => {
        const m = GREEK_META[key];
        return (
          <span key={key} className={`layman-legend-pill layman-tab-${key}`}>
            <span className="font-semibold italic">{m.symbol}</span> {m.name}
          </span>
        );
      })}
    </div>
  );
}
