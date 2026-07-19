import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCategories, fetchIntro, fetchStrategies, type StrategySummary } from "../api/client";
import { GlassCard, Stat } from "../components/GlassCard";
import { NotationGrid } from "../components/NotationGrid";
import { staggerDelay } from "../motion/cardMotion";

export function HomePage() {
  const [strategies, setStrategies] = useState<StrategySummary[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [notation, setNotation] = useState<{ symbol: string; meaning: string }[]>([]);

  useEffect(() => {
    fetchStrategies("chapter").then((r) => setStrategies(r.data));
    fetchCategories().then((r) =>
      setCategories(r.data.filter((c: { id: string; name: string }) => c.id !== "basics" && !/single\s*leg/i.test(c.name)))
    );
    fetchIntro().then((r) => {
      const intro = r.data as { optionsIntro?: { math?: { notation?: { symbol: string; meaning: string }[] } } };
      setNotation(intro.optionsIntro?.math?.notation ?? []);
    });
  }, []);

  const interactive = strategies.filter((s) => s.hasPayoff).length;

  return (
    <div className="w-full space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-ar-gold/35 bg-ar-surface p-8 lg:p-12 shadow-ar hero-desk">
        <div className="absolute inset-0 bg-gradient-to-br from-ar-gold/20 via-transparent to-ar-maroon/15 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-ar-gold text-sm mb-4 font-semibold">
            <Sparkles className="w-4 h-4 text-ar-gold" />
            <span>Anand Rathi Wealth · Options Desk</span>
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight mb-4 font-display">
            <span className="gradient-text">Option Strategies</span>
            <br />
            <span className="text-ar-ink">Analytics Platform</span>
          </h1>
          <p className="text-ar-muted max-w-3xl text-lg leading-relaxed mb-8">
            Live payoff engines, component leg overlays, Black–Scholes Greeks, and typeset identities for every
            structure—from single options to complex spreads.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/strategies"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ar-gold text-ar-ink font-semibold hover:bg-ar-gold-dark hover:text-white transition-colors shadow-ar"
            >
              Explore Strategies <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/intro"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-ar-gold/50 bg-ar-gold/10 text-ar-ink hover:bg-ar-gold/20 transition-colors font-medium"
            >
              Foundations &amp; Greeks
            </Link>
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Strategies" value={strategies.length} tone="cyan" delay={0.05} />
        <Stat label="Live Payoff Charts" value={interactive} tone="emerald" delay={0.1} />
        <Stat label="Categories" value={categories.length} tone="violet" delay={0.15} />
        <Stat label="Greek Sensitivities" value={5} tone="amber" delay={0.2} />
      </div>

      {notation.length > 0 && (
        <GlassCard delay={0.05} inView>
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
          <GlassCard key={card.title} delay={staggerDelay(i, 0.08)} inView>
            <card.icon className="w-8 h-8 text-ar-gold mb-4" />
            <h3 className="text-lg font-semibold text-ar-ink mb-2">{card.title}</h3>
            <p className="text-ar-muted text-sm mb-4">{card.desc}</p>
            <Link
              to={card.to}
              className="text-ar-gold text-sm hover:text-ar-gold-dark inline-flex items-center gap-1 font-semibold transition-colors"
            >
              View <ArrowRight className="w-3 h-3" />
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
