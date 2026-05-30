"use client";
import { useState, useEffect, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Search, Sun, Moon, Download, User, Briefcase,
  Cpu, Award, Folder, Mail, Terminal, Trophy, MessageSquare, Newspaper,
} from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/BrandIcons";

const BASE_NAV_ITEMS = [
  { id: "about",          label: "About",          icon: <User size={14} />,          section: null },
  { id: "experience",     label: "Experience",      icon: <Briefcase size={14} />,     section: null },
  { id: "skills",         label: "Skills",          icon: <Cpu size={14} />,           section: null },
  { id: "certifications", label: "Certifications",  icon: <Award size={14} />,         section: null },
  { id: "awards",         label: "Awards",          icon: <Trophy size={14} />,        section: "awards" },
  { id: "projects",       label: "Projects",        icon: <Folder size={14} />,        section: null },
  { id: "testimonials",   label: "Testimonials",    icon: <MessageSquare size={14} />, section: "testimonials" },
  { id: "contact",        label: "Contact",         icon: <Mail size={14} />,          section: null },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("/resume.pdf");
  const [available, setAvailable] = useState<Record<string, boolean>>({});
  const { theme, setTheme } = useTheme();

  const navItems = BASE_NAV_ITEMS.filter(
    (item) => !item.section || available[item.section]
  );

  useEffect(() => {
    fetch("/api/content?type=settings")
      .then((r) => r.json())
      .then((d) => { if (d.data?.resumeUrl) setResumeUrl(d.data.resumeUrl); })
      .catch(() => {});

    Promise.all([
      fetch("/api/content?type=awards").then((r) => r.json()).catch(() => null),
      fetch("/api/content?type=testimonials").then((r) => r.json()).catch(() => null),
    ]).then(([a, t]) => {
      setAvailable({
        awards:       Array.isArray(a?.data) && a.data.length  > 0,
        testimonials: Array.isArray(t?.data) && t.data.length  > 0,
      });
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onCustom = () => setOpen((o) => !o);
    document.addEventListener("keydown", onKey);
    document.addEventListener("command-palette:toggle", onCustom);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("command-palette:toggle", onCustom);
    };
  }, []);

  const run = useCallback((fn: () => void) => {
    setOpen(false);
    setTimeout(fn, 120);
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[16vh] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg px-4"
          >
            <Command
              className="rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden"
              style={{ background: "var(--surface-1)" }}
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 border-b border-[var(--border)]">
                <Search size={14} style={{ color: "var(--muted)" }} className="shrink-0" />
                <Command.Input
                  placeholder="Type a command or search…"
                  className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-[var(--muted)]"
                  style={{ color: "var(--foreground)" }}
                />
                <kbd
                  className="hidden sm:block text-[10px] px-1.5 py-0.5 rounded border border-[var(--border)]"
                  style={{ color: "var(--muted)" }}
                >
                  ESC
                </kbd>
              </div>

              {/* List */}
              <Command.List className="max-h-[320px] overflow-y-auto p-2">
                <Command.Empty
                  className="py-8 text-center text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  No results found.
                </Command.Empty>

                <Command.Group heading="Navigate">
                  {navItems.map(({ id, label, icon }) => (
                    <Command.Item
                      key={id}
                      onSelect={() => run(() => scrollTo(id))}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                      style={{ color: "var(--muted)" }}
                    >
                      <span style={{ color: "var(--accent)" }}>{icon}</span>
                      {label}
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Actions">
                  <Command.Item
                    onSelect={() => run(() => { window.location.href = "/blog"; })}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}><Newspaper size={14} /></span>
                    Visit Blog
                  </Command.Item>
                  <Command.Item
                    onSelect={() => run(() => setTheme(theme === "dark" ? "light" : "dark"))}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>
                      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                    </span>
                    Toggle {theme === "dark" ? "Light" : "Dark"} Mode
                  </Command.Item>
                  <Command.Item
                    onSelect={() =>
                      run(() => {
                        const a = document.createElement("a");
                        a.href = resumeUrl;
                        a.download = "Samuvel_Resume.pdf";
                        a.click();
                      })
                    }
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>
                      <Download size={14} />
                    </span>
                    Download Resume
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Links">
                  <Command.Item
                    onSelect={() =>
                      run(() => window.open("https://github.com/Samstar7550", "_blank"))
                    }
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>
                      <GitHubIcon size={14} />
                    </span>
                    GitHub
                  </Command.Item>
                  <Command.Item
                    onSelect={() =>
                      run(() => window.open("https://linkedin.com/in/samuvel7550", "_blank"))
                    }
                    className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    <span style={{ color: "var(--accent)" }}>
                      <LinkedInIcon size={14} />
                    </span>
                    LinkedIn
                  </Command.Item>
                </Command.Group>
              </Command.List>

              {/* Footer hint */}
              <div
                className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] text-[10px]"
                style={{ color: "var(--muted)" }}
              >
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--border)]">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded border border-[var(--border)]">↵</kbd>
                    select
                  </span>
                </span>
                <Terminal size={11} />
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
