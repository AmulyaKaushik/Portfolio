// Reads and validates environment variables once at startup.

const DEFAULT_ORIGINS = [
  "https://www.amulyakaushik.co.in",
  "https://amulyakaushik.co.in",
  "http://localhost:5173",
  "http://localhost:4173",
];

function list(value) {
  return (value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function bool(value, fallback) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

const env = process.env;

const config = {
  port: Number(env.PORT) || 3001,
  isProduction: env.NODE_ENV === "production",

  // Browsers on these origins may call the API. Not needed when the frontend
  // is served by this same server (same origin).
  allowedOrigins: list(env.ALLOWED_ORIGINS).length
    ? list(env.ALLOWED_ORIGINS)
    : DEFAULT_ORIGINS,

  // When true, also serve the built frontend (../dist) so one service hosts both.
  serveStatic: bool(env.SERVE_STATIC, false),

  // Number of reverse proxies in front of the app (Render, Railway, Nginx...),
  // so rate limiting sees the real client IP.
  trustProxy: Number(env.TRUST_PROXY ?? 1),

  rateLimit: {
    windowMinutes: Number(env.RATE_LIMIT_WINDOW_MINUTES) || 15,
    max: Number(env.RATE_LIMIT_MAX) || 5,
  },

  mail: {
    // When set, email goes through Resend's HTTPS API instead of SMTP.
    resendApiKey: env.RESEND_API_KEY,
    host: env.SMTP_HOST || "smtp.gmail.com",
    port: Number(env.SMTP_PORT) || 465,
    secure: bool(env.SMTP_SECURE, (Number(env.SMTP_PORT) || 465) === 465),
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    // Address the "from" header uses; most providers require it to be the SMTP account.
    from: env.MAIL_FROM || env.SMTP_USER,
    // Where contact form messages are delivered.
    to: env.CONTACT_TO || "amulyakaushik7@gmail.com",
    // Send the visitor a short "thanks, I got your message" email.
    autoReply: bool(env.AUTO_REPLY, true),
    ownerName: env.OWNER_NAME || "Amulya Kaushik",
  },
};

export function missingMailConfig() {
  if (env.RESEND_API_KEY) return env.MAIL_FROM ? [] : ["MAIL_FROM"];
  return ["SMTP_USER", "SMTP_PASS"].filter((key) => !env[key]);
}

export default config;
