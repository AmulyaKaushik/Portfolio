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
      className="relative pl-8 pb-8"
    >
      <span className="absolute left-0 top-1 w-3 h-3 rounded-full bg-red-500" />
      <span className="absolute left-[5px] top-4 w-[2px] h-full bg-white/10" />

      <span className="text-sm text-red-500 font-semibold">{year}</span>

      <h3 className="text-lg font-bold mt-1">{title}</h3>

      {Array.isArray(description) ? (
        <ul className="list-disc pl-4 text-sm text-gray-400 mt-2 space-y-1.5 list-outside">
          {description.map((bullet, idx) => (
            <li key={idx} className="leading-relaxed">{bullet}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      )}
    </motion.div>
  );
}

export default function WorkExperience() {
  const work = [
    {
      year: "May 2026 - July 2026",
      title: "Data Analytics Intern — Imarticus Learning (Delhi, India)",
      description: [
        "Analyzed customer behavior and transaction patterns using MySQL to extract insights from real-world datasets.",
        "Executed data preprocessing, cleaning, and transformation workflows inside Jupyter Notebooks to handle anomalies.",
        <span>
          Developed interactive dashboards in{" "}
          <a
            href="https://github.com/AmulyaKaushik/Hotel-Analysis-and-Insights.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600 hover:underline font-semibold"
          >
            Power BI
          </a>{" "}
          to visualize key business trends and performance metrics.
        </span>,
        <span>
          Conducted an{" "}
          <a
            href="https://github.com/AmulyaKaushik/EDA-Space-Mission.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600 hover:underline font-semibold"
          >
            Exploratory Data Analysis (EDA)
          </a>{" "}
          on historical space mission data (1957–2020) using Pandas, NumPy, and Seaborn to analyze launch success patterns and cost distributions.
        </span>,
        <span>
          Developed{" "}
          <a
            href="https://github.com/AmulyaKaushik/ScreenShield.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600 hover:underline font-semibold"
          >
            ScreenShield
          </a>
          , a classical computer vision & machine learning system using FastAPI, OpenCV, and Scikit-Learn to detect display screen recaptures with handcrafted features.
        </span>,
      ],
    },
    {
      year: "Mar 2026 - Apr 2026",
      title: "Frontend Developer (Freelance) — Imagine Pharma Solutions",
      description: [
        "Developed and deployed a production-ready website using React, Vite, Tailwind CSS, and Framer Motion.",
        "Built reusable components and deployed via Vercel.",
      ],
    },
  ];

  return (
    <section id="work" className="py-24 bg-black/40">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
          Work Experience
        </h2>

        <div className="relative">
          {work.map((w, i) => (
            <TimelineItem key={i} year={w.year} title={w.title} description={w.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
