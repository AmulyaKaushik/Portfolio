import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

export default function Hero() {
  const roles = [
    "Computer Science Engineer",
    "Software Developer",
    "Open Source Enthusiast",
  ];

  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center pt-24 relative overflow-hidden">
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-pink-600/20" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Hi, I’m{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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
            className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition"
          >
            View Projects
          </a>

          <a
            href="#contact"
            className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Contact Me
          </a>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6">
          <a
            href="https://github.com/AmulyaKaushik"
            target="_blank"
            className="hover:text-blue-400 transition"
          >
            <Github size={24} />
          </a>

          <a
            href="https://www.linkedin.com/in/amulya-kaushik/"
            target="_blank"
            className="hover:text-blue-400 transition"
          >
            <Linkedin size={24} />
          </a>

          <a
            href="mailto:amulyakaushik7@gmail.com"
            className="hover:text-blue-400 transition"
          >
            <Mail size={24} />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
