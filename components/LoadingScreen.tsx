"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  done: boolean;
}

export default function LoadingScreen({ done }: Props) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "var(--background)" }}
        >
          {/* Monogram SVG — "SL" drawn via pathLength */}
          <motion.svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* S */}
            <motion.path
              d="M32 18 C20 18 16 24 16 29 C16 35 20 38 28 40 C36 42 40 45 40 51 C40 57 36 54 28 54 C22 54 18 52 16 50"
              stroke="var(--accent)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            />
            {/* L */}
            <motion.path
              d="M46 18 L46 54 L60 54"
              stroke="var(--foreground)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.55 }}
            />
            {/* Dot accent */}
            <motion.circle
              cx="36"
              cy="64"
              r="2.5"
              fill="var(--accent)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.9 }}
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
