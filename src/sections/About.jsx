import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function StatCard({ label, value, suffix = "" }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className="pulse-red-bg bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center"
    >
      <motion.h3
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="text-3xl font-extrabold text-red-500"
      >
        {inView ? value : 0}
        {suffix}
      </motion.h3>

      <p className="mt-2 text-sm text-gray-300">
        {label}
      </p>
    </div>
  );
}

export default function About() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      ref={ref}
      id="about"
      className="py-24 max-w-6xl mx-auto px-6"
    >
      {/* Section Heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
        About Me
      </h2>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="grid md:grid-cols-2 gap-10 items-center"
      >
        {/* Left: Image / Avatar (2:1 ratio, shows entire image) */}
        <div className="w-full mx-auto">
          <div className="aspect-[2/1] w-full rounded-3xl overflow-hidden bg-gray-800">
            <img
              src="/Amulya_image.jpeg"
              alt="Portrait of Amulya Kaushik"
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right: Glass Card Content */}
        <div className="pulse-red-bg bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10 text-gray-300 leading-relaxed space-y-4">
          <p>
            I am a B.Tech Computer Science student at Jaypee Institute of
            Information Technology (expected graduation: May 2027) with a
            strong interest in building modern, scalable web applications
            and solving real-world problems using technology.
          </p>

          <p>
            My journey into tech started with programming fundamentals
            and competitive coding, evolving into full-stack and
            machine-learning projects. I enjoy building user-friendly
            products with React, Node.js, and modern UI tooling.
          </p>

          <p>
            I recently worked as a freelance Frontend Developer (Imagine
            Pharma Solutions), developing and deploying a production
            website. I keep learning new technologies, with interests in
            GenAI, full stack development, and system design.
          </p>
        </div>
      </motion.div>
            {/* Stats */}
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Years of Coding" value={3} suffix="+" />
        <StatCard label="Projects Completed" value={12} suffix="+" />
        <StatCard label="Technologies Used" value={20} suffix="+" />
        <StatCard label="GitHub Contributions" value={200} suffix="+" />
      </div>

    </section>
  );
}
