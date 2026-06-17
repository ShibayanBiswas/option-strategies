import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

interface LatexProps {
  math: string;
  block?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function Latex({ math, block = false, fullWidth = false, className = "" }: LatexProps) {
  const normalized = math.replace(/\\\\/g, "\\");

  if (block) {
    return (
      <div
        className={`math-equation-full math-compact serif-math ${fullWidth ? "w-full" : ""} ${className}`}
      >
        <BlockMath math={normalized} />
      </div>
    );
  }
  return (
    <span className={`math-inline ${className}`}>
      <InlineMath math={normalized} />
    </span>
  );
}
