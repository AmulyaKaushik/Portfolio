import { Github, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-24">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Left */}
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Amulya Kaushik. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-6">
          <a
            href="https://github.com/AmulyaKaushik"
            target="_blank"
            className="hover:text-blue-400 transition"
          >
            <Github size={18} />
          </a>

          <a
            href="https://linkedin.com/in/amulya-kaushik"
            target="_blank"
            className="hover:text-blue-400 transition"
          >
            <Linkedin size={18} />
          </a>

          <a
            href="mailto:amulyakaushik7@gmail.com"
            className="hover:text-blue-400 transition"
          >
            <Mail size={18} />
          </a>
        </div>

      </div>
    </footer>
  );
}
