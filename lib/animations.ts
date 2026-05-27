// Shared Framer Motion variants — import from here for consistency
// All durations: 200–800ms. All use transform/opacity only.

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT_BACK = [0.34, 1.56, 0.64, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

// ─── Fade + slide up (sections, cards) ────────────────────────────────────────
export const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const fadeUpLarge = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: EASE_IN_OUT },
  },
};

// ─── Slide from left / right (timeline alternates) ────────────────────────────
export const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

export const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
};

// ─── Scale in (buttons, badges) ───────────────────────────────────────────────
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT_BACK },
  },
};

export const bounceIn = {
  hidden: { opacity: 0, scale: 0.6, x: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 18 },
  },
};

// ─── Card flip (certifications) ───────────────────────────────────────────────
export const flipIn = {
  hidden: { opacity: 0, rotateX: -30, y: 20 },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO },
  },
};

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainer = (stagger = 0.1, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

// ─── Reduced motion fallback ──────────────────────────────────────────────────
// When reduced-motion is preferred, override to instant opacity-only
export const noMotion = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};
