import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticleSystem from "./components/ParticleSystem";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import WorkExperience from "./sections/WorkExperience";
import Achievements from "./sections/Achievements";
import Education from "./sections/Education";
import Contact from "./sections/Contact";

// three.js is heavy: load the WebGL background after the page content
const ParticleScene = lazy(() => import("./components/ParticleScene"));

export default function App() {
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
      </main>
      <Footer />
    </>
  );
}
