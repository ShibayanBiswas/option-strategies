import { motion } from "framer-motion";
import { Search, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCategories, fetchStrategies, type StrategySummary } from "../api/client";
import { Badge } from "../components/GlassCard";
import { ProseMath } from "../components/ProseMath";
import { titleCase } from "../utils/formatText";
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
    fetchStrategies("chapter").then((r) => setStrategies(r.data));
    fetchCategories().then((r) => setCategories(r.data));
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-2">Option Strategies</h1>
        <p className="text-slate-400">
          {catFilter !== "all" ? catName : "Full Library"} · {filtered.length} Strategies · Catalog Order §2.2–§2.57
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search By Name Or Outlook…"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-raised border border-surface-border text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setSearchParams(e.target.value === "all" ? {} : { cat: e.target.value })}
          className="px-4 py-3 rounded-xl bg-surface-raised border border-surface-border text-slate-300 focus:outline-none focus:border-cyan-500/30"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => {
          const categoryLabel = categories.find((c) => c.id === s.category)?.name ?? s.category;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.35) }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/strategies/${s.id}`}
                className="group block h-full rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#0c1018] via-surface-card to-surface-raised p-5 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-semibold text-violet-400/90 shrink-0">
                    §{s.section?.replace("2.", "") ?? "—"}
                  </span>
                  {s.hasPayoff ? <Badge variant="success">Live Chart</Badge> : <Badge>Theory</Badge>}
                </div>
                <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors leading-snug mb-2">
                  {s.name}
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-500/70 mb-3">
                  {categoryLabel}
                </p>
                <div className="space-y-2.5 pt-3 border-t border-slate-800/60">
                  <div className="flex items-start gap-2 text-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500/70 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-slate-500 text-xs block mb-0.5">Outlook</span>
                      <span className="text-slate-200">{titleCase(s.outlook)}</span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-500 text-xs block mb-0.5">Risk</span>
                    <span className="text-slate-300 leading-snug">
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

