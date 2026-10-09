// Vercel serverless function: POST /api/contact
// Lets the contact form work when the site is deployed to Vercel, without
// running the separate Express server. Shares its logic with server/.
import { handleContact } from "../server/src/contact.js";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 5;

// Best effort: each warm function instance keeps its own counts. Pair with a
// Vercel Firewall rate-limit rule if the form ever gets abused.
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const ip =
    req.headers["x-real-ip"] ||
    String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    "unknown";
  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ success: false, message: "Too many messages sent. Please try again later." });
  }

  // Vercel parses JSON bodies; a malformed body arrives as a string or undefined.
  const input = req.body && typeof req.body === "object" ? req.body : {};
  const { status, body } = await handleContact(input);
  res.status(status).json(body);
}
