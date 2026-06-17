import { displayProse } from "../utils/formatText";
import { splitMathProse } from "../utils/mathProse";
import { Latex } from "./Latex";

interface ProseMathProps {
  text: string | undefined;
  className?: string;
  /** When false, skip parenthetical stripping (e.g. pure notation cells) */
  stripParens?: boolean;
}

/** Render prose with inline LaTeX for spot, strike, and Greek symbols */
export function ProseMath({ text, className = "", stripParens = true }: ProseMathProps) {
  const source = stripParens ? displayProse(text ?? "") : (text ?? "");
  const parts = splitMathProse(source);

  return (
    <span className={`prose-math ${className}`}>
      {parts.map((part, i) =>
        part.type === "math" ? (
          <Latex key={i} math={part.content} className="prose-math-inline" />
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </span>
  );
}
