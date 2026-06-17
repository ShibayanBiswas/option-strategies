import { motion } from "framer-motion";
import type { ParamField } from "../api/client";
import { ProseMath } from "./ProseMath";

interface ParamControlsProps {
  schema: ParamField[];
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  horizontal?: boolean;
}

export function ParamControls({ schema, values, onChange, horizontal = false }: ParamControlsProps) {
  const wrapperClass = horizontal
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    : "space-y-5";

  return (
    <div className={wrapperClass}>
      {schema.map((field, idx) => (
        <motion.div
          key={field.key}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
        >
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-slate-300 font-serif">
              <ProseMath text={field.label} stripParens={false} />
            </label>
            <span className="font-mono text-accent-cyan text-sm tabular-nums">{values[field.key]?.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={values[field.key] ?? field.min}
            onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-surface-border accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-serif">
            <span>{field.min}</span>
            <span>{field.max}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
