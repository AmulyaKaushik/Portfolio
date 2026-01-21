import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ParticleSystem from "./components/ParticleSystem";

import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Projects from "./sections/Projects";
import Experience from "./sections/Experience";
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
      <Experience />
      <Education />
      <Contact />
      <Footer />
    </>
  );
}
