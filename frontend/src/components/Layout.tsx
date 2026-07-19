import { motion } from "framer-motion";
import { NavLink, Outlet } from "react-router-dom";
import { BookOpen, LayoutDashboard, LineChart, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchHealth } from "../api/client";
import { useTheme } from "../theme/ThemeProvider";

const nav = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/intro", label: "Introduction & Greeks", icon: BookOpen },
  { to: "/strategies", label: "Strategies", icon: LineChart },
];

export function Layout() {
  const [open, setOpen] = useState(false);
  const [engineOk, setEngineOk] = useState<boolean | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const check = () =>
      fetchHealth()
        .then((r) => {
          const py = r.data.python;
          setEngineOk(py === "ok" || py === "embedded");
        })
        .catch(() => setEngineOk(false));
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-ar-bg text-ar-ink desk-shell">
      <div className="desk-gold-rail" aria-hidden />
      <header className="sticky top-0 z-40 border-b border-ar-border bg-ar-header backdrop-blur-xl desk-header">
        <div className="mx-auto flex w-full items-center gap-4 px-4 py-3 sm:px-6 lg:px-10 xl:px-12">
          <button
            type="button"
            className="lg:hidden rounded-md p-2 text-ar-muted hover:bg-ar-panel transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <NavLink to="/" className="flex shrink-0 items-center gap-3 group" onClick={() => setOpen(false)}>
            <img
              src={theme === "dark" ? "/brand/arwl-logo-white.png" : "/brand/arwl-logo.png"}
              alt="Anand Rathi — Private Wealth. uncomplicated."
              className="h-9 w-auto sm:h-11"
            />
          </NavLink>

          <div className="hidden min-w-0 flex-1 md:block">
            <h1 className="font-display text-lg font-semibold tracking-tight text-ar-ink sm:text-xl">
              Option Strategies
            </h1>
            <p className="text-[11px] tracking-wide text-ar-subtle">
              Analytics desk · live payoffs &amp; Greeks
            </p>
          </div>

          <nav className="ml-auto hidden items-center gap-1.5 lg:flex">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `desk-nav-link flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm transition-all duration-300 ${
                    isActive
                      ? "bg-ar-gold text-ar-ink shadow-ar border border-ar-gold font-semibold"
                      : "text-ar-muted hover:bg-ar-gold/15 hover:text-ar-ink border border-transparent"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-ar-border bg-ar-surface px-2.5 py-1.5 text-[11px] sm:flex shadow-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  engineOk ? "bg-emerald-600 animate-pulse" : engineOk === false ? "bg-rose-600" : "bg-stone-400"
                }`}
              />
              <span className="text-ar-subtle">
                Engine {engineOk ? "Live" : engineOk === false ? "Offline" : "…"}
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ar-gold/40 bg-ar-surface px-2.5 py-1.5 text-xs font-medium text-ar-ink transition-colors hover:bg-ar-gold/15 shadow-sm"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-ar-gold" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-ar-gold" />
              )}
              <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>

        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-ar-border bg-ar-surface px-4 py-3 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {nav.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isActive ? "bg-ar-gold text-ar-ink font-semibold" : "text-ar-muted hover:bg-ar-gold/10"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        )}
      </header>

      <main className="mx-auto w-full flex-1 px-4 py-6 sm:px-6 lg:px-10 xl:px-12 lg:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-ar-border bg-ar-nav px-4 py-3 text-center text-[11px] text-ar-subtle sm:px-6 lg:px-10 xl:px-12">
        <span className="text-ar-gold font-semibold">Anand Rathi Wealth</span>
        <span className="mx-2 text-ar-gold">·</span>
        Option Strategies Desk
      </footer>
    </div>
  );
}
