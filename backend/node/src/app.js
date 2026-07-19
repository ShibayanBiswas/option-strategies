import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { strategies, chapterStrategies, categories, optionsIntro, greeksIntro, basicOptions } from "./data/strategies.js";
import { computePayoff, STRATEGY_LEGS } from "./analytics/index.js";
import {
  buildNiftyParamSchema,
  getNiftyQuote,
  marketMeta,
  peekNiftyQuote,
  scaleParamsToSpot,
} from "./market/nifty.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

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

async function safeNiftyQuote() {
  try {
    return await getNiftyQuote();
  } catch {
    return peekNiftyQuote();
  }
}

/** Build API routes once; mount under /api and / for Vercel path variants. */
function buildApiRouter() {
  const router = express.Router();

  router.get("/health", async (_req, res) => {
    try {
      const strategyCount = Object.keys(STRATEGY_LEGS).length;
      let market = null;
      try {
        market = marketMeta(await safeNiftyQuote());
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
    } catch (err) {
      res.status(500).json({ status: "error", error: err.message ?? "health failed" });
    }
  });

  router.get("/market/nifty", async (_req, res) => {
    try {
      const quote = await safeNiftyQuote();
      res.json(marketMeta(quote));
    } catch (err) {
      res.status(502).json({ error: err.message ?? "Nifty quote failed" });
    }
  });

  router.get("/intro", async (_req, res) => {
    try {
      const quote = await safeNiftyQuote();
      res.json({
        optionsIntro,
        greeksIntro,
        basicOptions: basicOptions.map((o) => applyNiftyToBasicOption(o, quote)),
        market: marketMeta(quote),
      });
    } catch (err) {
      res.status(500).json({ error: err.message ?? "intro failed" });
    }
  });

  router.get("/categories", (_req, res) => {
    res.json(categories);
  });

  router.get("/strategies", (req, res) => {
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

  router.get("/strategies/:id", async (req, res) => {
    try {
      const strategy = strategies.find((s) => s.id === req.params.id);
      if (!strategy) return res.status(404).json({ error: "Strategy not found" });

      const quote = await safeNiftyQuote();
      const detail = applyNiftyToStrategy(strategy, quote);

      const wantPayoff =
        req.query.payoff === "1" ||
        req.query.payoff === "true" ||
        req.query.includePayoff === "1";

      if (wantPayoff && strategy.hasPayoff) {
        try {
          const payoff = computePayoff(strategy.id, detail.defaultParams ?? {});
          return res.json({ ...detail, initialPayoff: payoff });
        } catch (err) {
          // Still return monograph if payoff seed fails
          return res.json({
            ...detail,
            initialPayoffError: err.message ?? "payoff seed failed",
          });
        }
      }
      return res.json(detail);
    } catch (err) {
      return res.status(500).json({ error: err.message ?? "Strategy load failed" });
    }
  });

  router.post("/payoff", (req, res) => {
    try {
      const { strategyId, params } = req.body ?? {};
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

  return router;
}

const api = buildApiRouter();
// Primary: browser calls /api/*
app.use("/api", api);
// Fallback: some Vercel rewrites strip the /api prefix before Express sees the URL
app.use("/", api);

export default app;
export { chapterStrategies };
