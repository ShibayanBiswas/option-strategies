import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories, fetchIntro, fetchStrategies, type StrategySummary } from "../api/client";
import { GlassCard, Stat } from "../components/GlassCard";
import { NotationGrid } from "../components/NotationGrid";
export function HomePage() {
  const [strategies, setStrategies] = useState<StrategySummary[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [notation, setNotation] = useState<{ symbol: string; meaning: string }[]>([]);

  useEffect(() => {
    fetchStrategies("chapter").then((r) => setStrategies(r.data));
    fetchCategories().then((r) => setCategories(r.data));
    fetchIntro().then((r) => {
      const intro = r.data as { optionsIntro?: { math?: { notation?: { symbol: string; meaning: string }[] } } };
      setNotation(intro.optionsIntro?.math?.notation ?? []);
    });
  }, []);

  const interactive = strategies.filter((s) => s.hasPayoff).length;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-surface-card via-surface-raised to-surface p-8 lg:p-12"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-accent-cyan text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Proprietary Options Analytics</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            <span className="gradient-text">Options Strategy</span>
            <br />
            <span className="text-white">Analytics Platform</span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed mb-8">
            Live payoff engines, component leg overlays, vectorised Greeks, and intuitive multi-paragraph guides for every
            structure—from single options to complex spreads.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/strategies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-surface font-semibold hover:opacity-90 transition-opacity"
            >
              Explore Strategies <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/intro"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-surface-border text-slate-300 hover:bg-surface-raised transition-colors"
            >
              Foundations & Greeks
            </Link>
          </div>
        </div>
      </motion.section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Strategies" value={strategies.length} tone="cyan" />
        <Stat label="Live Payoff Charts" value={interactive} tone="emerald" />
        <Stat label="Categories" value={categories.length} tone="violet" />
        <Stat label="Greek Sensitivities" value={5} tone="amber" />
      </div>

      {notation.length > 0 && (
        <GlassCard delay={0.05}>
          <h2 className="text-lg font-semibold text-white mb-1 font-serif">Symbol Reference</h2>
          <p className="text-slate-500 text-sm mb-4 font-serif">
            Standard notation used across payoff charts, strategy cards, and Greek panels.
          </p>
          <NotationGrid items={notation} />
        </GlassCard>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {[
          {
            icon: TrendingUp,
            title: "Directional & Income",
            desc: "Covered calls, protective puts, collars—live charts with leg highlights and breakeven metrics.",
            to: "/strategies?cat=income-hedge",
          },
          {
            icon: Zap,
            title: "Volatility Structures",
            desc: "Straddles, strangles, butterflies—profile diagrams for vega and gamma by leg.",
            to: "/strategies?cat=volatility",
          },
          {
            icon: Sparkles,
            title: "Spreads & Synthetics",
            desc: "Bull/bear spreads, combos, and boxes—component payoffs overlaid on net P/L.",
            to: "/strategies?cat=spreads",
          },
        ].map((card, i) => (
          <GlassCard key={card.title} delay={i * 0.1}>
            <card.icon className="w-8 h-8 text-accent-cyan mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
            <p className="text-slate-400 text-sm mb-4">{card.desc}</p>
            <Link to={card.to} className="text-accent-cyan text-sm hover:underline inline-flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
