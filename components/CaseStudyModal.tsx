"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect } from "react";
import { EASE_OUT_EXPO } from "@/lib/animations";

export default function CaseStudyModal({
  data,
  onClose,
  reduced,
}: {
  data: { title: string; body: string } | null;
  onClose: () => void;
  reduced: boolean;
}) {
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[200] flex items-start sm:items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-sm overflow-y-auto"
        >
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl my-auto rounded-2xl border border-[var(--border)] shadow-2xl"
            style={{ background: "var(--surface-1)" }}
          >
            <div className="sticky top-0 flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--border)] rounded-t-2xl" style={{ background: "var(--surface-1)" }}>
              <h3 className="font-heading text-lg font-bold truncate">{data.title}</h3>
              <button
                onClick={onClose}
                aria-label="Close case study"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-6 blog-prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.body}</ReactMarkdown>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
