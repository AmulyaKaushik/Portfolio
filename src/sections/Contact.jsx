import { useState } from "react";
import {
  Mail,
  Github,
  Linkedin,
  Download,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// Empty in dev (Vite proxies /api to the local server) and when the backend
// serves the site itself; set VITE_API_URL when the API lives on another domain.
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const FIELDS = [
  { name: "name", type: "text", placeholder: "Your Name" },
  { name: "email", type: "email", placeholder: "Your Email" },
  { name: "subject", type: "text", placeholder: "Subject" },
  { name: "message", placeholder: "Your Message", rows: 5 },
];

const EMPTY_FORM = { name: "", email: "", subject: "", message: "", website: "" };

// Mirrors the server rules so most mistakes are caught before a request.
function validate({ name, email, subject, message }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
    errors.email = "Please enter a valid email address.";
  if (subject.trim().length < 2) errors.subject = "Please enter a subject.";
  if (message.trim().length < 10)
    errors.message = "Message must be at least 10 characters.";
  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [feedback, setFeedback] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate(form);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length) {
      setStatus("error");
      setFeedback("Please fix the highlighted fields.");
      return;
    }

    setStatus("sending");
    setFeedback("");
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrors(data.errors || {});
        setStatus("error");
        setFeedback(data.message || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setFeedback(data.message);
      setForm(EMPTY_FORM);
    } catch {
      setStatus("error");
      setFeedback(
        "Couldn't reach the server. Please try again or email me directly."
      );
    }
  }

  return (
    <section
      id="contact"
      className="py-24 bg-black/40"
    >
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
          Contact Me
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Contact Info */}
          <div className="space-y-6">
            <p className="text-gray-300">
              I’m always open to discussing new opportunities,
              collaborations, or just having a tech conversation.
              Feel free to reach out!
            </p>

            <div className="space-y-4 text-sm">
              <a
                href="mailto:amulyakaushik7@gmail.com"
                className="flex items-center gap-3 hover:text-red-500 transition"
              >
                <Mail size={20} />
                amulyakaushik7@gmail.com
              </a>

              <a
                href="https://github.com/AmulyaKaushik"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub profile"
                className="flex items-center gap-3 hover:text-red-500 transition"
              >
                <Github size={20} />
                github.com/AmulyaKaushik
              </a>

              <a
                href="https://www.linkedin.com/in/amulya-kaushik"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn profile"
                className="flex items-center gap-3 hover:text-red-500 transition"
              >
                <Linkedin size={20} />
                linkedin.com/in/amulya-kaushik
              </a>

              <a
                href="/Amulya_Kaushik_Resume.pdf"
                download
                className="flex items-center gap-3 hover:text-red-500 transition"
              >
                <Download size={20} />
                Download Resume
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="pulse-red-bg bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4"
          >
            {FIELDS.map(({ name, type, placeholder, rows }) => {
              const Tag = rows ? "textarea" : "input";
              return (
                <div key={name}>
                  <Tag
                    name={name}
                    type={rows ? undefined : type}
                    rows={rows}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    aria-label={placeholder}
                    aria-invalid={Boolean(errors[name])}
                    className={`w-full px-4 py-3 rounded-lg bg-black/40 border focus:outline-none focus:border-red-500 ${
                      errors[name] ? "border-red-500" : "border-white/10"
                    }`}
                  />
                  {errors[name] && (
                    <p className="mt-1 text-xs text-red-400">{errors[name]}</p>
                  )}
                </div>
              );
            })}

            {/* Honeypot: hidden from people, bots fill it and get ignored */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <button
              type="submit"
              disabled={status === "sending"}
              className="glow-red-hover w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>

            {feedback && (
              <p
                role="status"
                className={`flex items-center gap-2 text-sm ${
                  status === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {status === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {feedback}
              </p>
            )}
          </form>

        </div>
      </div>
    </section>
  );
}
