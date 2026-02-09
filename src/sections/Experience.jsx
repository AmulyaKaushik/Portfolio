import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function TimelineItem({ year, title, description }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="relative pl-8 pb-10"
    >
      <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-red-500" />
      <span className="absolute left-[5px] top-4 w-[2px] h-full bg-white/10" />

      <span className="text-sm text-red-500 font-semibold">
        {year}
      </span>

      <h3 className="text-lg font-bold mt-1">
        {title}
      </h3>

      <p className="text-sm text-gray-400 mt-1">
        {description}
      </p>
    </motion.div>
  );
}

export default function Experience() {
  const journey = [
    {
      year: "2025",
      title: "Cybersecurity + Networking",
      description:
        "Learned security basics like auth, OWASP risks, safe API design, and core networking concepts.",
    },
    {
      year: "2025",
      title: "Systems + ML + Automation",
      description:
        "Built an LSTM-based sea-level forecasting app, a C++ Trie autocomplete server, and a Linux shell project while sharpening system design and tooling.",
    },
    {
      year: "2024",
      title: "UI Craft + Tooling",
      description:
        "Improved UI polish, component reuse, and developer workflows with Git and project structure best practices.",
    },
    {
      year: "2024",
      title: "Full Stack Engineering",
      description:
        "Delivered full stack apps with React, Tailwind CSS, REST APIs, databases, and deployment-focused workflows.",
    },
    {
      year: "2023",
      title: "Programming + DSA",
      description:
        "Strengthened programming fundamentals and built problem-solving habits through regular DSA practice.",
    },
    {
      year: "2023",
      title: "Started B.Tech in CSE",
      description:
        "Began my computer science journey and explored core programming concepts and problem solving.",
    },
  ];

  return (
    <section id="experience" className="py-24 bg-black/40">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
          Learning Journey
        </h2>

        <div className="relative">
          {journey.map((item, index) => (
            <TimelineItem key={index} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
