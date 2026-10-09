import config, { missingMailConfig } from "./config.js";
import { createApp } from "./app.js";
import { verifyTransport } from "./mailer.js";

const missing = missingMailConfig();
if (missing.length) {
  console.warn(
    `⚠ Missing ${missing.join(", ")}: the contact form will fail until these are set (see .env.example).`
  );
} else {
  verifyTransport()
    .then((provider) => console.log(`✔ Email provider ready (${provider})`))
    .catch((err) => console.warn(`⚠ Email verification failed: ${err.message}`));
}

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
  if (config.serveStatic) console.log("Serving built frontend from ../dist");
});
