"use client";

import { useState, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, X, Send, CheckCircle, Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO } from "@/lib/animations";

type State = "idle" | "loading" | "success";

export default function LeadCapture() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    if (sessionStorage.getItem("lead_seen")) return;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    sessionStorage.setItem("lead_seen", "1");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      setState("success");
      sessionStorage.setItem("lead_seen", "1");
      setTimeout(() => setOpen(false), 2600);
    } catch {
      setState("idle");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.92 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="fixed bottom-6 left-6 z-40 w-[300px] max-w-[calc(100vw-3rem)] rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] shadow-2xl overflow-hidden"
        >
          {/* Accent top bar */}
          <div className="h-1 w-full" style={{ background: "var(--accent)" }} />

          <div className="p-5">
            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-3.5 right-3 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              style={{ color: "var(--muted)" }}
            >
              <X size={15} />
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {state === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-3"
                >
                  <CheckCircle size={32} style={{ color: "#22c55e" }} />
                  <p className="text-sm font-medium mt-3">Thanks for reaching out!</p>
                  <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                    I&apos;ll be in touch soon.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-1 pr-6">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
                    >
                      <Briefcase size={15} style={{ color: "var(--accent)" }} />
                    </span>
                    <p className="text-sm font-semibold">Hiring or collaborating?</p>
                  </div>
                  <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                    Drop your details and I&apos;ll reach out.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onFocus={() => setExpanded(true)}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                    />
                    <AnimatePresence initial={false}>
                      {(expanded || form.name) && (
                        <motion.input
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                          type="email"
                          required
                          placeholder="Your email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                        />
                      )}
                    </AnimatePresence>
                    <button
                      type="submit"
                      disabled={state === "loading"}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white cursor-pointer disabled:opacity-60 transition-opacity"
                      style={{ background: "var(--accent)" }}
                    >
                      {state === "loading" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Send size={14} />
                      )}
                      {state === "loading" ? "Sending…" : "Send"}
                    </button>
                    <AnimatePresence initial={false}>
                      {(expanded || form.name) && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-[10px] leading-snug text-center"
                          style={{ color: "var(--muted)" }}
                        >
                          By submitting, you agree to be contacted about
                          opportunities. Your details are never shared.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
