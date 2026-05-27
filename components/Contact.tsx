"use client";

import { useState, FormEvent } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle, AlertCircle, Loader2, MapPin } from "lucide-react";
import { LinkedInIcon, GitHubIcon } from "@/components/BrandIcons";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

type FormState = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const ref = useRef(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [formState, setFormState] = useState<FormState>("idle");
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormState("loading");

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current!,
        EMAILJS_PUBLIC_KEY
      );
      setFormState("success");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setFormState("idle"), 4000);
    } catch {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 4000);
    }
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--muted)]";

  return (
    <section
      id="contact"
      className="py-24 px-4"
      style={{ background: "var(--surface-1)" }}
      ref={ref}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">Contact</h2>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          </div>

          <p className="text-sm mb-12 flex items-center gap-2" style={{ color: "var(--muted)" }}>
            <MapPin size={14} style={{ color: "var(--accent)" }} />
            Open to DevOps &amp; Cloud roles · Remote · India
          </p>

          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--muted)" }}
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--muted)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "var(--muted)" }}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell me about the role or project..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={formState === "loading"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: "var(--accent)" }}
                >
                  {formState === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </motion.button>

                {/* Status messages */}
                {formState === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-green-500"
                  >
                    <CheckCircle size={16} />
                    Message sent! I&apos;ll get back to you soon.
                  </motion.div>
                )}
                {formState === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertCircle size={16} />
                    Something went wrong. Please try again.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 flex flex-col justify-center gap-4"
            >
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Prefer a direct approach? Reach out on LinkedIn or check my GitHub.
              </p>

              <div className="space-y-3">
                <motion.a
                  href="https://linkedin.com/in/samuvel7550"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[#0A66C2] transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "color-mix(in srgb, #0A66C2 20%, transparent)" }}
                  >
                    <LinkedInIcon size={18} className="text-[#0A66C2]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium group-hover:text-[#0A66C2] transition-colors">
                      LinkedIn
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      linkedin.com/in/samuvel7550
                    </div>
                  </div>
                </motion.a>

                <motion.a
                  href="https://github.com/samuvel7550"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--accent)] transition-all group"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                    }}
                  >
                    <GitHubIcon size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <div
                      className="text-sm font-medium transition-colors"
                      style={{ color: "var(--foreground)" }}
                    >
                      GitHub
                    </div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      github.com/samuvel7550
                    </div>
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
