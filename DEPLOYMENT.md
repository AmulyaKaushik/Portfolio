# Backend & Deployment Guide

The portfolio is a static React (Vite) site. The only part that needs a backend is the
**contact form**, which emails each message to you and (optionally) sends the visitor
a confirmation.

## How the backend is organised

```
api/contact.js          Vercel serverless function  → POST /api/contact
server/                 Standalone Express server (same logic, for any Node host)
  src/contact.js        Shared handler: validation → send email → JSON response
  src/validate.js       Field rules, header-injection guard, honeypot check
  src/mailer.js         Sends via SMTP (Gmail, etc.) or Resend's HTTPS API
  src/config.js         Environment variables
  src/app.js            Express app: CORS, helmet, rate limiting, /api/health
  test/                 `npm test` (no real email needed)
src/sections/Contact.jsx  Form: client validation, loading/success/error states
```

Both `api/contact.js` and the Express server call the same `handleContact()`, so the
behaviour is identical wherever you deploy.

**API**

| Method | Path           | Description                                     |
| ------ | -------------- | ----------------------------------------------- |
| POST   | `/api/contact` | `{ name, email, subject, message }` → sends email |
| GET    | `/api/health`  | Health check (Express server only)              |

Responses are `{ success, message, errors? }` with status `200`, `400` (validation),
`429` (rate limited, 5 per 15 min per IP) or `502` (email provider failed).

---

## Step 1 — Get email credentials (needed for every option)

Pick **one** provider.

### Option 1: Gmail SMTP (simplest, free)

1. Turn on 2-Step Verification for the Google account.
2. Go to <https://myaccount.google.com/apppasswords>, create an app password
   (name it "Portfolio"), and copy the 16-character password.
3. You'll use:
   ```
   SMTP_USER=amulyakaushik7@gmail.com
   SMTP_PASS=<the 16-character app password, no spaces>
   CONTACT_TO=amulyakaushik7@gmail.com
   ```
   (`SMTP_HOST` defaults to `smtp.gmail.com`, port 465.)

### Option 2: Resend (HTTPS API, needed where SMTP ports are blocked)

1. Sign up at <https://resend.com> (free tier: 3,000 emails/month).
2. **Domains → Add domain** → `amulyakaushik.co.in`, then add the DNS records it shows
   (in Vercel: *Project → Settings → Domains*, or wherever your DNS is managed).
3. **API Keys → Create** and copy the key.
4. You'll use:
   ```
   RESEND_API_KEY=re_...
   MAIL_FROM=contact@amulyakaushik.co.in
   CONTACT_TO=amulyakaushik7@gmail.com
   ```
   Until the domain is verified, `MAIL_FROM=onboarding@resend.dev` works for testing,
   but Resend will then only deliver to your own account email, so set `AUTO_REPLY=false`.

---

## Step 2 — Choose how to deploy

The site is currently hosted on **Vercel**, so you do **not** need to deploy the backend
separately.

| Option | Separate deploy? | Cost | When to use |
| --- | --- | --- | --- |
| **A. Vercel function (recommended)** | No | Free | Site stays on Vercel (current setup) |
| B. Separate Express API | Yes | Free–$7/mo | You want a standalone API / might move off Vercel |
| C. One Node server for site + API | No | Varies | You move the whole site to Render, Railway, a VPS, etc. |

### Option A — Vercel (recommended, no separate backend)

Vercel automatically turns `api/contact.js` into a serverless function at
`/api/contact` on the same domain, so there's no CORS setup and no cold-start server to wake.

1. In Vercel: **Project → Settings → Environment Variables**, add (for *Production*,
   and *Preview* if you want previews to send email):

   | Name | Value |
   | --- | --- |
   | `SMTP_USER` | `amulyakaushik7@gmail.com` |
   | `SMTP_PASS` | Gmail app password |
   | `CONTACT_TO` | `amulyakaushik7@gmail.com` |
   | `AUTO_REPLY` | `true` (optional; `false` to skip the visitor confirmation) |

   Or use `RESEND_API_KEY` + `MAIL_FROM` instead of the SMTP variables.
   **Do not set `VITE_API_URL`.**
2. Commit and push; Vercel redeploys. (Env var changes only apply to new deployments, so
   use **Deployments → Redeploy** if you add them after the push.)
3. Test: submit the form on the live site, or
   ```bash
   curl -X POST https://www.amulyakaushik.co.in/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"you@example.com","subject":"Test","message":"Hello from curl"}'
   ```
4. If it fails: **Vercel → Project → Logs**, filter by `/api/contact`.

Rate limiting in the function is per warm instance (best effort). If the form is ever
spammed, add a rule in **Vercel → Firewall → Rate Limiting** for `/api/contact`.

### Option B — Deploy the Express API separately

Frontend stays on Vercel; the API runs on its own host, e.g. `https://portfolio-api.onrender.com`.

> **Render's free tier blocks outbound SMTP** (ports 25/465/587) and sleeps after
> 15 minutes idle (the first message after a sleep takes ~30–60 s). On the free tier, use
> **Resend** (`RESEND_API_KEY`). Gmail SMTP works on paid Render instances, Railway's paid
> plans, Fly.io and VPSs.

**On Render** (similar on Railway / Fly.io):

1. *New → Web Service* → connect the GitHub repo.
2. Settings:
   - **Root Directory:** `server`
   - **Runtime:** Node (22.9 or newer)
   - **Build Command:** `npm ci`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/health`
3. Environment variables:
   ```
   NODE_ENV=production
   RESEND_API_KEY=re_...                # or SMTP_* on a host that allows SMTP
   MAIL_FROM=contact@amulyakaushik.co.in
   CONTACT_TO=amulyakaushik7@gmail.com
   ALLOWED_ORIGINS=https://www.amulyakaushik.co.in,https://amulyakaushik.co.in
   ```
   (`PORT` is set by the host automatically.)
4. Deploy, then open `https://<your-api>.onrender.com/api/health`; you should get `{"status":"ok"}`.
5. Point the frontend at it: in **Vercel → Environment Variables** add
   `VITE_API_URL=https://<your-api>.onrender.com` and redeploy. This is a *build-time*
   variable, so it only applies after a new build.
6. Optional: delete `api/contact.js` so there's only one backend.

### Option C — One Node server for the site and the API

The Express server can also serve the built frontend, so one service hosts everything.

- **Build Command:** `npm ci && npm run build && npm ci --prefix server`
- **Start Command:** `npm start --prefix server`
- **Environment:** `SERVE_STATIC=true`, plus the email variables from Step 1.
  No `VITE_API_URL` or `ALLOWED_ORIGINS` needed (same origin).

Then point your domain's DNS at that host instead of Vercel.

---

## Local development

```bash
# one-time
npm install
npm install --prefix server
cp server/.env.example server/.env      # fill in SMTP_* or RESEND_API_KEY

# two terminals
npm run dev:api     # Express API on http://localhost:3001
npm run dev         # Vite on http://localhost:5173 (proxies /api → :3001)
```

Run the backend tests (they don't send real email):

```bash
npm test --prefix server
```

## Environment variable reference

| Variable | Default | Purpose |
| --- | --- | --- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | `smtp.gmail.com` / `465` / `true` | SMTP server |
| `SMTP_USER` / `SMTP_PASS` | — | SMTP login (Gmail app password) |
| `RESEND_API_KEY` | — | Use Resend instead of SMTP |
| `MAIL_FROM` | `SMTP_USER` | Sender address |
| `CONTACT_TO` | `amulyakaushik7@gmail.com` | Where messages are delivered |
| `OWNER_NAME` | `Amulya Kaushik` | Name used in the auto-reply |
| `AUTO_REPLY` | `true` | Send visitors a confirmation email |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MINUTES` | `5` / `15` | Submissions per IP per window |
| `ALLOWED_ORIGINS` | your domains + localhost | CORS (Express server only) |
| `SERVE_STATIC` | `false` | Express also serves `dist/` (Option C) |
| `TRUST_PROXY` | `1` | Proxies in front of Express, for real client IPs |
| `PORT` | `3001` | Express port (5000 clashes with macOS AirPlay) |
| `VITE_API_URL` (frontend) | empty | API base URL, only for Option B |

## Troubleshooting

- **"Couldn't reach the server"**: wrong or missing `VITE_API_URL` (Option B), the API is
  asleep or down, or `ALLOWED_ORIGINS` doesn't include the exact site origin (check the
  browser console for a CORS error).
- **502 "couldn't be sent"**: the email provider rejected the request; check the server logs.
  - `Invalid login` / `EAUTH`: use a Gmail *app password*, not your normal password.
  - Timeout connecting to SMTP: the host blocks SMTP ports, so switch to Resend.
  - Resend `403`: `MAIL_FROM` isn't on a verified domain.
- **Messages land in spam**: use Resend with a verified domain (it adds SPF/DKIM), or reply
  once from Gmail so it learns the sender.
