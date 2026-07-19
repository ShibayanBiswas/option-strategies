import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Latex } from "./Latex";
import { ProseMath } from "./ProseMath";

interface ResearchSectionProps {
  number: string;
  title: string;
  children: ReactNode;
  className?: string;
}

/** Numbered research-paper section wrapper */
export function ResearchSection({ number, title, children, className = "" }: ResearchSectionProps) {
  return (
    <section className={`research-section ${className}`}>
      <header className="research-section-head">
        {number ? <span className="research-section-num">{number}</span> : null}
        <h2 className="research-section-title">{title}</h2>
      </header>
      <div className="research-section-body">{children}</div>
    </section>
  );
}

interface MoneynessRow {
  instrument: string;
  itm: string;
  atm: string;
  otm: string;
}

function MathCell({ expr }: { expr: string }) {
  const latex = expr.replace(/≈/g, "\\approx").replace(/</g, "<").replace(/>/g, ">");
  return (
    <td className="research-table-math">
      <Latex math={latex} />
    </td>
  );
}

export function MoneynessTable({ rows }: { rows: MoneynessRow[] }) {
  return (
    <div className="research-table-wrap">
      <table className="research-table">
        <thead>
          <tr>
            <th>Instrument</th>
            <th>In-The-Money</th>
            <th>At-The-Money</th>
            <th>Out-Of-The-Money</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.instrument}>
              <td>{row.instrument}</td>
              <MathCell expr={row.itm} />
              <MathCell expr={row.atm} />
              <MathCell expr={row.otm} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MoneynessCardProps {
  label: string;
  abbr: string;
  callDef: string;
  putDef: string;
  tone: "itm" | "atm" | "otm";
}

export function MoneynessCards({ items }: { items: MoneynessCardProps[] }) {
  return (
    <motion.div
      className="moneyness-grid"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.14 } },
      }}
    >
      {items.map((item) => (
        <motion.article
          key={item.abbr}
          className={`moneyness-card card-shine moneyness-${item.tone}`}
          variants={{
            hidden: { opacity: 0, y: 24, scale: 0.96 },
            show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 22 } },
          }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="moneyness-card-head">
            <span className="moneyness-abbr">{item.abbr}</span>
            <h4 className="moneyness-label">{item.label}</h4>
          </div>
          <dl className="moneyness-defs">
            <div>
              <dt>Call</dt>
              <dd>
                <ProseMath text={item.callDef} stripParens={false} />
              </dd>
            </div>
            <div>
              <dt>Put</dt>
              <dd>
                <ProseMath text={item.putDef} stripParens={false} />
              </dd>
            </div>
          </dl>
        </motion.article>
      ))}
    </motion.div>
  );
}
