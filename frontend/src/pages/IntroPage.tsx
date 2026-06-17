import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchIntro } from "../api/client";
import { capParagraphs } from "../utils/capParagraphs";
import { BasicOptionLab } from "../components/BasicOptionLab";
import { GlassCard } from "../components/GlassCard";
import { FormulaDeck } from "../components/FormulaDeck";
import { GreeksExplorer } from "../components/GreeksExplorer";
import { MathBlock } from "../components/MathBlock";
import { MoneynessCards, MoneynessTable, ResearchSection } from "../components/ResearchLayout";
import { ProseMath } from "../components/ProseMath";

type MoneynessData = {
  title: string;
  paragraphs: string[];
  table: { instrument: string; itm: string; atm: string; otm: string }[];
  cards: { label: string; abbr: string; callDef: string; putDef: string; tone: "itm" | "atm" | "otm" }[];
  equations: string[];
};

type IntroData = {
  optionsIntro: {
    title: string;
    subtitle: string;
    abstract: string;
    paragraphs: string[];
    math: {
      title: string;
      context: string;
      notation: { symbol: string; meaning: string }[];
      equations: string[];
    };
    moneyness: MoneynessData;
    labNote: string;
  };
    greeksIntro: {
    title: string;
    subtitle: string;
    paragraphs?: string[];
    notation?: { symbol: string; meaning: string }[];
    directionalLatex?: Record<string, string>;
    bsEquations?: Array<{ latex: string; context?: string; notation?: { symbol: string; meaning: string }[] }>;
    greeks: Array<{
      symbol: string;
      name: string;
      formula: string;
      formulaContext?: string;
      formulaNotation?: { symbol: string; meaning: string }[];
      paragraphs?: string[];
      callProfile?: string;
      putProfile?: string;
    }>;
  };
  basicOptions: Parameters<typeof BasicOptionLab>[0]["options"];
};

export function IntroPage() {
  const [data, setData] = useState<IntroData | null>(null);

  useEffect(() => {
    fetchIntro().then((r) => setData(r.data as IntroData));
  }, []);

  if (!data) {
    return <div className="text-slate-500 animate-pulse font-serif">Loading monograph…</div>;
  }

  const { optionsIntro: intro, greeksIntro } = data;

  return (
    <article className="research-doc max-w-7xl mx-auto space-y-10 no-scrollbar overflow-x-hidden pb-12">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="research-paper-head"
      >
        <p className="research-doc-type">{intro.subtitle}</p>
        <h1 className="research-doc-title">{intro.title}</h1>
        <p className="research-doc-author">By Shibayan Biswas</p>
        <div className="research-abstract">
          <span className="research-abstract-label">Abstract</span>
          <p><ProseMath text={intro.abstract} /></p>
        </div>
      </motion.header>

      <GlassCard delay={0.02} className="research-paper-body">
        <ResearchSection number="§1" title="Foundations And Terminal Payoffs">
          <div className="research-prose">
            {capParagraphs(intro.paragraphs).map((p, i) => (
              <p key={i}><ProseMath text={p} /></p>
            ))}
          </div>
          <MathBlock
            title={intro.math.title}
            context={intro.math.context}
            notation={intro.math.notation}
            equations={intro.math.equations}
            maxEquations={2}
            compact
          />
        </ResearchSection>

        <ResearchSection number="§2" title="Moneyness: In-The-Money, At-The-Money, Out-Of-The-Money">
          <div className="research-prose">
            {capParagraphs(intro.moneyness.paragraphs).map((p, i) => (
              <p key={i}><ProseMath text={p} /></p>
            ))}
          </div>
          <MoneynessCards items={intro.moneyness.cards} />
          <MoneynessTable rows={intro.moneyness.table} />
          <MathBlock
            title={intro.moneyness.title}
            context="Compact moneyness reference—conditions and value split. Each symbol is defined below the equation."
            equations={intro.moneyness.equations}
            maxEquations={1}
            compact
          />
        </ResearchSection>

        <p className="research-lab-note">{intro.labNote}</p>
      </GlassCard>

      <ResearchSection number="§3" title="Interactive Single-Leg Laboratory">
        <BasicOptionLab options={data.basicOptions} />
      </ResearchSection>

      <GlassCard delay={0.08} className="research-paper-body">
        <ResearchSection number="§4" title="Option Greeks And Net Sensitivities">
          <p className="research-doc-type mb-4">{greeksIntro.subtitle}</p>
          <div className="research-prose">
            {capParagraphs(greeksIntro.paragraphs || []).map((p, i) => (
              <p key={i}><ProseMath text={p} /></p>
            ))}
          </div>
          <MathBlock
            title="Definition 4.1 — European Pricing"
            context="Primary call and put values with auxiliary variables d_1 and d_2. Notation for each equation appears directly beneath its context line."
            notation={greeksIntro.notation}
            equations={greeksIntro.bsEquations || []}
            maxEquations={2}
            compact
          />
          {greeksIntro.directionalLatex && (
            <FormulaDeck
              formulas={greeksIntro.directionalLatex}
              title="Net Sensitivities"
              compact
            />
          )}
          <div className="mt-10">
            <GreeksExplorer greeks={data.greeksIntro.greeks} />
          </div>
        </ResearchSection>
      </GlassCard>
    </article>
  );
}
