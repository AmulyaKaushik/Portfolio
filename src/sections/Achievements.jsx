import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function AchievementCard({ title, date, description }) {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="pulse-red-bg bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-bold">{title}</h4>
          <p className="text-sm text-gray-400">{date}</p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-300">{description}</p>
    </motion.div>
  );
}

export default function Achievements() {
  const items = [
    {
      title: "Winner — BITBOX 6.0 Hackathon",
      date: "Apr 2026",
      description:
        "Built a decentralized blockchain security system for detecting smart contract vulnerabilities; focused on static analysis and fuzzing.",
    },
  ];

  return (
    <section id="achievements" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
          Achievements
        </h2>

          <div className="relative">
            <div className="space-y-4">
              {items.map((a, i) => (
                <AchievementCard key={i} {...a} />
              ))}
            </div>
          </div>
      </div>
    </section>
  );
}
