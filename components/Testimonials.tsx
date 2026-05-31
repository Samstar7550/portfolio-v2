"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, X, MessageSquarePlus, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft } from "@/lib/animations";
import { Testimonial } from "@/lib/content";

type FeedbackStatus = "idle" | "loading" | "success" | "error";

export default function Testimonials() {
  const reduced = useReducedMotion();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);

  // Feedback form state
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formQuote, setFormQuote] = useState("");
  const [formStatus, setFormStatus] = useState<FeedbackStatus>("idle");
  const [formError, setFormError] = useState("");
  const hpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/content?type=testimonials")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.data)) setItems(d.data); })
      .catch(() => {});
  }, []);

  const go = useCallback((d: number) => {
    setDir(d);
    setIndex((i) => (i + d + items.length) % items.length);
  }, [items.length]);

  // Auto-advance (paused on hover / reduced-motion / <2 items)
  useEffect(() => {
    if (reduced || paused || items.length < 2) return;
    const t = setInterval(() => { setDir(1); setIndex((i) => (i + 1) % items.length); }, 6000);
    return () => clearInterval(t);
  }, [reduced, paused, items.length]);

  const resetForm = () => {
    setFormName(""); setFormRole(""); setFormCompany(""); setFormQuote("");
    setFormStatus("idle"); setFormError("");
  };

  const closeForm = () => { setFormOpen(false); setTimeout(resetForm, 300); };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("loading"); setFormError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName, role: formRole, company: formCompany,
          quote: formQuote, hp_field: hpRef.current?.value ?? "",
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormStatus("error"); setFormError(json.error ?? "Something went wrong."); }
      else { setFormStatus("success"); }
    } catch { setFormStatus("error"); setFormError("Network error — please try again."); }
  };

  const t = items.length > 0 ? items[Math.min(index, items.length - 1)] : null;
  const initials = t ? t.author.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "";

  return (
    <section
      id="testimonials"
      className="py-16 sm:py-24"
      style={{ background: "var(--surface-1)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex items-center gap-4 mb-12"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Testimonials</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        {t && (
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Big decorative quote mark */}
          <Quote
            size={120}
            aria-hidden
            className="absolute -top-6 -left-2 opacity-[0.06] pointer-events-none"
            style={{ color: "var(--accent)" }}
          />

          <div className="relative min-h-[260px] sm:min-h-[220px] flex items-center">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                className="relative w-full text-center px-2 sm:px-10"
              >
                <p className="font-heading text-lg sm:text-2xl leading-relaxed mb-8">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center justify-center gap-3">
                  {/* Avatar or initials */}
                  <div
                    className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-heading font-bold text-sm text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {t.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatarUrl} alt={t.author} className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{t.author}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {t.role}{t.company ? ` · ${t.company}` : ""}
                    </div>
                  </div>
                </div>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controls */}
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <motion.button
                onClick={() => go(-1)}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} style={{ color: "var(--accent)" }} />
              </motion.button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setDir(i > index ? 1 : -1); setIndex(i); }}
                    aria-label={`Go to testimonial ${i + 1}`}
                    className="h-2 rounded-full transition-all cursor-pointer"
                    style={{
                      width: i === index ? 20 : 8,
                      background: i === index ? "var(--accent)" : "var(--border)",
                    }}
                  />
                ))}
              </div>

              <motion.button
                onClick={() => go(1)}
                whileTap={{ scale: 0.9 }}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-colors cursor-pointer"
              >
                <ChevronRight size={16} style={{ color: "var(--accent)" }} />
              </motion.button>
            </div>
          )}
        </div>
        )}

        {/* Share feedback prompt */}
        <div className="mt-10 text-center">
          <button
            onClick={() => setFormOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--accent)] cursor-pointer"
            style={{ color: "var(--muted)" }}
          >
            <MessageSquarePlus size={14} />
            Worked with me? <span style={{ color: "var(--accent)" }}>Share your feedback</span>
          </button>
        </div>
      </div>

      {/* Feedback modal */}
      <AnimatePresence>
        {formOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="fb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={closeForm}
            />
            {/* Dialog */}
            <motion.div
              key="fb-dialog"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="w-full max-w-md rounded-2xl border border-[var(--border)] p-6 shadow-2xl pointer-events-auto"
                style={{ background: "var(--background)" }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-heading font-bold text-lg">Share Feedback</h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Your feedback may be featured as a testimonial.</p>
                  </div>
                  <button onClick={closeForm} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--surface-1)] transition-colors cursor-pointer" style={{ color: "var(--muted)" }}>
                    <X size={16} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {formStatus === "success" ? (
                    <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center">
                      <CheckCircle size={40} className="mx-auto mb-3" style={{ color: "#22c55e" }} />
                      <p className="font-semibold mb-1">Thank you!</p>
                      <p className="text-sm" style={{ color: "var(--muted)" }}>Your feedback has been received.</p>
                      <button onClick={closeForm} className="mt-5 px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer" style={{ background: "var(--accent)" }}>
                        Close
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={submitFeedback} className="space-y-3">
                      {/* Honeypot */}
                      <input ref={hpRef} type="text" name="hp_field" className="hidden" tabIndex={-1} autoComplete="off" />

                      <textarea
                        value={formQuote}
                        onChange={e => setFormQuote(e.target.value)}
                        placeholder="Your feedback *"
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm outline-none focus:border-[var(--accent)] transition-colors resize-none"
                        style={{ color: "var(--foreground)" }}
                      />
                      <input
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="Your name *"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                        style={{ color: "var(--foreground)" }}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={formRole}
                          onChange={e => setFormRole(e.target.value)}
                          placeholder="Role (optional)"
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                          style={{ color: "var(--foreground)" }}
                        />
                        <input
                          value={formCompany}
                          onChange={e => setFormCompany(e.target.value)}
                          placeholder="Company (optional)"
                          className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-sm outline-none focus:border-[var(--accent)] transition-colors"
                          style={{ color: "var(--foreground)" }}
                        />
                      </div>

                      {formStatus === "error" && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <AlertCircle size={13} /> {formError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={formStatus === "loading"}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 cursor-pointer transition-opacity"
                        style={{ background: "var(--accent)" }}
                      >
                        {formStatus === "loading" ? <Loader2 size={15} className="animate-spin" /> : <MessageSquarePlus size={15} />}
                        {formStatus === "loading" ? "Submitting…" : "Submit Feedback"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
