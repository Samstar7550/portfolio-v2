---
name: portfolio-project
description: "Samuvel L personal portfolio — Next.js 14, Redis-backed live-editable CMS, Resend email, admin console, analytics; deployed on Vercel"
metadata: 
  node_type: memory
  type: project
  originSessionId: 426c8187-cc93-4d94-bd4e-2d075454d2ec
---

Personal portfolio website for Samuvel L (DevOps Engineer, TCS) at `/home/labuser/Desktop/portfolio-v2`.

**Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, next-themes, resend, @upstash/redis, @vercel/blob, bcryptjs, recharts, cmdk, lucide-react, simple-icons (inline SVG paths)  
**Fonts:** Bricolage Grotesque (heading `--font-bricolage`), Outfit (body `--font-outfit`) via `next/font/google`  
**Theme:** dark default, accent `#00C8D7` dark / `#0F64D2` light, toggled via `next-themes` with `attribute="class"`  
**Deployment:** Vercel (cron + Blob). `Dockerfile` is legacy — `output: standalone` was removed from next.config.mjs for Vercel compat; GitHub Actions workflow was deleted.

**GitHub repo:** `https://github.com/Samstar7550/portfolio-v2` (username: `Samstar7550`)  
**Local dev server:** `npm run dev` — lands on port 3000–3002  
**Build:** `npm run build` passes clean — last verified 2026-05-30

**Public sections (app/page.tsx order):**
Navbar · Hero · About · Experience · Skills · Certifications · Projects · GitHubActivity · Contact · Footer — plus CursorSpotlight, CommandPalette (⌘K), LoadingScreen, ScrollProgress, BackToTop, LeadCapture overlays.

**Animation system (complete 2026-05-27):**
- `LoadingScreen.tsx` SVG "SL" monogram, exit at 1.2s · `ScrollProgress.tsx` 2px gradient bar · `BackToTop.tsx` after 500px
- `hooks/useReducedMotion.ts` live matchMedia · `lib/animations.ts` shared variants (EASE_OUT_EXPO, fadeUp, slideLeft/Right, etc.)
- Hero BASE delay = 1.2s; `globals.css` 400ms color transitions + full `prefers-reduced-motion` block + cmdk item styles

**Redis-backed live CMS — the core architecture:**
- `lib/content.ts` — types (Skill, SkillGroup, ExperienceItem, Project, Settings) + hard-coded DEFAULTS; `CONTENT_KEYS` map
- `app/api/content/route.ts` — GET (public, seeds defaults if empty) / PUT (admin-session-gated); PUT fires a change-notification email to ADMIN_EMAIL
- Public components (Hero, Skills, Experience, Projects) fetch `/api/content?type=X` on mount, fall back to in-file defaults instantly → no redeploy needed to edit content

**Admin console `/admin`** (reachable via footer ⚙):
- `app/admin/page.tsx` — single client component: password login → tabs (Overview/Settings/Skills/Experience/Projects)
- Login: `POST /api/admin/login` email+password; first login seeds `ADMIN_PASSWORD` env → bcrypt hash in Redis (`portfolio:admin:password`); returns 24h session token in localStorage
- `api/admin/session` validates token · `api/admin/otp` (session-gated) sends in-console change-password OTP (`reset-otp` key… actually `change-otp`) · `api/admin/change-password` verifies OTP + sets hash
- **Forgot password (login screen, no session):** `api/admin/forgot` sends OTP to ADMIN_EMAIL (generic `{sent:true}` for any email — no enumeration) into `portfolio:admin:reset-otp` · `api/admin/reset-password` verifies email+OTP, sets new hash. UI: "Forgot password?" link → email → OTP+new-password. Separate Redis OTP key from the in-console change flow.
- Login/forgot email inputs use generic `placeholder="Email address"` — NEVER the real admin email (would leak it to any visitor). `ADMIN_EMAIL` is server-only; `NEXT_PUBLIC_ADMIN_EMAIL` was removed (it embedded the address in the client bundle).
- `api/admin/upload` → Vercel Blob (private, `access:"private"`); returns proxy URL `/api/blob?src=...`; `api/blob` validates `*.blob.vercel-storage.com` (SSRF guard) and streams with auth token
- Settings tab: Open-to-Work toggle, profile photo upload, change-password (OTP). Skills/Experience/Projects tabs: full CRUD + per-item icon upload.
- Overview tab: today/total cards + 30-day recharts area chart + **Recent Leads** and **Recent Visitors** lists (same data as the nightly digest). Backed by `api/admin/activity` (session-gated) which returns newest 50 leads + 50 visitors via `zrange(..., { rev: true })` + the `coerce()` helper for Upstash auto-deserialization.
- `/stats` now just `redirect("/admin")`

**Email (Resend) — all server-side, no public keys:**
- `api/contact` — contact form → Resend; also stores submitter as a lead (`source:"contact"`)
- `api/lead` — hiring-widget signups (`source:"widget"`); validates email, rate-limits 1/IP/hour
- `api/cron/digest` — nightly unified email (analytics + new leads + new visitors since last run); CRON_SECRET bearer-protected; `vercel.json` schedule `0 18 * * *` (≈23:30 IST)

**Analytics / tracking (Upstash):**
- `api/views` GET total / POST increments `portfolio:views` + daily key, then `trackVisitor`: IP geo (ip-api.com), UA parse, stored in `portfolio:visitors` sorted set (30-day prune); 1hr IP dedup
- `components/ViewCounter.tsx` POSTs referrer on first session visit, shows count in Footer
- `lib/visitor.ts` (UA parser, getGeo, flag emoji, formatTime) · `lib/lead.ts` (Lead type, keys)

**Key component notes:**
- `BrandIcons.tsx` — inline SVG LinkedIn/GitHub/Figma (lucide v1 dropped brand icons)
- `Skills.tsx` — hybrid icons: simple-icons inline SVG (13) + devicons CDN img (Azure/AzureDevOps/Photoshop); `iconUrl` overrides default; global wave stagger index
- `Contact.tsx` — FloatingInput/Textarea; `fetch("/api/contact")` (NOT EmailJS anymore); copy-email button; display email from `NEXT_PUBLIC_CONTACT_EMAIL`
- `Projects.tsx` — tag filter w/ AnimatePresence popLayout; `iconUrl` override; reads from Redis
- `Experience.tsx` — box-shadow left-border trick; alternating slide; `iconUrl` override; reads from Redis
- `LeadCapture.tsx` — floating bottom-left card, appears after 12s once per session, progressive email reveal, consent note, posts to `/api/lead`
- `CommandPalette.tsx` (cmdk, ⌘K) · `GitHubActivity.tsx` (live `/api/github` feed) · `CursorSpotlight.tsx`

**Env vars (.env.local + Vercel) — see .env.example:**
- `ADMIN_EMAIL` (server-only — NOT exposed to browser, to avoid leaking the admin address), `ADMIN_PASSWORD` (initial seed)
- `RESEND_API_KEY`, `FROM_EMAIL`, `CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_EMAIL`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `BLOB_READ_WRITE_TOKEN` (auto-set in Vercel prod)
- `CRON_SECRET`, optional `GITHUB_TOKEN`
- Custom domain: `samuvel.in` (FROM noreply@, CONTACT contact@, ADMIN admin@)

**Gotchas / infra:**
- ⚠️ `@upstash/redis` auto-deserializes JSON on read — see [[upstash-json-gotcha]]
- Resend blocks browser sends; all email is server-side. Custom domain must be Resend-verified.
- Vercel Blob store is **private**; images served via `/api/blob` proxy, never raw blob URL
- Favicon: custom "SL" set in `public/` only (`app/favicon.ico` deleted — was the Next.js auto-convention file shadowing metadata); SVG first in layout.tsx icon order; regen via `node scripts/generate-favicons.mjs`
- `public/resume.pdf` via `npm run resume` (puppeteer)
- Git proxy bypass in this env: `git -c http.proxy="" -c https.proxy="" push "https://USERNAME:TOKEN@github.com/..."`

**Related memories:** [[portfolio-animations]] [[portfolio-icons]] [[portfolio-git]] [[upstash-json-gotcha]]
