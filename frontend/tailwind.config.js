/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ar: {
          bg: "var(--ar-bg)",
          surface: "var(--ar-surface)",
          panel: "var(--ar-panel)",
          ink: "var(--ar-ink)",
          muted: "var(--ar-muted)",
          subtle: "var(--ar-subtle)",
          border: "var(--ar-border)",
          gold: "var(--ar-gold)",
          "gold-light": "var(--ar-gold-light)",
          "gold-dark": "var(--ar-gold-dark)",
          maroon: "var(--ar-maroon)",
          nav: "var(--ar-nav-bg)",
          header: "var(--ar-header-bg)",
          accent: "var(--ar-accent, var(--ar-gold))",
          "chart-bg": "var(--ar-chart-bg)",
        },
        // Back-compat aliases used across existing components
        surface: {
          DEFAULT: "var(--ar-bg)",
          raised: "var(--ar-panel)",
          card: "var(--ar-surface)",
          border: "var(--ar-border)",
        },
        accent: {
          cyan: "var(--ar-gold)",
          emerald: "var(--neon-green)",
          violet: "var(--ar-maroon)",
          amber: "var(--neon-amber)",
        },
      },
      fontFamily: {
        display: ['"Segoe UI"', "system-ui", "sans-serif"],
        serif: ['"Times New Roman"', "Times", "Georgia", "serif"],
        sans: ['"Segoe UI"', "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "ui-monospace", "monospace"],
      },
      boxShadow: {
        ar: "var(--ar-shadow)",
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.9" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      backgroundImage: {
        mesh: "linear-gradient(180deg, var(--ar-mesh-top), var(--ar-mesh-mid) 45%, var(--ar-mesh-bottom))",
      },
    },
  },
  plugins: [],
};
