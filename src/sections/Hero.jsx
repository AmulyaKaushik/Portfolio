import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

// The role is derived from the clock so the looping copy of the hero (see App)
// always shows the same role as the original.
const ROLE_INTERVAL = 2500;

const roles = [
  "Computer Science Engineer",
  "Software Developer",
  "Open Source Enthusiast",
];

const roleAt = () => Math.floor(Date.now() / ROLE_INTERVAL) % roles.length;

export default function Hero({ id = "home", clone = false }) {
  const [currentRole, setCurrentRole] = useState(roleAt);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole(roleAt());
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id={id}
      aria-hidden={clone || undefined}
      inert={clone || undefined}
      className="min-h-screen flex items-center justify-center pt-24 relative overflow-hidden"
    >
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-black/10 to-black/20" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Hi, I’m{" "}
          <span className="bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
            Amulya Kaushik
          </span>
        </h1>

        {/* Animated Role */}
        <motion.p
          key={currentRole}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl text-gray-300 mb-6"
        >
          {roles[currentRole]}
        </motion.p>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <a
            href="#projects"
            className="glow-red-hover px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 transition"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="glow-red-hover px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Contact Me
          </a>

          <a
            href="/Amulya_Kaushik_Resume.pdf"
            download
            className="glow-red-hover px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            Download Resume
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6">
          <a
            href="https://github.com/AmulyaKaushik"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="hover:text-red-500 transition"
          >
            <Github size={24} />
          </a>

          <a
            href="https://www.linkedin.com/in/amulya-kaushik"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
            className="hover:text-red-500 transition"
          >
            <Linkedin size={24} />
          </a>

          <a
            href="mailto:amulyakaushik7@gmail.com"
            aria-label="Send email to Amulya Kaushik"
            className="hover:text-red-500 transition"
          >
            <Mail size={24} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
