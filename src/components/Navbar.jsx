import { useState, useEffect } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("about");

  useEffect(() => {
    const ids = ["about", "skills", "projects", "contact"];
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry with largest intersectionRatio
        let best = null;
        entries.forEach((e) => {
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        });
        if (best && best.isIntersecting) {
          setActive(best.target.id);
        }
      },
      { threshold: [0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const Link = ({ href, children, id }) => (
    <a
      href={href}
      className={`hover:text-red-500 transition ${active === id ? "text-red-500" : ""}`}
      onClick={() => setMobileOpen(false)}
    >
      {children}
    </a>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo / Name */}
        <span className="text-xl font-bold text-red-500">Amulya Kaushik</span>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-sm">
          <Link href="#about" id="about">About</Link>
          <Link href="#skills" id="skills">Skills</Link>
          <Link href="#projects" id="projects">Projects</Link>
          <Link href="#contact" id="contact">Contact</Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-white/80 hover:text-red-500"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-black/80 backdrop-blur border-t border-white/10">
          <div className="px-6 py-4 flex flex-col gap-4">
            <Link href="#about" id="about">About</Link>
            <Link href="#skills" id="skills">Skills</Link>
            <Link href="#projects" id="projects">Projects</Link>
            <Link href="#contact" id="contact">Contact</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
