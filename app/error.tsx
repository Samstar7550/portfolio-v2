"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "color-mix(in srgb, #ef4444 12%, transparent)" }}
        >
          <AlertTriangle size={20} style={{ color: "#ef4444" }} />
        </div>
        <h2 className="font-heading text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-sm mb-6" style={{ color: "var(--muted)" }}>
          An unexpected error occurred. Try refreshing the page.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{ background: "var(--accent)" }}
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </motion.div>
    </div>
  );
}
