"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X, Search } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const BASE_NAV_LINKS = [
  { label: "About",        href: "#about",        section: null },
  { label: "Experience",   href: "#experience",   section: null },
  { label: "Skills",       href: "#skills",       section: null },
  { label: "Awards",       href: "#awards",       section: "awards" },
  { label: "Projects",     href: "#projects",     section: null },
  { label: "Testimonials", href: "#testimonials", section: "testimonials" },
  { label: "Contact",      href: "#contact",      section: null },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [available, setAvailable] = useState<Record<string, boolean>>({});
  const navRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  const navLinks = BASE_NAV_LINKS.filter(
    (l) => !l.section || available[l.section]
  );

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });

    Promise.all([
      fetch("/api/content?type=awards").then((r) => r.json()).catch(() => null),
      fetch("/api/content?type=testimonials").then((r) => r.json()).catch(() => null),
    ]).then(([a, t]) => {
      setAvailable({
        awards:       Array.isArray(a?.data)  && a.data.length  > 0,
        testimonials: Array.isArray(t?.data)  && t.data.length  > 0,
      });
    });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const observers = ids.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // Move the sliding indicator
  useEffect(() => {
    if (!navRef.current || !activeSection) return;
    const li = navRef.current.querySelector(`[data-section="${activeSection}"]`) as HTMLElement;
    if (!li) return;
    const navRect = navRef.current.getBoundingClientRect();
    const liRect = li.getBoundingClientRect();
    setIndicatorStyle({ left: liRect.left - navRect.left, width: liRect.width });
  }, [activeSection]);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo — handwritten signature */}
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" })}
          whileHover={reduced ? {} : { scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Return to top"
          className="relative flex items-center leading-none cursor-pointer select-none pr-1 text-3xl"
          style={{ fontFamily: "var(--font-signature)", fontWeight: 700, color: "var(--accent)" }}
        >
          Samuvel
        </motion.button>

        {/* Desktop links */}
        <ul ref={navRef} className="hidden md:flex items-center gap-1 relative">
          {/* Sliding active indicator */}
          {activeSection && !reduced && (
            <motion.div
              className="absolute bottom-0 h-[2px] rounded-full"
              style={{ background: "var(--accent)" }}
              animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            />
          )}

          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <li key={link.href} data-section={link.href.slice(1)}>
                <motion.button
                  onClick={() => handleNav(link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className="relative px-4 py-2 text-sm font-medium rounded-md transition-colors overflow-hidden cursor-pointer"
                  style={{
                    color: isActive ? "var(--foreground)" : "var(--muted)",
                  }}
                  whileHover={{ color: "var(--foreground)" } as never}
                >
                  {link.label}
                  {/* Hover underline slides in from left */}
                  <motion.span
                    className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full origin-left"
                    style={{ background: "var(--accent)" }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.button>
              </li>
            );
          })}
        </ul>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Command palette trigger */}
          <motion.button
            whileHover={reduced ? {} : { scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => document.dispatchEvent(new CustomEvent("command-palette:toggle"))}
            className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)] transition-colors cursor-pointer text-xs"
            style={{ color: "var(--muted)" }}
            aria-label="Open command palette"
          >
            <Search size={12} />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden md:inline ml-1 text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)]">⌘K</kbd>
          </motion.button>

          {mounted && (
            <motion.button
              whileHover={reduced ? {} : { scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)] transition-colors relative overflow-hidden cursor-pointer"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                {theme === "dark" ? (
                  <motion.span
                    key="sun"
                    initial={{ rotate: -90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute"
                  >
                    <Sun size={15} style={{ color: "var(--accent)" }} />
                  </motion.span>
                ) : (
                  <motion.span
                    key="moon"
                    initial={{ rotate: 90, scale: 0, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
                    className="absolute"
                  >
                    <Moon size={15} style={{ color: "var(--accent)" }} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-1)] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="x"
                  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <X size={15} />
                </motion.span>
              ) : (
                <motion.span key="menu"
                  initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}
                  className="absolute"
                >
                  <Menu size={15} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </nav>

      {/* Mobile menu — spring drop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="md:hidden bg-[var(--surface-1)] border-b border-[var(--border)] overflow-hidden"
          >
            <ul className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 22 }}
                >
                  <button
                    onClick={() => handleNav(link.href)}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium rounded-md hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    {link.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
