/**
 * Vercel serverless entry — Express app with embedded Black–Scholes engine.
 * Mounted at /api via vercel.json rewrite: /api/(.*) → /api
 */
import app from "../backend/node/src/app.js";

export default app;
