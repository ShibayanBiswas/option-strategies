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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-ar-border bg-ar-surface p-8 lg:p-12 shadow-ar"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ar-gold/10 via-transparent to-ar-maroon/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-ar-gold text-sm mb-4 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Anand Rathi Wealth · Options Desk</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight mb-4 font-display">
            <span className="gradient-text">Option Strategies</span>
            <br />
            <span className="text-ar-ink">Analytics Platform</span>
          </h1>
          <p className="text-ar-muted max-w-2xl text-lg leading-relaxed mb-8">
            Live payoff engines, component leg overlays, Black–Scholes Greeks, and typeset identities for every
            structure—from single options to complex spreads.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/strategies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ar-maroon text-ar-ink font-semibold hover:opacity-90 transition-opacity shadow-ar"
            >
              Explore Strategies <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/intro"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ar-border text-ar-ink hover:bg-ar-panel transition-colors"
            >
              Foundations &amp; Greeks
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
          <h2 className="text-lg font-semibold text-ar-ink mb-1 font-serif">Symbol Reference</h2>
          <p className="text-ar-subtle text-sm mb-4">
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
            <card.icon className="w-8 h-8 text-ar-gold mb-4" />
            <h3 className="text-lg font-semibold text-ar-ink mb-2">{card.title}</h3>
            <p className="text-ar-muted text-sm mb-4">{card.desc}</p>
            <Link to={card.to} className="text-ar-maroon text-sm hover:underline inline-flex items-center gap-1 font-medium">
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
