import { motion } from "framer-motion";
import type { ParamField } from "../api/client";
import { ProseMath } from "./ProseMath";

interface ParamControlsProps {
  schema: ParamField[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  onReset?: () => void;
  horizontal?: boolean;
  showStrikeHint?: boolean;
}

export function ParamControls({
  schema,
  values,
  onChange,
  onReset,
  horizontal = false,
  showStrikeHint = false,
}: ParamControlsProps) {
  const wrapperClass = horizontal
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    : "space-y-5";

  return (
    <div className="space-y-4">
      {(onReset || showStrikeHint) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showStrikeHint && (
            <p className="text-xs text-ar-subtle font-serif">
              Sliders keep strike ordering valid for this structure; payoffs update live from the canonical formulas.
            </p>
          )}
          {onReset && (
            <motion.button
              type="button"
              onClick={onReset}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="param-reset-btn"
            >
              Reset reference defaults
            </motion.button>
          )}
        </div>
      )}

      <div className={wrapperClass}>
        {schema.map((field, idx) => (
          <motion.div
            key={field.key}
            className="param-control-card"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-ar-muted font-serif">
                <ProseMath text={field.label} stripParens={false} />
              </label>
              <motion.span
                key={values[field.key]}
                initial={{ scale: 1.12, color: "#67e8f9" }}
                animate={{ scale: 1, color: "#22d3ee" }}
                transition={{ duration: 0.25 }}
                className="font-mono text-accent-cyan text-sm tabular-nums"
              >
                {values[field.key]?.toFixed(2)}
              </motion.span>
            </div>
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step}
              value={values[field.key] ?? field.min}
              onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
              className="param-range w-full"
            />
            <div className="flex justify-between text-[10px] text-ar-subtle mt-1 font-serif">
              <span>{field.min}</span>
              <span>{field.max}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
