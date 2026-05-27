---
name: portfolio-project
description: "Samuvel L personal portfolio — Next.js 14 + Tailwind + Framer Motion, fully built, animation system complete, pushed to GitHub"
metadata: 
  node_type: memory
  type: project
  originSessionId: 426c8187-cc93-4d94-bd4e-2d075454d2ec
---

Personal portfolio website for Samuvel L (DevOps Engineer, TCS) at `/home/labuser/Desktop/Portfolio`.

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, next-themes, @emailjs/browser, lucide-react, simple-icons (inline SVG paths)  
**Fonts:** Bricolage Grotesque (heading `--font-bricolage`), Outfit (body `--font-outfit`) via `next/font/google`  
**Theme:** dark default, accent `#00C8D7` dark / `#0F64D2` light, toggled via `next-themes` with `attribute="class"`

**GitHub repo:** `https://github.com/Samstar7550/portfolio-v2` (username: `Samstar7550`)  
**Local dev server:** `npm run dev` — usually lands on port 3000–3002 (3000/3001 often occupied)  
**Build:** `npm run build` passes clean — last verified 2026-05-27

**All sections built:**
Navbar · Hero · About · Experience · Skills · Certifications · Projects · Contact · Footer

**Animation system — complete as of 2026-05-27:**
- `components/LoadingScreen.tsx` — SVG path-draw "SL" monogram, AnimatePresence exit at 1.2s
- `components/ScrollProgress.tsx` — useSpring 2px teal→blue gradient bar, z-[100]
- `components/BackToTop.tsx` — spring fade-in after 500px scroll
- `hooks/useReducedMotion.ts` — live matchMedia hook, all animations respect it
- `lib/animations.ts` — shared variants: EASE_OUT_EXPO, fadeUp, slideLeft, slideRight, bounceIn, flipIn, staggerContainer
- `app/page.tsx` — client component, mounts LoadingScreen (done after 1200ms), ScrollProgress, BackToTop

**Key component notes:**
- `BrandIcons.tsx` — inline SVG for LinkedIn, GitHub, Figma (lucide-react v1 dropped brand icons)
- `Skills.tsx` — hybrid icon strategy: simple-icons inline SVG for 13 tools, devicons CDN img for Azure/AzureDevOps/Photoshop (removed from simple-icons ≥v8). Global wave stagger index computed at module level.
- `Contact.tsx` — FloatingInput/FloatingTextarea components with animated labels; AnimatePresence submit button states (idle→loading→success→error)
- `Experience.tsx` — box-shadow trick for left border 2px→4px on hover (no layout shift); scaleY animated line; alternating slideLeft/slideRight per entry index
- Hero BASE delay = 1.2s (matches loading screen clear time); stagger: 0/150/300/450/600/750ms after base
- `globals.css` — 400ms background-color/border-color transitions on `*`; full `prefers-reduced-motion` block disabling all

**Infrastructure:**
- `Dockerfile` — multi-stage (deps → builder → runner), `output: "standalone"` in next.config.mjs, node:20-alpine runner
- `.github/workflows/deploy.yml` — lint → docker build-push on main push
- `.env.example` — NEXT_PUBLIC_EMAILJS_SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY

**Misc:**
- `public/resume.pdf` — not yet added, download button links to it
- Git proxy bypass needed in this env: `git -c http.proxy="" -c https.proxy="" push "https://USERNAME:TOKEN@github.com/..."`
- EmailJS keys go in `.env.local`

**Related memories:** [[portfolio-animations]] [[portfolio-icons]] [[portfolio-git]]
