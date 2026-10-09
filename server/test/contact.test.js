import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { validateContact } from "../src/validate.js";

const valid = {
  name: "Jane Doe",
  email: "jane@example.com",
  subject: "Hello there",
  message: "I would like to talk about a project.",
};

async function withServer(options, fn) {
  const server = createApp(options).listen(0);
  await new Promise((r) => server.once("listening", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    server.close();
  }
}

function post(base, body, headers = {}) {
  return fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("validateContact accepts a valid submission and trims input", () => {
  const { data, errors, isSpam } = validateContact({ ...valid, name: "  Jane Doe " });
  assert.deepEqual(errors, {});
  assert.equal(isSpam, false);
  assert.equal(data.name, "Jane Doe");
});

test("validateContact rejects missing, short and malformed fields", () => {
  const { errors } = validateContact({ name: "J", email: "nope", subject: "", message: "short" });
  assert.deepEqual(Object.keys(errors).sort(), ["email", "message", "name", "subject"]);
});

test("validateContact blocks header injection", () => {
  const { errors } = validateContact({ ...valid, subject: "Hi\r\nBcc: victim@example.com" });
  assert.ok(errors.subject);
});

test("health endpoint responds", async () => {
  await withServer({}, async (base) => {
    const res = await fetch(`${base}/api/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, "ok");
  });
});

test("valid submission sends email", async () => {
  const sent = [];
  await withServer({ sendContactEmails: async (d) => sent.push(d) }, async (base) => {
    const res = await post(base, valid);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).success, true);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].email, "jane@example.com");
  });
});

test("invalid submission returns 400 with field errors", async () => {
  const sent = [];
  await withServer({ sendContactEmails: async (d) => sent.push(d) }, async (base) => {
    const res = await post(base, { ...valid, email: "bad" });
    assert.equal(res.status, 400);
    assert.ok((await res.json()).errors.email);
    assert.equal(sent.length, 0);
  });
});

test("honeypot submissions are silently dropped", async () => {
  const sent = [];
  await withServer({ sendContactEmails: async (d) => sent.push(d) }, async (base) => {
    const res = await post(base, { ...valid, website: "http://spam.example" });
    assert.equal(res.status, 200);
    assert.equal(sent.length, 0);
  });
});

test("mail failure returns 502", async () => {
  await withServer(
    { sendContactEmails: async () => { throw new Error("SMTP down"); } },
    async (base) => {
      const res = await post(base, valid);
      assert.equal(res.status, 502);
      assert.equal((await res.json()).success, false);
    }
  );
});

test("malformed JSON returns 400", async () => {
  await withServer({}, async (base) => {
    const res = await post(base, "{not json");
    assert.equal(res.status, 400);
  });
});

test("CORS allows known origins only", async () => {
  await withServer({}, async (base) => {
    const ok = await fetch(`${base}/api/health`, { headers: { Origin: "http://localhost:5173" } });
    assert.equal(ok.headers.get("access-control-allow-origin"), "http://localhost:5173");
    const bad = await fetch(`${base}/api/health`, { headers: { Origin: "https://evil.example" } });
    assert.equal(bad.headers.get("access-control-allow-origin"), null);
  });
});

test("rate limit kicks in after the configured number of requests", async () => {
  await withServer({ sendContactEmails: async () => {} }, async (base) => {
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(base, valid)).status);
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
  });
});
