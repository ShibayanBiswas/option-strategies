import { motion } from "framer-motion";
import { useState } from "react";
import { fmtGreekValue, GREEK_META, GREEK_ORDER, type GreekKey } from "./greekTheme";
import { formatLegLabel } from "../utils/chartFormat";
import { ProseMath } from "./ProseMath";

interface GreeksPanelProps {
  aggregate: Record<string, number> | null;
  legs?: Record<string, unknown>[];
  onSelectGreek?: (key: GreekKey | null) => void;
}

export function GreeksPanel({ aggregate, legs, onSelectGreek }: GreeksPanelProps) {
  const [selected, setSelected] = useState<GreekKey | null>("delta");

  if (!aggregate) return null;

  const handleSelect = (key: GreekKey) => {
    const next = selected === key ? null : key;
    setSelected(next);
    onSelectGreek?.(next);
  };

  return (
    <div className="greek-panel space-y-5">
      <div className="greek-tile-grid">
        {GREEK_ORDER.map((key, i) => {
          const g = GREEK_META[key];
          const val = aggregate[key] ?? 0;
          const Icon = g.icon;
          const isActive = selected === key;
          return (
            <motion.button
              key={key}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(key)}
              className={`greek-tile greek-tile-${key} ${isActive ? "greek-tile-active" : ""}`}
            >
              <div className="greek-tile-glow" aria-hidden />
              <div className="greek-tile-top">
                <span className={`greek-tile-symbol ${g.accent}`}>{g.symbol}</span>
                <Icon className={`greek-tile-icon ${g.accent}`} strokeWidth={1.75} />
              </div>
              <span className="greek-tile-name">{g.name}</span>
              <motion.span
                key={val}
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="greek-tile-value"
              >
                {fmtGreekValue(key, val)}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {legs && legs.length > 0 && (
        <div className="greek-leg-table-wrap">
          <div className="greek-leg-table-head">
            <span>Leg breakdown</span>
            {selected && (
              <span className={`greek-leg-highlight-tag greek-tag-${selected}`}>
                Highlighting {GREEK_META[selected].symbol}
              </span>
            )}
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="greek-leg-table">
              <thead>
                <tr>
                  <th>Leg</th>
                  <th>Side</th>
                  {GREEK_ORDER.map((k) => (
                    <th key={k} className={selected === k ? `greek-col-active greek-col-${k}` : ""}>
                      {GREEK_META[k].symbol}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {legs.map((leg, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="greek-leg-row"
                  >
                    <td className="greek-leg-name" title={formatLegLabel(String(leg.label ?? leg.type))}>
                      <ProseMath text={formatLegLabel(String(leg.label ?? leg.type))} stripParens={false} />
                    </td>
                    <td>
                      <span
                        className={`greek-side-badge ${
                          leg.direction === "long" ? "greek-side-long" : "greek-side-short"
                        }`}
                      >
                        {leg.direction === "long" ? "L" : "S"}
                      </span>
                    </td>
                    {GREEK_ORDER.map((k) => (
                      <td
                        key={k}
                        className={`greek-leg-val ${selected === k ? `greek-col-active greek-col-${k}` : ""}`}
                      >
                        {fmtGreekValue(k, Number(leg[k]))}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
