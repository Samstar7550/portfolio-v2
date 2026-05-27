---
name: portfolio-animations
description: "Animation system details — Framer Motion spec, delays, variants, per-component notes"
metadata: 
  node_type: memory
  type: project
  originSessionId: 426c8187-cc93-4d94-bd4e-2d075454d2ec
---

Full animation system implemented 2026-05-27. All animations use `transform`/`opacity` only (no layout-triggering props). All respect `useReducedMotion` hook.

## Loading / entrance sequence
- LoadingScreen SVG: "S" pathLength 0→1 (0.7s, delay 0.1s), "L" (0.5s, delay 0.55s), dot spring (delay 0.9s)
- Loading screen exits at 1.2s — this is `BASE` constant in Hero.tsx
- Navbar entrance: `initial={{ y: -80, opacity: 0 }}`, `delay: 1.1s`
- Hero stagger (all relative to BASE = 1.2s):
  - +0ms: availability badge slides up
  - +150ms: name slides up
  - +300ms: typewriter container fades in
  - +450ms: tagline slides up
  - +600ms: CTA buttons scale from 0.8
  - +750ms: achievement badge spring-bounces from x:40
  - +1300ms: scroll indicator fades in

## Scroll-triggered animations
- All use `useInView({ once: true, margin: "-80px" })` or `whileInView` with `viewport={{ once: true }}`
- Section headings: `slideLeft` variant (x: -40 → 0, 0.6s, EASE_OUT_EXPO)
- Cards stagger: `staggerContainer(0.1)` wrapper + `fadeUp` children
- Experience entries: alternate `slideLeft` (even index) / `slideRight` (odd index)
- Timeline line: `scaleY: 0 → 1` on `origin-top` div, 2s duration
- Skills wave: global index across all groups × 0.05s delay per badge
- Certifications: `rotateX(-25 → 0)` + `y: 24 → 0`, `perspective: 1000px` on grid container
- About stats: `requestAnimationFrame` count-up with ease-out cubic, triggers on `useInView`

## Continuous animations
- Hero particles: `y: [0, -160, -320]`, `opacity: [0, 0.22, 0]`, linear, repeat Infinity — seeded positions (no Math.random on render)
- Hero parallax bg: `useScroll` target=sectionRef, `useTransform` scrollYProgress → `y: 0%→30%`
- About decorative blob: `useScroll` + `useTransform` → `y: -20%→20%` (0.5× parallax)
- Achievement badge: `animate={{ y: [0, -5, 0] }}` 4s loop easeInOut
- Current role dot: `scale: [1, 1.8, 1]`, `opacity: [0.7, 0, 0.7]`, 2.4s loop
- Typewriter: 80ms type / 40ms delete / 2000ms pause, cycles 4 roles

## Hover animations
- Nav links: `scaleX: 0→1` underline span, `origin-left`, 0.22s
- Primary CTA button: shine sweep via CSS (`-translate-x-full → translate-x-full` on `.group-hover`)
- Secondary CTA: `scale-x-0 → scale-x-100` fill overlay on `.group-hover`
- Skill badges: `onMouseEnter` sets `borderColor` + icon wrapper `box-shadow` glow + `transform: scale(1.15)`
- Experience cards: `whileHover={{ x: 4 }}` + CSS `hover:[box-shadow:inset_4px_0_0_var(--accent)]`
- Project cards: `whileHover={{ y: -8 }}` + `hover:shadow-2xl` + tech pills `group-hover:border-accent`
- Social links: outer `whileHover={{ x: 4 }}`, icon wrapper `whileHover={{ y: -3, scale: 1.1 }}`

## Submit button states (Contact)
AnimatePresence mode="wait" switches between 4 keyed motion.span children:
- idle: Send icon + text, slides up on exit
- loading: Loader2 spin, slides
- success: CheckCircle, spring scale-in, button turns green (#22c55e)
- error: AlertCircle, slides from left, button turns red (#ef4444)

## Floating labels (Contact)
`FloatingInput` / `FloatingTextarea` components. `motion.label` animates:
- `y: 0 → -10`, `scale: 1 → 0.78`, `color: muted → accent` when `focused || Boolean(value)`
- Transition: 0.2s EASE_OUT_EXPO

**Related memories:** [[portfolio-project]] [[portfolio-icons]]
