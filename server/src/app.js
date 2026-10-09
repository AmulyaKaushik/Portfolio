import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import config from "./config.js";
import { handleContact } from "./contact.js";

const DIST_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../dist"
);

// `sendContactEmails` is injectable so tests can run without a real SMTP server.
export function createApp({ sendContactEmails } = {}) {
  const app = express();

  app.set("trust proxy", config.trustProxy);
  app.disable("x-powered-by");

  // The frontend loads three.js, Google Fonts etc., so only apply a strict CSP
  // to API responses; the static site keeps the browser defaults.
  app.use("/api", helmet());
  app.use(
    "/api",
    cors({
      origin(origin, callback) {
        // Same-origin requests and tools like curl send no Origin header.
        if (!origin || config.allowedOrigins.includes(origin)) callback(null, true);
        else callback(null, false);
      },
      methods: ["GET", "POST"],
    })
  );
  app.use("/api", express.json({ limit: "20kb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", uptime: Math.round(process.uptime()) });
  });

  const contactLimiter = rateLimit({
    windowMs: config.rateLimit.windowMinutes * 60 * 1000,
    limit: config.rateLimit.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many messages sent. Please try again later.",
    },
  });

  app.post("/api/contact", contactLimiter, async (req, res) => {
    const { status, body } = await handleContact(req.body, { sendContactEmails });
    res.status(status).json(body);
  });

  app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "Not found" });
  });

  if (config.serveStatic && fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR, { maxAge: "1h", index: false }));
    // Single-page app: unknown routes get index.html.
    app.get(/.*/, (req, res) => res.sendFile(path.join(DIST_DIR, "index.html")));
  }

  // Malformed JSON and other unexpected errors.
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
      return res
        .status(err.status || 400)
        .json({ success: false, message: "Invalid request body." });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error." });
  });

  return app;
}
