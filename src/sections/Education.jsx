export default function Education() {
  return (
    <section
      id="education"
      className="py-24 max-w-6xl mx-auto px-6"
    >
      {/* Section Heading */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center bg-gradient-to-r from-red-600 to-red-950 bg-clip-text text-transparent">
        Education
      </h2>

      <div className="grid gap-8">
        
        {/* B.Tech */}
        <div className="glow-red-hover bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold">
            B.Tech in Computer Science Engineering
          </h3>

          <p className="text-gray-400 mt-1">
            Jaypee Institute of Information Technology, Noida
          </p>

          <p className="text-sm text-gray-400 mt-2">
            2023 – 2027 
          </p>

          <p className="mt-3 text-gray-300">
            CGPA: <span className="font-semibold">7.7 / 10</span>
          </p>

          <p className="mt-3 text-sm text-gray-400">
            Relevant Coursework: Data Structures & Algorithms, 
            Operating Systems, Database Management Systems, 
            Computer Networks, Software Engineering
          </p>
        </div>

        {/* 12th */}
        <div className="glow-red-hover bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold">
            Senior Secondary (Class XII)
          </h3>

          <p className="text-gray-400 mt-1">
            Gurukul The School, Ghaziabad
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Year of Completion: 2023
          </p>

          <p className="mt-3 text-gray-300">
            Percentage: <span className="font-semibold">91%</span>
          </p>
        </div>

        {/* 10th */}
        <div className="glow-red-hover bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold">
            Secondary (Class X)
          </h3>

          <p className="text-gray-400 mt-1">
            Gurukul The School, Ghaziabad
          </p>

          <p className="text-sm text-gray-400 mt-2">
            Year of Completion: 2021
          </p>

          <p className="mt-3 text-gray-300">
            Percentage: <span className="font-semibold">94%</span>
          </p>
        </div>

      </div>
    </section>
  );
}
