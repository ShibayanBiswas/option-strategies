import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import { Activity, BookOpen, LayoutDashboard, LineChart, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHealth } from "../api/client";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/intro", label: "Introduction & Greeks", icon: BookOpen },
  { to: "/strategies", label: "Strategies", icon: LineChart },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const [pythonOk, setPythonOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((r) => setPythonOk(r.data.python === "ok"))
      .catch(() => setPythonOk(false));
    const id = setInterval(() => {
      fetchHealth()
        .then((r) => setPythonOk(r.data.python === "ok"))
        .catch(() => setPythonOk(false));
    }, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-surface bg-grid bg-[length:48px_48px]">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass border-r border-surface-border transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-emerald flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 text-surface" />
            </div>
            <div>
              <h1 className="font-semibold text-white leading-tight tracking-tight">OptionLab</h1>
              <p className="text-[11px] text-slate-500">Strategy Analytics Terminal</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 text-white border border-cyan-500/20 shadow-inner"
                    : "text-slate-400 hover:text-white hover:bg-surface-raised/60"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-border">
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${pythonOk ? "bg-emerald-400 animate-pulse" : pythonOk === false ? "bg-rose-500" : "bg-slate-500"}`}
            />
            <span className="text-slate-500">
              Engine {pythonOk ? "Live" : pythonOk === false ? "Offline" : "Connecting…"}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mt-2">OptionLab Analytics Platform</p>
          <p className="text-[10px] text-slate-500 mt-1">
            Author · <span className="text-slate-300">Shibayan Biswas</span>
          </p>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-surface-border px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-surface-raised" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500"
          >
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Live Payoffs</span>
            <span className="px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Greeks Engine</span>
            <span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">Component Legs</span>
          </motion.div>
          <div className="text-xs font-mono text-accent-cyan/80 ml-auto">v1.0</div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
