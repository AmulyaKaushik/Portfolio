// Sends contact form emails through SMTP (e.g. Gmail) or, when RESEND_API_KEY
// is set, through Resend's HTTPS API — useful on hosts that block SMTP ports.
import config from "./config.js";

const { mail } = config;

let transporterPromise;

// nodemailer is imported lazily so the Resend path needs no extra dependency.
function getTransporter() {
  transporterPromise ??= import("nodemailer").then(({ default: nodemailer }) =>
    nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: { user: mail.user, pass: mail.pass },
    })
  );
  return transporterPromise;
}

async function sendViaSmtp(message) {
  const transporter = await getTransporter();
  await transporter.sendMail(message);
}

async function sendViaResend({ from, to, replyTo, subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mail.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text, html }),
  });
  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  }
}

function send(message) {
  return mail.resendApiKey ? sendViaResend(message) : sendViaSmtp(message);
}

export async function verifyTransport() {
  if (mail.resendApiKey) return "Resend";
  const transporter = await getTransporter();
  await transporter.verify();
  return "SMTP";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function notificationEmail({ name, email, subject, message }, meta) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#222">
      <h2 style="color:#b91c1c;margin-bottom:4px">New portfolio message</h2>
      <p style="color:#666;margin-top:0">${escapeHtml(meta.receivedAt)}</p>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:6px 0;width:90px"><b>Name</b></td><td>${escapeHtml(name)}</td></tr>
        <tr><td style="padding:6px 0"><b>Email</b></td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding:6px 0"><b>Subject</b></td><td>${escapeHtml(subject)}</td></tr>
      </table>
      <div style="margin-top:16px;padding:16px;background:#f6f6f6;border-radius:8px;white-space:pre-wrap">${escapeHtml(message)}</div>
      <p style="color:#999;font-size:12px;margin-top:16px">Reply to this email to answer ${escapeHtml(name)} directly.</p>
    </div>`;

  const text = [
    "New portfolio message",
    `Received: ${meta.receivedAt}`,
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    message,
  ].join("\n");

  return {
    from: `"Portfolio Contact" <${mail.from}>`,
    to: mail.to,
    replyTo: `"${name.replace(/"/g, "")}" <${email}>`,
    subject: `[Portfolio] ${subject}`,
    text,
    html,
  };
}

function autoReplyEmail({ name, email, subject, message }) {
  const firstName = name.split(/\s+/)[0];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#222">
      <p>Hi ${escapeHtml(firstName)},</p>
      <p>Thanks for reaching out! I've received your message and will get back to you as soon as I can.</p>
      <p style="color:#666">For reference, here's what you sent:</p>
      <div style="padding:16px;background:#f6f6f6;border-radius:8px">
        <b>${escapeHtml(subject)}</b>
        <div style="white-space:pre-wrap;margin-top:8px">${escapeHtml(message)}</div>
      </div>
      <p>Best regards,<br/>${escapeHtml(mail.ownerName)}</p>
    </div>`;

  const text = [
    `Hi ${firstName},`,
    "",
    "Thanks for reaching out! I've received your message and will get back to you as soon as I can.",
    "",
    "For reference, here's what you sent:",
    `Subject: ${subject}`,
    message,
    "",
    "Best regards,",
    mail.ownerName,
  ].join("\n");

  return {
    from: `"${mail.ownerName}" <${mail.from}>`,
    to: email,
    replyTo: mail.to,
    subject: `Thanks for your message: ${subject}`,
    text,
    html,
  };
}

export async function sendContactEmails(data) {
  const meta = { receivedAt: new Date().toUTCString() };
  await send(notificationEmail(data, meta));

  // The owner already has the message, so a failed auto-reply is not an error for the visitor.
  if (mail.autoReply) {
    try {
      await send(autoReplyEmail(data));
    } catch (err) {
      console.warn("Auto-reply failed:", err.message);
    }
  }
}
