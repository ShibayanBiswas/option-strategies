import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { strategies, chapterStrategies, categories, optionsIntro, greeksIntro, basicOptions } from "./data/strategies.js";
import { computePayoff, STRATEGY_LEGS } from "./analytics/index.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const strategyCount = Object.keys(STRATEGY_LEGS).length;
  res.json({
    status: "ok",
    node: "ok",
    python: "embedded",
    strategies: chapterStrategies.length,
    computable: strategyCount,
  });
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

app.post("/api/payoff", (req, res) => {
  try {
    const { strategyId, params } = req.body;
    if (!strategyId) {
      return res.status(400).json({ error: "strategyId is required" });
    }
    const data = computePayoff(strategyId, params ?? {});
    res.json(data);
  } catch (err) {
    const message = err.message ?? "Payoff computation failed";
    const status = message.startsWith("Unknown strategy") ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

export default app;
export { chapterStrategies };
