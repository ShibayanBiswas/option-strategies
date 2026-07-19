/**
 * Vercel serverless entry — Express app with embedded Black–Scholes engine.
 * All /api/* routes are handled in-process (no Render / external Python).
 */
import app from "../backend/node/src/app.js";

export default app;
