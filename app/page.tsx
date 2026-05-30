"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import CursorSpotlight from "@/components/CursorSpotlight";
import CommandPalette from "@/components/CommandPalette";
import GitHubActivity from "@/components/GitHubActivity";
import LeadCapture from "@/components/LeadCapture";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <main id="main-content">
      <CursorSpotlight />
      <CommandPalette />
      <LoadingScreen done={loaded} />
      <ScrollProgress />
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Certifications />
      <Projects />
      <GitHubActivity />
      <Contact />
      <Footer />
      <BackToTop />
      <LeadCapture />
    </main>
  );
}
