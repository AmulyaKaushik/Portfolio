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
      <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-400" />
      <span className="absolute left-[5px] top-4 w-[2px] h-full bg-white/10" />

      <span className="text-sm text-blue-400 font-semibold">
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
      title: "Building Full Stack Projects",
      description:
        "Developing personal projects using React, Node.js, MongoDB, and focusing on clean UI and scalable code.",
    },
    {
      year: "2024",
      title: "Learning Web Development",
      description:
        "Explored frontend and backend development with React, Tailwind CSS, REST APIs, and Git.",
    },
    {
      year: "2023",
      title: "Programming & DSA Foundations",
      description:
        "Built strong fundamentals in programming and regularly practiced data structures and algorithms.",
    },
    {
      year: "2022",
      title: "Started B.Tech in Computer Science",
      description:
        "Began my journey in computer science and explored various domains of technology.",
    },
  ];

  return (
    <section id="experience" className="py-24 bg-black/40">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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
