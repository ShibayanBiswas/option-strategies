import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCategories, fetchStrategies, type StrategySummary } from "../api/client";
import { Badge } from "../components/GlassCard";
import { ProseMath } from "../components/ProseMath";
import { titleCase } from "../utils/formatText";
import { cardHover, cardTap, staggerDelay } from "../motion/cardMotion";

function sectionOrder(section?: string): number {
  if (!section) return 9999;
  const parts = String(section).split(".").map(Number);
  return (parts[0] || 0) * 1000 + (parts[1] || 0);
}

export function StrategiesPage() {
  const [strategies, setStrategies] = useState<StrategySummary[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const catFilter = searchParams.get("cat") || "all";

  useEffect(() => {
    fetchStrategies("chapter").then((r) =>
      setStrategies(r.data.filter((s) => s.category !== "basics"))
    );
    fetchCategories().then((r) =>
      setCategories(r.data.filter((c: { id: string; name: string }) => c.id !== "basics" && !/single\s*leg/i.test(c.name)))
    );
  }, []);

  const catalogIndex = useMemo(() => {
    const sorted = [...strategies].sort((a, b) => sectionOrder(a.section) - sectionOrder(b.section));
    const map = new Map<string, number>();
    sorted.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [strategies]);

  const filtered = useMemo(() => {
    return strategies
      .filter((s) => {
        const matchCat = catFilter === "all" || s.category === catFilter;
        const matchQ =
          !query ||
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.outlook.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchQ;
      })
      .sort((a, b) => sectionOrder(a.section) - sectionOrder(b.section));
  }, [strategies, catFilter, query]);

  const catName = categories.find((c) => c.id === catFilter)?.name;
  const catalogTotal = strategies.length || 56;

  return (
    <div className="w-full space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <h1 className="text-3xl font-bold text-ar-ink mb-2 font-display">Option Strategies</h1>
        <p className="text-ar-muted">
          {catFilter !== "all" ? catName : "Full Library"} · {filtered.length} Strategies · Numbered 1–{catalogTotal}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ar-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search By Name Or Outlook…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-ar-surface border border-ar-border text-ar-ink placeholder:text-ar-subtle focus:outline-none focus:border-ar-gold/60 focus:ring-2 focus:ring-ar-gold/25 transition-all shadow-sm"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setSearchParams(e.target.value === "all" ? {} : { cat: e.target.value })}
          className="px-4 py-3 rounded-xl bg-ar-surface border border-ar-border text-ar-muted focus:outline-none focus:border-ar-gold/50 shadow-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((s, i) => {
          const categoryLabel = categories.find((c) => c.id === s.category)?.name ?? s.category;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 26, delay: staggerDelay(i, 0.03, 0.4) }}
              whileHover={cardHover}
              whileTap={cardTap}
            >
              <Link
                to={`/strategies/${s.id}`}
                className="group strategy-card card-shine block h-full rounded-2xl border border-ar-border bg-gradient-to-br from-ar-surface via-surface-card to-surface-raised p-5 hover:border-ar-gold/50 transition-colors duration-300"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-semibold italic text-ar-gold shrink-0 bg-ar-gold/15 px-1.5 py-0.5 rounded">
                    {catalogIndex.get(s.id) ?? i + 1}
                  </span>
                  {s.hasPayoff ? <Badge variant="success">Live Chart</Badge> : <Badge>Theory</Badge>}
                </div>
                <h3 className="font-semibold text-ar-ink group-hover:text-ar-gold transition-colors leading-snug mb-2">
                  {s.name}
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ar-gold mb-3">
                  {categoryLabel}
                </p>
                <div className="space-y-2.5 pt-3 border-t border-ar-gold/20">
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-ar-gold mt-0.5 shrink-0" />
                    <div>
                      <span className="text-ar-subtle text-xs block mb-0.5">Outlook</span>
                      <span className="text-ar-ink">{titleCase(s.outlook)}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-ar-subtle text-xs block mb-0.5">Risk</span>
                    <span className="text-ar-muted leading-snug">
                      <ProseMath text={s.risk} />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
