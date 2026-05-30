"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Loader2, MapPin, Mail, Copy, Check } from "lucide-react";
import { LinkedInIcon, GitHubIcon } from "@/components/BrandIcons";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { EASE_OUT_EXPO, slideLeft, slideRight } from "@/lib/animations";
import { DEFAULT_PROFILE, Profile } from "@/lib/content";

const stripUrl = (u: string) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");

type FormState = "idle" | "loading" | "success" | "error";

// ─── Floating label input ─────────────────────────────────────────────────────

function FloatingInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || Boolean(value);

  return (
    <div className="relative">
      <motion.label
        htmlFor={name}
        animate={{
          y: isActive ? -10 : 0,
          scale: isActive ? 0.78 : 1,
          color: focused ? "var(--accent)" : "var(--muted)",
        }}
        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        className="absolute left-4 top-3.5 text-sm origin-left pointer-events-none"
      >
        {label}
      </motion.label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
      />
    </div>
  );
}

// ─── Floating label textarea ──────────────────────────────────────────────────

function FloatingTextarea({
  label,
  name,
  value,
  onChange,
  required,
  rows = 5,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || Boolean(value);

  return (
    <div className="relative">
      <motion.label
        htmlFor={name}
        animate={{
          y: isActive ? -10 : 0,
          scale: isActive ? 0.78 : 1,
          color: focused ? "var(--accent)" : "var(--muted)",
        }}
        transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        className="absolute left-4 top-3.5 text-sm origin-left pointer-events-none"
      >
        {label}
      </motion.label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pt-6 pb-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
      />
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({ from_name: "", reply_to: "", message: "" });
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    fetch("/api/content?type=profile")
      .then(r => r.json())
      .then(d => { if (d.data) setProfile(d.data); })
      .catch(() => {});
  }, []);

  const DISPLAY_EMAIL = profile.email;

  const copyEmail = () => {
    navigator.clipboard.writeText(DISPLAY_EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setFormState("success");
      setForm({ from_name: "", reply_to: "", message: "" });
      setTimeout(() => setFormState("idle"), 4000);
    } catch (err) {
      console.error("Contact error:", err);
      setFormState("error");
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  return (
    <section
      id="contact"
      className="py-24 px-4"
      style={{ background: "var(--surface-1)" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          variants={reduced ? undefined : slideLeft}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex items-center gap-4 mb-4"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Contact</h2>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </motion.div>

        <motion.p
          initial={reduced ? {} : { opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_OUT_EXPO }}
          className="text-sm mb-12 flex items-center gap-2"
          style={{ color: "var(--muted)" }}
        >
          <MapPin size={14} style={{ color: "var(--accent)" }} />
          {profile.contactLine}
        </motion.p>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <motion.div
            variants={reduced ? undefined : slideLeft}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FloatingInput
                  label="Name"
                  name="from_name"
                  value={form.from_name}
                  onChange={handleChange}
                  required
                />
                <FloatingInput
                  label="Email"
                  name="reply_to"
                  type="email"
                  value={form.reply_to}
                  onChange={handleChange}
                  required
                />
              </div>

              <FloatingTextarea
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
              />

              {/* Submit button — idle → loading → success / error */}
              <motion.button
                type="submit"
                disabled={formState === "loading" || formState === "success"}
                whileHover={
                  reduced || formState !== "idle" ? {} : { scale: 1.02 }
                }
                whileTap={{ scale: 0.98 }}
                className="relative w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm text-white overflow-hidden cursor-pointer disabled:cursor-default transition-all"
                style={{
                  background:
                    formState === "success"
                      ? "#22c55e"
                      : formState === "error"
                      ? "#ef4444"
                      : "var(--accent)",
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {formState === "idle" && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Send size={16} />
                      Send Message
                    </motion.span>
                  )}
                  {formState === "loading" && (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </motion.span>
                  )}
                  {formState === "success" && (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Message Sent!
                    </motion.span>
                  )}
                  {formState === "error" && (
                    <motion.span
                      key="error"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      Failed — Try Again
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Success sub-message */}
              <AnimatePresence>
                {formState === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-center"
                    style={{ color: "var(--muted)" }}
                  >
                    I&apos;ll get back to you soon!
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Social links */}
          <motion.div
            variants={reduced ? undefined : slideRight}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="lg:col-span-2 flex flex-col justify-center gap-4"
          >
            <p className="text-sm" style={{ color: "var(--muted)" }}>
              Prefer a direct approach? Reach out on LinkedIn or check my GitHub.
            </p>

            <div className="space-y-3">
              {/* Email copy */}
              <motion.button
                onClick={copyEmail}
                whileHover={reduced ? {} : { x: 4 }}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all group cursor-pointer text-left"
              >
                <motion.div
                  whileHover={reduced ? {} : { y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
                >
                  <Mail size={18} style={{ color: "var(--accent)" }} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium group-hover:text-[var(--accent)] transition-colors">
                    Email
                  </div>
                  <div className="text-xs truncate" style={{ color: "var(--muted)" }}>
                    {DISPLAY_EMAIL}
                  </div>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ color: "#22c55e" }}
                    >
                      <Check size={14} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ color: "var(--muted)" }}
                    >
                      <Copy size={14} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              {/* LinkedIn */}
              <motion.a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reduced ? {} : { x: 4 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[#0A66C2] transition-all group cursor-pointer"
              >
                <motion.div
                  whileHover={reduced ? {} : { y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, #0A66C2 20%, transparent)" }}
                >
                  <LinkedInIcon size={18} className="text-[#0A66C2]" />
                </motion.div>
                <div>
                  <div className="text-sm font-medium group-hover:text-[#0A66C2] transition-colors">
                    LinkedIn
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {stripUrl(profile.linkedin)}
                  </div>
                </div>
              </motion.a>

              {/* GitHub */}
              <motion.a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={reduced ? {} : { x: 4 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all group cursor-pointer"
              >
                <motion.div
                  whileHover={reduced ? {} : { y: -3, scale: 1.1 }}
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                  }}
                >
                  <GitHubIcon size={18} style={{ color: "var(--accent)" }} />
                </motion.div>
                <div>
                  <div
                    className="text-sm font-medium transition-colors"
                    style={{ color: "var(--foreground)" }}
                  >
                    GitHub
                  </div>
                  <div className="text-xs" style={{ color: "var(--muted)" }}>
                    {stripUrl(profile.github)}
                  </div>
                </div>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
