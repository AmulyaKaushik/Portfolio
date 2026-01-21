import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

/* ------------------ Skill Bar Component ------------------ */
function SkillBar({ name, level }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{name}</span>
        <span>{level}%</span>
      </div>

      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1 }}
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500"
        />
      </div>
    </div>
  );
}

/* ------------------ Skill Category Card ------------------ */
function SkillCategory({ title, skills }) {
  return (
    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-6 text-blue-400">
        {title}
      </h3>

      <div className="space-y-4">
        {skills.map((skill) => (
          <SkillBar
            key={skill.name}
            name={skill.name}
            level={skill.level}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------ Main Skills Section ------------------ */
export default function Skills() {
  return (
    <section
      id="skills"
      className="py-24 bg-black/40"
    >
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Skills & Technologies
        </h2>

        {/* Skills Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          
          <SkillCategory
            title="Frontend"
            skills={[
              { name: "HTML & CSS", level: 90 },
              { name: "JavaScript", level: 88 },
              { name: "React", level: 85 },
              { name: "Tailwind CSS", level: 80 },
            ]}
          />

          <SkillCategory
            title="Backend"
            skills={[
              { name: "Node.js", level: 82 },
              { name: "Express.js", level: 80 },
              { name: "MongoDB", level: 78 },
              { name: "SQL", level: 70 },
            ]}
          />

          <SkillCategory
            title="Tools & Other"
            skills={[
              { name: "Git & GitHub", level: 85 },
              { name: "Linux", level: 70 },
              { name: "REST APIs", level: 80 },
              { name: "Problem Solving", level: 75 },
            ]}
          />

        </div>
      </div>
    </section>
  );
}
