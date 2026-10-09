import { lazy, Suspense, useRef } from "react";
import Navbar from "./components/Navbar";
import ParticleSystem from "./components/ParticleSystem";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import WorkExperience from "./sections/WorkExperience";
import Achievements from "./sections/Achievements";
import Education from "./sections/Education";
import Contact from "./sections/Contact";
import Socials from "./sections/Socials";
import useScrollLoop from "./hooks/useScrollLoop";

// three.js is heavy: load the WebGL background after the page content
const ParticleScene = lazy(() => import("./components/ParticleScene"));

export default function App() {
  const loopRef = useRef(null);
  useScrollLoop(loopRef);

  return (
    <>
      <Suspense fallback={null}>
        <ParticleScene />
      </Suspense>
      <ParticleSystem />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <WorkExperience />
        <Achievements />
        <Education />
        <Contact />
        <Socials />
      </main>
      {/* Copy of the hero: reaching it jumps back to the real one, so scrolling never ends */}
      <div ref={loopRef}>
        <Hero id="home-loop" clone />
      </div>
      {/* Guarantees the copy can always reach the top of the viewport */}
      <div aria-hidden="true" className="h-[50vh]" />
    </>
  );
}
