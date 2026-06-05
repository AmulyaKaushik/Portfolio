import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticleSystem from "./components/ParticleSystem";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import LearningJourney from "./sections/Experience";
import WorkExperience from "./sections/WorkExperience";
import Achievements from "./sections/Achievements";
import Education from "./sections/Education";
import Contact from "./sections/Contact";

export default function App() {
  return (
    <>
      <ParticleSystem />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <WorkExperience />
      <Achievements />
      <Education />
      <LearningJourney />
      <Contact />
      <Footer />
    </>
  );
}
