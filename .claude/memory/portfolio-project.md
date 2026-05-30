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
**Deployment:** Vercel (cron + Blob). Live at **www.samuvel.in** (samuvel.in → www; `portfolio-v2.vercel.app` may serve an OLDER deploy — verify on www). `Dockerfile`/`.dockerignore` REMOVED 2026-05-30 (were broken — referenced `.next/standalone`+`server.js` but `output:standalone` was dropped for Vercel). `app/fonts/Geist*.woff` also removed (unused create-next-app leftovers).

**GitHub repo:** `https://github.com/Samstar7550/portfolio-v2` (username: `Samstar7550`)  
**Local dev server:** `npm run dev` — lands on port 3000–3002  
**Build:** `npm run build` passes clean — last verified 2026-05-30. Commits authored as **Samuvel L <samstar7550@gmail.com>** (full history rewritten from `labuser` on 2026-05-30) — see [[portfolio-git]].

**Public sections (app/page.tsx order):**
Navbar · Hero · About · Experience · Skills · Certifications · **Awards** · Projects · GitHubActivity · **Testimonials** · Contact · Footer — plus CursorSpotlight, CommandPalette (⌘K), LoadingScreen, ScrollProgress, BackToTop, LeadCapture, ServiceWorker overlays. **Routes beyond home:** `/blog` + `/blog/[slug]` (CMS blog), `/admin`, `/stats`, plus `app/sitemap.ts` / `app/robots.ts` / `app/rss.xml` / `app/icon.svg` / `app/apple-icon.png`.

**Spacing convention (UI standard):** every section is full-bleed `py-16 sm:py-24` with inner `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8` (Testimonials max-w-4xl) so all left edges align with the navbar; `html{scroll-padding-top:5rem}` clears the fixed 64px navbar on anchor jumps.

**Animation system (complete 2026-05-27):**
- `LoadingScreen.tsx` SVG "SL" monogram, exit at 1.2s · `ScrollProgress.tsx` 2px gradient bar · `BackToTop.tsx` after 500px
- `hooks/useReducedMotion.ts` live matchMedia · `lib/animations.ts` shared variants (EASE_OUT_EXPO, fadeUp, slideLeft/Right, etc.)
- Hero BASE delay = 1.2s; `globals.css` 400ms color transitions + full `prefers-reduced-motion` block + cmdk item styles

**Redis-backed live CMS — the core architecture:**
- `lib/content.ts` — types (Skill, SkillGroup, ExperienceItem, Project, Certification, Profile, AwardItem, Testimonial, Settings) + hard-coded DEFAULTS; `CONTENT_KEYS` map. Content types: settings, **profile**, skills, experience, projects, certifications, **awards**, **testimonials**.
- **Awards** (`components/Awards.tsx`, section after Certifications) — Trophy/Medal/Star/Sparkles icon cards, floating-badge + hover-shine animation, scroll-reveal stagger. **Testimonials** (`components/Testimonials.tsx`, after GitHubActivity) — auto-advancing carousel (6s, paused on hover/reduced-motion), big Quote illustration, avatar (uploaded or initials), dots + prev/next. Both editable in admin **Awards**/**Testimonials** tabs (CRUD; testimonials have avatar upload). Read `?type=awards`/`?type=testimonials`, fall back to defaults.
- **Profile content type** = all personal text that was previously hardcoded: Hero (name, roles[], tagline, heroBadge, statValue/Label, available/unavailableText), About (aboutTitle, bio[], quickInfo[], stats[], **education[] — array, multiple entries**), Contact (contactLine, email, linkedin, github). Edited via the **Profile tab** in admin. Hero/About/Contact/Footer fetch `?type=profile` and fall back to `DEFAULT_PROFILE`. About `renderBio()` parses two markers: `**bold**` (foreground) and `==text==` (accent pill — used for cert names like AZ-900). Footer derives initials from `profile.name`. `asEducation(profile)` coerces education to array (tolerates legacy single-object Redis data). Only structural/design/animation stays hardcoded.
- **Color palette switcher**: `PALETTES` (10, in `lib/content.ts`) each `{id,name,light,dark}` accent pair. `settings.palette` (id) stored in Redis. `components/PaletteProvider.tsx` (mounted in layout) fetches settings + injects a `<style id="palette-override">` overriding `--accent` for `:root`/`.dark` via `paletteCss()`. `applyPalette(id)` also exported for live preview in the admin Settings palette picker. "default" = the globals.css teal/blue (removes override). Everything using `var(--accent)` recolors automatically.
- `app/api/content/route.ts` — GET (public, seeds defaults if empty) / PUT (admin-session-gated); PUT reads the previous Redis value, diffs it against the new one (`describeChanges`/`diffObject`/`diffArray`), and emails ADMIN_EMAIL a **"What changed:"** list — e.g. `available: on → off`, `palette: default → violet`, `name: X → Y`, `education: 1 → 2 items`, `+ added "New Project"`, `~ edited "VizualizeHub"`, `− removed "Design"`. Items keyed by title/role/name/category/degree. Capped at 15 lines.
- Public components (Hero, Skills, Experience, Projects) fetch `/api/content?type=X` on mount, fall back to in-file defaults instantly → no redeploy needed to edit content

**Admin console `/admin`** (reachable via footer ⚙):
- `app/admin/page.tsx` — single client component: password login → tabs (Overview/Settings/Skills/Experience/Projects)
- Login: `POST /api/admin/login` email+password; first login seeds `ADMIN_PASSWORD` env → bcrypt hash in Redis (`portfolio:admin:password`); returns 24h session token in localStorage
- `api/admin/session` validates token · `api/admin/otp` (session-gated) sends in-console change-password OTP (`reset-otp` key… actually `change-otp`) · `api/admin/change-password` verifies OTP + sets hash
- **Forgot password (login screen, no session):** `api/admin/forgot` sends OTP to ADMIN_EMAIL (generic `{sent:true}` for any email — no enumeration) into `portfolio:admin:reset-otp` · `api/admin/reset-password` verifies email+OTP, sets new hash. UI: "Forgot password?" link → email → OTP+new-password. Separate Redis OTP key from the in-console change flow.
- Login/forgot email inputs use generic `placeholder="Email address"` — NEVER the real admin email (would leak it to any visitor). `ADMIN_EMAIL` is server-only; `NEXT_PUBLIC_ADMIN_EMAIL` was removed (it embedded the address in the client bundle).
- `api/admin/upload` → Vercel Blob (private, `access:"private"`); returns proxy URL `/api/blob?src=...`; `api/blob` validates `*.blob.vercel-storage.com` (SSRF guard) and streams with auth token
- Settings tab: Open-to-Work toggle, profile photo upload, **resume PDF upload** (client-side pdf-lib compression via `useObjectStreams`, keeps the smaller of original/compressed — ~16% gain on the real resume; uploaded via the Blob upload route → `settings.resumeUrl`; Hero + CommandPalette download links use `settings.resumeUrl ?? "/resume.pdf"`), change-password (OTP). Skills/Experience/Projects/**Certifications** tabs: full CRUD; Skills/Experience/Projects also per-item icon upload.
- `components/Certifications.tsx` reads from Redis (`type=certifications`), falls back to `DEFAULT_CERTIFICATIONS`. Cert fields: title, badge, issuer, date, status (issued|progress), color.
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
- Favicon: **static via `app/icon.svg`** (Next file convention → `/icon.svg?<hash>`, cache-busts on change). The old dynamic palette-coloured `setFavicon()` injection was REMOVED 2026-05-30 (browsers cached it unreliably). ⚠️ Do NOT add an `icons` field to `metadata` in layout.tsx — it suppresses the auto-generated hashed link and re-freezes the favicon. Apple icon = `app/apple-icon.png` (file convention). Design is palette-NEUTRAL: white "SL" on dark `#080A10`, generated by `scripts/generate-favicons.mjs` (fg=WHITE). `public/favicon.svg` is now just a fallback. `PaletteProvider` now only manages the `--accent` CSS override + caches palette in localStorage (instant, no flash).
- `public/resume.pdf` via `npm run resume` (puppeteer)
- Git proxy bypass in this env: `git -c http.proxy="" -c https.proxy="" push "https://USERNAME:TOKEN@github.com/..."`

**Session 2026-05-30 additions (features + content fields):**
- **Blog/Notes** — new `blog` content type (`Post`: slug/title/excerpt/body(markdown)/date/tags/published/cover). Server-rendered `/blog` + `/blog/[slug]` via `lib/redis-content.ts` `getContent()` (SEO: dynamic metadata/OG/canonical, 60s revalidate, 404 on missing/unpublished). Markdown = react-markdown + remark-gfm, styled `.blog-prose` in globals.css. `/rss.xml` feed; sitemap lists published posts. Admin **Blog tab** (markdown CRUD, auto-slug, publish toggle). Blog link in Navbar (desktop+mobile), command palette, footer.
- **Storage tab** (admin) + `/api/admin/blobs` — GET lists Vercel Blob files (`portfolio-icons/`), DELETE removes a file AND recursively strips its Redis references. `/api/content` gained DELETE = reset a section to defaults.
- **Live status badges** — `/api/status?url=` pings a project link (SSRF-guarded to project URLs, 5-min Redis cache) → green/red dot + latency on project cards.
- **Contact hardening** — honeypot (`company` field), per-IP rate-limit 5/hr, email validation, branded sender **auto-reply** (all in `/api/contact`).
- **New optional content fields:** Profile.`currentlyLearning` (animated pill in About), Settings.`bookingUrl` (Cal.com "Book a call" button in Contact), SkillGroup.`level` 0-100 (proficiency bar in Skills), Project.`images[]`+`figma`+`caseStudy`. Project galleries use next/image + a lightbox; `caseStudy` markdown opens a **code-split** modal (`components/CaseStudyModal.tsx` via next/dynamic — keeps react-markdown OFF the homepage bundle).
- **DEFAULT_AWARDS / DEFAULT_TESTIMONIALS now `[]`** — only render when Redis has data; their nav/search links hide when empty.
- **Audience analytics** — admin Overview shows device/browser/referrer/country breakdowns (client-side over existing visitor records).
- **SEO** — `metadataBase`, `app/sitemap.ts`, `app/robots.ts` (disallow /admin,/api), JSON-LD Person in layout.
- **PWA** — `public/sw.js` network-first SW (always fresh online, cache only offline; skips /api,/admin) registered by `components/ServiceWorker.tsx`; `appleWebApp` metadata.
- **Fonts:** added Dancing Script (`--font-signature`) — handwritten "Samuvel" logo replaced the "SL" square in Navbar + Footer.
- Cert badge boxes are fixed-size with length-scaled font (long codes don't break layout) — both public component and admin list.

**Related memories:** [[portfolio-animations]] [[portfolio-icons]] [[portfolio-git]] [[upstash-json-gotcha]]
