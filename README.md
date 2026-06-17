# Option Strategies Dashboard

**Author:** Shibayan Biswas

An interactive research monograph for **56 equity option strategies** — live payoff
diagrams, Black–Scholes Greeks, directional analytics, and typeset payoff/breakeven
identities.

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
engine.

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

Analytics checks live under `backend/python/scripts` (Node + Python services must be running):

```powershell
cd backend\python
.\venv\Scripts\python.exe scripts\verify_payoffs.py
.\venv\Scripts\python.exe scripts\verify_greeks.py
```

---

## Deploy on Vercel (frontend)

This app has **three services**. Vercel hosts the **React frontend** only; the Node
gateway and Python engine must run elsewhere (e.g. [Render](https://render.com) or
[Railway](https://railway.app)).

### Step 1 — Deploy backends

**Python engine** (Render Web Service example):

- Root directory: `backend/python`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Note the public URL, e.g. `https://your-python.onrender.com`

**Node gateway** (Render Web Service example):

- Root directory: `backend/node`
- Build: `npm install`
- Start: `node src/index.js`
- Environment variable: `PYTHON_URL=https://your-python.onrender.com`
- Note the public URL, e.g. `https://your-node.onrender.com`

### Step 2 — Deploy frontend to Vercel

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (auto-detected).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:

   | Name            | Value                              |
   | --------------- | ---------------------------------- |
   | `VITE_API_URL`  | `https://your-node.onrender.com`   |

7. Deploy.

The frontend reads `VITE_API_URL` at build time and sends all `/api` calls to your Node
gateway. Ensure the Node service allows CORS from your Vercel domain (already enabled
in the Python service; add your Vercel origin to Node if needed).

### Step 3 — SPA routing

`frontend/vercel.json` rewrites all routes to `index.html` so React Router works on
refresh (e.g. `/strategies/covered-call`).

### Local production preview

```powershell
cd frontend
$env:VITE_API_URL="http://localhost:4000"
npm run build
npm run preview
```

---

## Prerequisites

- **Windows** with PowerShell.
- **Node.js** and **Python 3.11+** — both are bundled under `tools/` and `backend/python/venv`,
  so no global install is normally required. `run.ps1` falls back to a system install if present.
