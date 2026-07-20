# Option Strategies Dashboard

Interactive research desk for **60 equity option strategies** — live payoff diagrams, Black–Scholes Greeks, directional analytics, and typeset payoff / breakeven identities.

Styled to match the [Anand Rathi Primary SP Dashboard](https://sp-dashboard-eta.vercel.app/) (gold / maroon, light & dark). Metrics display in **INR**.

---

## What’s in the product

| Surface | What you get |
| ------- | ------------ |
| **Introduction & Greeks** | Foundations, moneyness, single-leg lab, BS identities, interactive Greek explorer |
| **Strategies catalog** | Filterable monograph list with live Nifty-scaled defaults |
| **Strategy page** | Structure panel, parameter sliders, live payoff + Greeks charts, directional compass, payoff formalism |
| **Market** | Nifty 50 ATM scaling (Yahoo `^NSEI`); IST trading-day cache; badge + defaults refresh on focus / periodically |

### Desk behaviour (current)

- **Live params** — sliders debounce into `POST /api/payoff`; charts, max P/L, breakevens, and Greeks stay in sync. Moving `S0` recenters the spot window; **Reset** forces a fresh Nifty quote. When ATM moves (or the IST day rolls) and you have not customized sliders, defaults rescale automatically.
- **Payoff math** — textbook / notebook default identities are unchanged. Premiums (`C` / `D` / `H`) and strikes move the curve as expected.
- **KaTeX** — gold-highlighted math atoms (including trailing premiums like `C` in `K_2 - K_1 - C`); stacked `\ln(S/K)` fractions; clean subscripts / superscripts.
- **Payoff Formalism** — united identities (net payoff, breakeven, max profit, max loss) in one FormulaDeck with shared notation.
- **Dropdowns** — most formula / Greek folds start **collapsed**; important decks (**Payoff Formalism**, basic-lab terminal payoff) start **open**. Greek fold toggles are gold buttons with chevrons.
- **Greek guides** — short lead paragraph on screen; **Read more** holds three detailed paragraphs per Greek (Δ, Γ, Θ, ν, ρ), with symmetric call/put wording.

---

## Architecture (Vercel-only)

Everything deploys on **one Vercel project**. No Render, Railway, or separate Python host.

```
frontend/                 React + Vite + TypeScript UI     → static on Vercel
backend/node/             Express API + strategy catalog
  src/analytics/          Embedded Black–Scholes engine    → /api serverless
  scripts/                verify-greeks.mjs, verify-payoffs.mjs
api/index.js              Vercel entry that mounts Express
```

Payoffs and Greeks run in-process inside the Node API on the same deployment.

---

## Deploy on Vercel (complete guide)

This repo is configured for a **single Vercel project**. Frontend is static; `/api/*` is one Express serverless function with the embedded Black–Scholes engine and live Nifty defaults.

### Prerequisites

- GitHub repo access (`origin` remote)
- A [Vercel](https://vercel.com) account linked to that GitHub account
- Node 18+ locally if you want to smoke-test before deploy

### 1. Push to GitHub

```bash
git add -A
git commit -m "Your message"
git push -u origin main
```

### 2. Import the project

1. Open [vercel.com/new](https://vercel.com/new).
2. Import **this repository**.
3. **Root Directory**: leave as repository root (`.`) — do **not** set it to `frontend`.
4. Framework preset can stay **Other** / auto; `vercel.json` overrides commands.

### 3. Build settings (from `vercel.json`)

| Setting | Value |
| ------- | ----- |
| Install Command | `npm install && npm --prefix frontend install && npm --prefix backend/node install` |
| Build Command | `npm --prefix frontend run build` |
| Output Directory | `frontend/dist` |
| Serverless function | `api/index.js` (includes `backend/node/**`) |

Rewrites:

- `/api/*` → Express (`destination: /api`)
- all other routes → SPA `index.html` (React Router)

### 4. Environment variables

**None required for production.**

| Variable | Needed? | Notes |
| -------- | ------- | ----- |
| `VITE_API_URL` | No | Leave unset so the browser calls same-origin `/api` |
| Market keys | No | Nifty spot is fetched server-side from Yahoo (`^NSEI`) with a cached fallback |

If you previously set `VITE_API_URL` to Render/Railway, **remove it** so the UI does not call a dead host.

### 5. Deploy

Click **Deploy**. After the build succeeds:

- App: `https://<project>.vercel.app`
- Health: `https://<project>.vercel.app/api/health`
- Nifty: `https://<project>.vercel.app/api/market/nifty`

Expect `health` JSON roughly like `{ "status": "ok", "node": "ok", "market": { "symbol": "NIFTY 50", "atm": ... } }`.

### 6. Optional: production domain

Vercel → Project → **Settings → Domains** → add your custom domain and follow DNS instructions.

### 7. Redeploy after changes

Every push to the connected branch (usually `main`) triggers a new deployment. Or use **Deployments → Redeploy** in the Vercel UI.

### 8. Local full-stack parity

```bash
# from repo root
npx vercel dev
```

Or the two-terminal workflow:

```bash
npm install && npm run start          # API :4000
npm --prefix frontend run dev         # UI :5173 (proxies /api → :4000)
```

### Troubleshooting

| Symptom | Fix |
| ------- | --- |
| `/api/*` 404 or HTML | Root Directory must be repo root; confirm `api/index.js` is deployed; open `/api/health` |
| UI calls wrong host | Remove `VITE_API_URL` from Vercel env and redeploy |
| Blank SPA routes | Confirm SPA rewrite in `vercel.json` for non-API paths |
| Cold start / timeout | Function `maxDuration` is 30s; first Nifty fetch may take a second |
| Nifty offline | API falls back to last cache / static ATM; payoffs still compute |
| “Could not load this strategy” | Open `/api/health` then `/api/strategies/<id>` — both must return JSON, not HTML |

Prefer `vercel dev` from the repo root for full-stack local parity with production routing.

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
| Nifty quote | http://localhost:4000/api/market/nifty |

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

With the Node API available (or using the engine directly):

```bash
cd backend/node

# Smoke one payoff
node -e "import { computePayoff } from './src/analytics/index.js'; console.log(computePayoff('long-call',{S0:100,K:100,D:5,T:0.25,r:0.05,sigma:0.25,spotMin:50,spotMax:150}).metrics)"

# Full Greeks audit (unit BS + all strategies)
node scripts/verify-greeks.mjs

# Defaults + slider sensitivity (K / D / C / S0 / H)
node scripts/verify-payoffs.mjs
```

Both verify scripts should print `ALL … CHECKS PASSED`.

---

## Key API routes

| Method | Path | Purpose |
| ------ | ---- | ------- |
| `GET` | `/api/health` | Liveness + market peek |
| `GET` | `/api/market/nifty` | Live / cached Nifty meta |
| `GET` | `/api/intro` | Intro monograph + basic options (Nifty-scaled) |
| `GET` | `/api/strategies` | Strategy list |
| `GET` | `/api/strategies/:id?payoff=1` | Monograph + optional seeded payoff |
| `POST` | `/api/payoff` | Body `{ strategyId, params }` → spots, payoffs, Greeks, directional |

---

## Repository layout (UI)

```
frontend/src/
  pages/           Home, Intro, Strategies, StrategyDetail
  components/      PayoffChart, Greeks*, FormulaDeck, ParamControls, Latex, …
  utils/           syncSpotWindow, paramConstraints, equationsToFormulaRecord, mathProse
backend/node/src/
  analytics/       engine, greeks, multiExpiry
  data/            catalog, notebookDefaults, equationMeta, introData
  market/          nifty scaling
```
