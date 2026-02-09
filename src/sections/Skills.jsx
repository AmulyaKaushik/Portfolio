import { motion } from "framer-motion";
import {
  SiPython,
  SiC,
  SiCplusplus,
  SiJavascript,
  SiHtml5,
  SiCss3,
  SiReact,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiMysql,
  SiTensorflow,
  SiScikitlearn,
  SiGit,
  SiGithub,
  SiLinux,
  SiPostman,
} from "react-icons/si";
import { FaBrain, FaProjectDiagram } from "react-icons/fa";

/* ------------------ Skill Icon Component ------------------ */
function SkillIcon({ name, Icon }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-600/20 to-red-950/20">
        <Icon className="h-6 w-6 text-red-500" />
      </div>
      <span className="text-sm text-white/80">{name}</span>
    </motion.div>
  );
}

/* ------------------ Main Skills Section ------------------ */
export default function Skills() {
  const skills = [
    { name: "Python", Icon: SiPython },
    { name: "C", Icon: SiC },
    { name: "C++", Icon: SiCplusplus },
    { name: "JavaScript", Icon: SiJavascript },
    { name: "HTML", Icon: SiHtml5 },
    { name: "CSS", Icon: SiCss3 },
    { name: "React", Icon: SiReact },
    { name: "Tailwind CSS", Icon: SiTailwindcss },
    { name: "Node.js", Icon: SiNodedotjs },
    { name: "Express.js", Icon: SiExpress },
    { name: "MongoDB", Icon: SiMongodb },
    { name: "SQL", Icon: SiMysql },
    { name: "Machine Learning", Icon: FaBrain },
    { name: "Deep Learning", Icon: FaProjectDiagram },
    { name: "TensorFlow", Icon: SiTensorflow },
    { name: "scikit-learn", Icon: SiScikitlearn },
    { name: "REST APIs", Icon: SiPostman },
    { name: "Git", Icon: SiGit },
    { name: "GitHub", Icon: SiGithub },
    { name: "Linux", Icon: SiLinux },
  ];

  return (
    <section
      id="skills"
      className="py-24 bg-black/40"
    >
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
          Skills & Technologies
        </h2>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {skills.map((skill) => (
            <SkillIcon
              key={skill.name}
              name={skill.name}
              Icon={skill.Icon}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
