import { displayProse } from "../utils/formatText";
import { splitMathProse } from "../utils/mathProse";
import { Latex } from "./Latex";
import type { ReactNode } from "react";

interface ProseMathProps {
  text: string | undefined;
  className?: string;
  /** When false, skip parenthetical stripping (e.g. pure notation cells) */
  stripParens?: boolean;
}

/** Numbers, signed ints, percents, and comparison operators left in plain text. */
const EMPH_RE = /(\$?-?\d[\d,]*(?:\.\d+)?%?|[<>≤≥≠≈]=?|\+1\b|(?<![\d.A-Za-z])-1\b)/g;

function emphasizePlain(content: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(EMPH_RE.source, "g");
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) {
      nodes.push(<span key={`${keyPrefix}-t${last}`}>{content.slice(last, m.index)}</span>);
    }
    const token = m[0];
    const isNum = /^\$?-?\d/.test(token);
    nodes.push(
      <span key={`${keyPrefix}-e${m.index}`} className={isNum ? "prose-num" : "prose-op"}>
        {token}
      </span>
    );
    last = m.index + token.length;
  }
  if (last < content.length) {
    nodes.push(<span key={`${keyPrefix}-t${last}`}>{content.slice(last)}</span>);
  }
  return nodes.length ? nodes : [<span key={`${keyPrefix}-empty`}>{content}</span>];
}

/** Render prose with inline LaTeX for spot, strike, Greeks, comparisons, and numbers */
export function ProseMath({ text, className = "", stripParens = true }: ProseMathProps) {
  const source = stripParens ? displayProse(text ?? "") : (text ?? "");
  const parts = splitMathProse(source);

  return (
    <span className={`prose-math ${className}`}>
      {parts.map((part, i) =>
        part.type === "math" ? (
          <Latex key={i} math={part.content} className="prose-math-inline" emphasize />
        ) : (
          <span key={i}>{emphasizePlain(part.content, `p${i}`)}</span>
        )
      )}
    </span>
  );
}
