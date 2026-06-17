# Option Strategies Dashboard

An interactive research monograph for **56 equity option strategies** — live payoff
diagrams, Black–Scholes Greeks, directional analytics, and typeset payoff/breakeven
identities. Every default payoff reproduces the reference notebook exactly, and every
breakeven / max-profit / max-loss identity is transcribed from the reference paper.

- **Payoff parity:** [`chenenen13/Trading-Strategies` → `Trading_strategies_Options.ipynb`](https://github.com/chenenen13/Trading-Strategies/blob/main/Trading%20strategies%20implemented%20on%20Python/options/Trading_strategies_Options.ipynb)
- **Identity source:** Z. Kakushadze & J. A. Serur, *151 Trading Strategies* (2018), §2 (`Research Paper.pdf`)

---

## Quick start (Windows / PowerShell)

From the project root, one command installs dependencies and launches all three services:

```powershell
.\run.ps1
```

This opens `http://localhost:5173` automatically. The launcher provisions the Python
virtual environment, installs Node dependencies (Python `:8000`, Node `:4000`,
frontend `:5173`), and starts each service in its own window.

### URLs

| Service        | URL                                  |
| -------------- | ------------------------------------ |
| Dashboard      | http://localhost:5173                |
| Intro / Greeks | http://localhost:5173/intro          |
| Strategies     | http://localhost:5173/strategies     |
| Node API       | http://localhost:4000/api/health     |
| Python API     | http://localhost:8000/docs           |

---

## Architecture

```
frontend/        React + Vite + TypeScript UI (KaTeX, Recharts, framer-motion)   :5173
backend/node/    Express API gateway + strategy catalog / prose / identities      :4000
backend/python/  FastAPI analytics — payoffs & Black–Scholes Greeks (NumPy/SciPy) :8000
run.ps1          Full-stack launcher (installs deps + starts all three services)
tools/node/      Bundled Node runtime (no global install required)
```

The frontend calls the Node gateway, which proxies analytics requests to the Python
engine. Strategy defaults, spot-axis limits, and leg definitions mirror the reference
notebook; the payoff/breakeven/max-profit/max-loss identities mirror the reference paper.

---

## Manual run (each service in its own terminal)

Use this if you prefer to run services individually or `run.ps1` is unavailable. Run
each block from the **project root** in a separate PowerShell window.

**1. Python analytics (`:8000`)**

```powershell
cd backend\python
.\venv\Scripts\python.exe -m pip install -r requirements.txt
.\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

> First time only: create the venv with `python -m venv venv` before installing.

**2. Node API gateway (`:4000`)**

```powershell
cd backend\node
..\..\tools\node\npm.cmd install
..\..\tools\node\node.exe src\index.js
```

**3. React frontend (`:5173`)**

```powershell
cd frontend
..\tools\node\npm.cmd install
..\tools\node\npm.cmd run dev
```

### Stopping / restarting from scratch

```powershell
# Stop whatever is bound to the app ports, then relaunch
foreach ($p in 8000,4000,5173) {
  Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}
.\run.ps1
```

---

## Verification

Payoff parity and notebook alignment are checked by scripts under `backend/python/scripts`
(the Node + Python services must be running for the live checks):

```powershell
cd backend\python
# Element-wise payoff comparison vs the notebook f_T formulas (all 56 strategies)
.\venv\Scripts\python.exe scripts\verify_payoffs.py
# Spot-grid / default-parameter alignment checks
.\venv\Scripts\python.exe scripts\verify_notebook.py
```

`verify_payoffs.py` rebuilds the exact spot grid and confirms each engine payoff matches
the notebook formula to within transport rounding (≈5e-5). Calendar/diagonal spreads use
Black–Scholes near-leg valuation (same as the notebook); iron condors are paper-defined
and not present in the notebook.

---

## Prerequisites

- **Windows** with PowerShell.
- **Node.js** and **Python 3.11+** — both are bundled under `tools/` and `backend/python/venv`,
  so no global install is normally required. `run.ps1` falls back to a system install if present.
