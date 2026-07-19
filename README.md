# Option Strategies Dashboard

Interactive research desk for **56 equity option strategies** — live payoff diagrams, Black–Scholes Greeks, directional analytics, and typeset payoff/breakeven identities.

Styled to match the [Anand Rathi Primary SP Dashboard](https://sp-dashboard-eta.vercel.app/) (gold / maroon, light & dark).

---

## Architecture (Vercel-only)

Everything deploys on **one Vercel project**. No Render, Railway, or separate Python host.

```
frontend/                 React + Vite + TypeScript UI     → static on Vercel
backend/node/             Express API + strategy catalog
  src/analytics/          Embedded Black–Scholes engine    → /api serverless
api/[...path].js          Vercel entry that mounts Express
```

Payoffs and Greeks run in-process inside the Node API on the same deployment.

---

## Deploy on Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Leave **Root Directory** as the repository root (not `frontend`).
3. Vercel reads `vercel.json`:
   - Installs root + `frontend` + `backend/node` deps
   - Builds the Vite app into `frontend/dist`
   - Serves `/api/*` via the Express serverless function
   - SPA rewrites for React Router
4. Deploy — **no** `VITE_API_URL` needed (same-origin `/api`).

Prefer `vercel dev` from the repo root for full-stack local parity.

---

## Local development

**Terminal 1 — API (embedded analytics):**

```bash
npm install
npm run start
# → http://localhost:4000/api/health
```

**Terminal 2 — UI:**

```bash
npm --prefix frontend install
npm --prefix frontend run dev
# → http://localhost:5173  (proxies /api → :4000)
```

Windows: `.\setup.ps1` then `.\run.ps1`.

### URLs

| Service    | URL |
| ---------- | --- |
| Dashboard  | http://localhost:5173 |
| Intro      | http://localhost:5173/intro |
| Strategies | http://localhost:5173/strategies |
| API health | http://localhost:4000/api/health |

---

## Theme

Light and dark modes follow Anand Rathi SP desk tokens:

| Token | Light | Dark |
| ----- | ----- | ---- |
| Background | `#f7f7f7` | `#050403` |
| Gold | `#d4b24c` | `#d4b24c` |
| Maroon / accent | `#7a1e2c` | `#c9a882` |
| Ink | `#111` | `#f5f5f4` |

Brand marks live under `frontend/public/brand/` (`arwl-logo.png`, `arwl-logo-white.png`).

---

## Verification

With the Node API running:

```bash
cd backend/node
node -e "import { computePayoff } from './src/analytics/index.js'; console.log(computePayoff('long-call',{S0:100,K:100,D:5,T:0.25,r:0.05,sigma:0.25,spotMin:50,spotMax:150}).metrics)"
```
