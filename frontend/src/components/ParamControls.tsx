import { useId } from "react";
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

function formatParam(value: number | undefined, step: number): string {
  if (value == null || Number.isNaN(value)) return "—";
  if (step >= 1) return value.toFixed(0);
  if (step >= 0.1) return value.toFixed(1);
  if (step >= 0.01) return value.toFixed(2);
  return value.toFixed(3);
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function ParamControls({
  schema,
  values,
  onChange,
  onReset,
  horizontal = false,
  showStrikeHint = false,
}: ParamControlsProps) {
  const baseId = useId();
  const wrapperClass = horizontal
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
    : "space-y-5";

  return (
    <div className="space-y-4">
      {(onReset || showStrikeHint) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {showStrikeHint && (
            <p className="text-xs text-ar-subtle font-serif">
              Levels track live Nifty; sliders keep strike order valid. Payoff identities are unchanged.
            </p>
          )}
          {onReset && (
            <button type="button" onClick={onReset} className="param-reset-btn">
              Reset to live Nifty defaults
            </button>
          )}
        </div>
      )}

      <div className={wrapperClass}>
        {schema.map((field) => {
          const raw = values[field.key] ?? field.min;
          const display = formatParam(raw, field.step);
          const inputId = `${baseId}-${field.key}`;
          return (
            <div key={field.key} className="param-control-card">
              <div className="flex justify-between items-center gap-2 mb-2">
                <label htmlFor={inputId} className="text-sm text-ar-muted font-serif">
                  <ProseMath text={field.label} stripParens={false} />
                </label>
                <input
                  id={inputId}
                  type="number"
                  className="param-number-input"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={Number.isFinite(raw) ? raw : field.min}
                  onChange={(e) => {
                    const next = parseFloat(e.target.value);
                    if (!Number.isFinite(next)) return;
                    onChange(field.key, clamp(next, field.min, field.max));
                  }}
                  aria-label={`${field.label} precise value`}
                />
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={clamp(Number.isFinite(raw) ? raw : field.min, field.min, field.max)}
                onChange={(e) => onChange(field.key, parseFloat(e.target.value))}
                className="param-range w-full"
              />
              <div className="flex justify-between text-[10px] text-ar-subtle mt-1 font-serif tabular-nums">
                <span>{formatParam(field.min, field.step)}</span>
                <span className="text-ar-gold font-mono text-[11px]">{display}</span>
                <span>{formatParam(field.max, field.step)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
