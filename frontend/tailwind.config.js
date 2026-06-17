/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0e17",
          raised: "#111827",
          card: "#151d2e",
          border: "#1e293b",
        },
        accent: {
          cyan: "#22d3ee",
          emerald: "#34d399",
          violet: "#a78bfa",
          amber: "#fbbf24",
        },
      },
      fontFamily: {
        display: ["Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      animation: {
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(34,211,238,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.03) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
