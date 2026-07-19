import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { strategies, chapterStrategies, categories, optionsIntro, greeksIntro, basicOptions } from "./data/strategies.js";
import { computePayoff, STRATEGY_LEGS } from "./analytics/index.js";
import {
  buildNiftyParamSchema,
  getNiftyQuote,
  marketMeta,
  scaleParamsToSpot,
} from "./market/nifty.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function applyNiftyToStrategy(strategy, quote) {
  const spot = quote.atm ?? quote.spot;
  return {
    ...strategy,
    defaultParams: scaleParamsToSpot(strategy.defaultParams, spot),
    paramSchema: buildNiftyParamSchema(strategy.paramSchema, spot),
    market: marketMeta(quote),
  };
}

function applyNiftyToBasicOption(opt, quote) {
  const spot = quote.atm ?? quote.spot;
  return {
    ...opt,
    defaultParams: scaleParamsToSpot(opt.defaultParams, spot),
    paramSchema: buildNiftyParamSchema(opt.paramSchema, spot),
  };
}

app.get("/api/health", async (_req, res) => {
  const strategyCount = Object.keys(STRATEGY_LEGS).length;
  let market = null;
  try {
    market = marketMeta(await getNiftyQuote());
  } catch {
    market = null;
  }
  res.json({
    status: "ok",
    node: "ok",
    python: "embedded",
    strategies: chapterStrategies.length,
    computable: strategyCount,
    market,
  });
});

app.get("/api/market/nifty", async (_req, res) => {
  try {
    const quote = await getNiftyQuote();
    res.json(marketMeta(quote));
  } catch (err) {
    res.status(502).json({ error: err.message ?? "Nifty quote failed" });
  }
});

app.get("/api/intro", async (_req, res) => {
  const quote = await getNiftyQuote();
  res.json({
    optionsIntro,
    greeksIntro,
    basicOptions: basicOptions.map((o) => applyNiftyToBasicOption(o, quote)),
    market: marketMeta(quote),
  });
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

app.get("/api/strategies/:id", async (req, res) => {
  const strategy = strategies.find((s) => s.id === req.params.id);
  if (!strategy) return res.status(404).json({ error: "Strategy not found" });
  const quote = await getNiftyQuote();
  res.json(applyNiftyToStrategy(strategy, quote));
});

app.post("/api/payoff", (req, res) => {
  try {
    const { strategyId, params } = req.body;
    if (!strategyId) {
      return res.status(400).json({ error: "strategyId is required" });
    }
    // Engine math unchanged — uses whatever levels the client sends
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
