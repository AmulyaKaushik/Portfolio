import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";

/* ------------------ Single Project Card ------------------ */
function ProjectCard({ title, description, tech, github, live }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-bold mb-2">
          {title}
        </h3>

        <p className="text-gray-400 text-sm mb-4">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tech.map((item) => (
            <span
              key={item}
              className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="flex gap-4">
        <a
          href={github}
          target="_blank"
          className="hover:text-blue-400 transition"
        >
          <Github size={20} />
        </a>

        <a
          href={live}
          target="_blank"
          className="hover:text-blue-400 transition"
        >
          <ExternalLink size={20} />
        </a>
      </div>
    </motion.div>
  );
}

/* ------------------ Main Projects Section ------------------ */
export default function Projects() {
  const projects = [
    {
      title: "Ocean Level Rise Detection",
      description:
        "Sea-Level Forecasting for Coastal Cities using Time-Series Models.",
      tech: ["Python", "NOAA API", "LSTM (Deep Learning)", "Streamlit"],
      github: "https://github.com/AmulyaKaushik/Ocean-Level-Rise-Detection.git",
      live: "https://amulyakaushik-ocean-level-rise-detection-dashboard-euqmss.streamlit.app/",
    },
    {
      title: "WhatsApp Automation",
      description:
        "Automate sending personalized WhatsApp messages to multiple contacts using WhatsApp Web.",
      tech: ["Python", "Selenium WebDriver", "Web Scraping", "Browser Automation"],
      github: "https://github.com/AmulyaKaushik/WhatsApp_Automation.git",
      /*live: "#",*/
    },
    {
      title: "Competitive Coding Tracker",
      description:
        "Tracks Codeforces and LeetCode stats with visual analytics.",
      tech: ["React", "Firebase", "Chart.js"],
      github: "https://github.com/yourusername/cp-tracker",
      live: "https://cp-tracker.vercel.app",
    },
    {
      title: "College ERP System",
      description:
        "Academic management system for students and faculty.",
      tech: ["Django", "PostgreSQL", "Bootstrap"],
      github: "https://github.com/yourusername/college-erp",
      live: "#",
    },
  ];

  return (
    <section
      id="projects"
      className="py-24 max-w-6xl mx-auto px-6"
    >
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Projects
      </h2>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.title}
            {...project}
          />
        ))}
      </div>
    </section>
  );
}
