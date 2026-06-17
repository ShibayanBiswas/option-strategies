import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import { strategies, chapterStrategies, categories, optionsIntro, greeksIntro, basicOptions } from "./data/strategies.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const PYTHON_URL = process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000";

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  let python = "down";
  let strategyCount = 0;
  try {
    const { data } = await axios.get(`${PYTHON_URL}/health`, { timeout: 2000 });
    python = "ok";
    strategyCount = data.strategies || 0;
  } catch {
    python = "down";
  }
  res.json({ status: "ok", node: "ok", python, strategies: chapterStrategies.length, computable: strategyCount });
});

app.get("/api/intro", (_req, res) => {
  res.json({ optionsIntro, greeksIntro, basicOptions });
});

app.get("/api/categories", (_req, res) => {
  res.json(categories);
});

app.get("/api/strategies", (req, res) => {
  const scope = req.query.scope;
  const list = scope === "chapter" ? chapterStrategies : strategies;
  res.json(
    list.map(({ id, name, section, category, outlook, risk, hasPayoff }) => ({
      id,
      name,
      section,
      category,
      outlook,
      risk,
      hasPayoff,
    }))
  );
});

app.get("/api/strategies/:id", (req, res) => {
  const strategy = strategies.find((s) => s.id === req.params.id);
  if (!strategy) return res.status(404).json({ error: "Strategy not found" });
  res.json(strategy);
});

app.post("/api/payoff", async (req, res) => {
  try {
    const { data } = await axios.post(`${PYTHON_URL}/payoff`, req.body, { timeout: 10000 });
    res.json(data);
  } catch (err) {
    const status = err.response?.status || 503;
    res.status(status).json({
      error: err.response?.data?.detail || "Python analytics service unavailable",
    });
  }
});

app.listen(PORT, () => {
  console.log(`OptionLab API on http://localhost:${PORT} (${chapterStrategies.length} strategies)`);
});
