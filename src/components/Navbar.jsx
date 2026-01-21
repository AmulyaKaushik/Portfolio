export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo / Name */}
        <span className="text-xl font-bold text-red-500">
          Amulya Kaushik
        </span>

        {/* Links */}
        <div className="hidden md:flex gap-6 text-sm">
          <a href="#about" className="hover:text-red-500 transition">
            About
          </a>
          <a href="#skills" className="hover:text-red-500 transition">
            Skills
          </a>
          <a href="#projects" className="hover:text-red-500 transition">
            Projects
          </a>
          <a href="#contact" className="hover:text-red-500 transition">
            Contact
          </a>
        </div>

      </div>
    </nav>
  );
}
