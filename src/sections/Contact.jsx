import { Mail, Github, Linkedin } from "lucide-react";

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-24 bg-black/40"
    >
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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
                className="flex items-center gap-3 hover:text-blue-400 transition"
              >
                <Mail size={20} />
                amulyakaushik7@gmail.com
              </a>

              <a
                href="https://github.com/AmulyaKaushik"
                target="_blank"
                className="flex items-center gap-3 hover:text-blue-400 transition"
              >
                <Github size={20} />
                github.com/AmulyaKaushik
              </a>

              <a
                href="https://www.linkedin.com/in/amulya-kaushik"
                target="_blank"
                className="flex items-center gap-3 hover:text-blue-400 transition"
              >
                <Linkedin size={20} />
                linkedin.com/in/amulya-kaushik
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <form className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <input
              type="email"
              placeholder="Your Email"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <input
              type="text"
              placeholder="Subject"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <textarea
              placeholder="Your Message"
              rows="5"
              required
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 focus:outline-none focus:border-blue-400"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
            >
              Send Message
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}
