// Framework-agnostic contact handler, shared by the Express server (server/src/app.js)
// and the Vercel serverless function (api/contact.js).
import { validateContact } from "./validate.js";
import { sendContactEmails as defaultSendContactEmails } from "./mailer.js";

/** Returns { status, body } for a contact form submission. */
export async function handleContact(
  input,
  { sendContactEmails = defaultSendContactEmails } = {}
) {
  const { data, errors, isSpam } = validateContact(input);

  // Pretend it worked so bots don't learn to avoid the honeypot.
  if (isSpam) {
    return { status: 200, body: { success: true, message: "Message sent successfully!" } };
  }

  if (Object.keys(errors).length) {
    return {
      status: 400,
      body: { success: false, message: "Please fix the highlighted fields.", errors },
    };
  }

  try {
    await sendContactEmails(data);
    return {
      status: 200,
      body: { success: true, message: "Message sent successfully! I'll get back to you soon." },
    };
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return {
      status: 502,
      body: {
        success: false,
        message:
          "Sorry, your message couldn't be sent right now. Please try again or email me directly.",
      },
    };
  }
}
