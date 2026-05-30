# Samuvel L — Portfolio

> **Building the pipelines that ship code.**

The personal portfolio of **Samuvel L**, DevOps Engineer at Tata Consultancy Services — but more than a portfolio, it's a small **full-stack web application**: a Next.js 14 front-end backed by a Redis-powered, self-serve CMS, file storage, transactional email, scheduled jobs, and a password-protected admin console. Every section, the blog, and most settings can be edited **live, without a redeploy**.

---

## 🎯 Purpose & Goals

**What it's for**

- A single, polished home for Samuvel's professional story — experience, skills, certifications, awards, projects (web + UI/UX), testimonials, and a technical blog.
- A lead-generation surface: a contact form, a "hiring?" capture widget, and an optional booking link, all feeding a nightly digest.

**What it's meant to prove (the real goal)**

A DevOps/Cloud engineer who also designs and builds full-stack — so the site itself is the evidence:

- **Owns the whole delivery lifecycle** — design → frontend → backend → data → email → deploy → observability.
- **Thinks in infrastructure terms** — live uptime checks on project links, rate limiting, SSRF guards, cron jobs, cache-busting, a PWA service worker.
- **Ships maintainable software** — typed content model, a real CMS instead of hardcoded text, code-splitting for performance, SEO, and accessibility baked in.

---

## 🔗 Live

| Channel | URL |
|---------|-----|
| Portfolio | **https://www.samuvel.in** |
| Blog | https://www.samuvel.in/blog |
| LinkedIn | https://linkedin.com/in/samuvel7550 |
| GitHub | https://github.com/Samstar7550 |

> Auto-deploys from `main` on Vercel. (`portfolio-v2.vercel.app` may point to an older deploy — `www.samuvel.in` is canonical.)

---

## 🏗 Architecture at a glance

```
                 ┌──────────────────────────────────────────────┐
   Visitor ───▶  │  Next.js 14 (App Router) on Vercel            │
                 │  • SSR pages (/, /blog, /blog/[slug])         │
                 │  • Client sections fetch /api/content         │
                 └───────────────┬──────────────────────────────┘
                                 │  API routes (serverless)
        ┌────────────────────────┼─────────────────────────────┐
        ▼                        ▼                              ▼
  Upstash Redis            Vercel Blob                      Resend
  • content (CMS)          • photos / resume                • contact + auto-reply
  • sessions / OTP         • wireframes / icons             • OTP login
  • visitors / leads       (private, proxied)               • nightly digest
  • rate limits / cache
                                 ▲
                          Vercel Cron (18:00 UTC) ──▶ /api/cron/digest
```

- **Content model** lives in `lib/content.ts` (typed defaults). At runtime, client components fetch `/api/content?type=X` (Redis, falling back to defaults). Blog pages read Redis **server-side** via `lib/redis-content.ts` for SEO.
- **No redeploy to edit** — the `/admin` console writes to Redis; the public site reflects changes immediately.

---

## ✨ Features

### Public site
- **Hero** with animated typewriter roles, availability badge, and a floating stat card.
- **About** with bio, quick facts, education, animated stats, and a "currently learning" pill.
- **Experience** timeline, **Skills** grid with optional per-category **proficiency bars**, **Certifications**, **Awards & Recognition**, **Testimonials** carousel.
- **Projects** as a light "work hub" — filter by Web / DevOps / Design, **image galleries with a fullscreen lightbox**, **live up/down + latency status badges** on deployed links, optional **"View in Figma"** and **case-study modal** (markdown).
- **Blog** (`/blog`) — server-rendered, markdown posts with tags, cover images, RSS, and per-post SEO.
- **GitHub activity feed**, **lead-capture widget**, **contact form** (+ optional "Book a call").
- **Command palette** (`⌘K`/`Ctrl+K`), cursor spotlight, scroll progress, back-to-top, loading screen.
- **10-palette accent switcher** (light/dark pairs), dark/light theme, handwritten signature logo.
- **Installable PWA**, fully responsive, accessible (skip link, focus rings, `prefers-reduced-motion`).

### Admin console (`/admin`)
- **OTP + password login** (bcrypt), gated to `ADMIN_EMAIL`; in-app password change & forgot-password, both via emailed OTP.
- **Live editing** of every content section + the blog (markdown editor, auto-slug, publish toggle).
- **Settings** — Open-to-Work toggle, profile photo, resume (client-side PDF compression), palette picker, booking link.
- **Storage** — list Vercel Blob files; delete a file **and auto-strip its Redis references**; reset any section to defaults.
- **Analytics** — 30-day visitor chart + audience breakdowns (device / browser / referrer / country); recent leads & visitors.
- **Change notifications** — every save emails the admin a diff of what changed.

### Backend / automation
- **Visitor analytics** — total + per-day counts, IP geo, UA parsing, referrer; 30-day retention.
- **Lead capture** — contact + widget submissions stored as leads.
- **Contact hardening** — honeypot, per-IP rate limit (5/hr), email validation, branded auto-reply to the sender.
- **Nightly digest** — one Vercel Cron email (18:00 UTC) with analytics + new leads + new visitors.
- **Live status checks** — `/api/status` pings project links (SSRF-guarded, 5-min cached).

### SEO & performance
- `metadataBase`, Open Graph / Twitter cards, **JSON-LD `Person`** structured data.
- `app/sitemap.ts` (includes published posts), `app/robots.ts` (disallow `/admin`, `/api`), `/rss.xml`.
- **Cache-busting favicon** via `app/icon.svg` (content-hashed); palette-neutral design.
- **Code-splitting** — markdown rendering is loaded only when a case study/post is opened, keeping it off the homepage bundle.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Animations | Framer Motion |
| Theme | next-themes (dark default) |
| Data / cache | Upstash Redis |
| File storage | Vercel Blob (private, proxied) |
| Email | Resend |
| Auth | OTP + bcryptjs sessions |
| Markdown | react-markdown + remark-gfm |
| Charts | Recharts (admin only) |
| Command menu | cmdk |
| Icons | lucide-react + simple-icons |
| Fonts | Bricolage Grotesque, Outfit, Dancing Script (`next/font`) |
| PWA | network-first service worker |
| Hosting / cron | Vercel |

---

## 🔌 API Reference

All routes are Next.js Route Handlers under `app/api/`. Admin routes require `Authorization: Bearer <session-token>`.

### Content
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/content?type=<key>` | public | Read a content section from Redis (seeds defaults if empty) |
| `PUT` | `/api/content?type=<key>` | admin | Save a section; emails the admin a diff of changes |
| `DELETE` | `/api/content?type=<key>` | admin | Reset a section to its built-in defaults |

`type` ∈ `settings · profile · skills · experience · projects · certifications · awards · testimonials · blog`

### Admin / auth
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/login` | Email + password → 24h session token |
| `GET` | `/api/admin/session` | Validate a session token |
| `POST` | `/api/admin/otp` | (session) send change-password OTP |
| `POST` | `/api/admin/change-password` | (session) verify OTP + set new password |
| `POST` | `/api/admin/forgot` | Send reset OTP to `ADMIN_EMAIL` (no email enumeration) |
| `POST` | `/api/admin/reset-password` | Verify reset OTP + set new password |
| `POST` | `/api/admin/upload` | (session) upload a file to Vercel Blob → proxy URL |
| `GET` | `/api/admin/blobs` | (session) list uploaded Blob files |
| `DELETE` | `/api/admin/blobs` | (session) delete a Blob file **and clear its Redis references** |
| `GET` | `/api/admin/activity` | (session) newest 50 leads + 50 visitors |

### Public / utility
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/blob?src=<blob-url>` | Proxy/stream a private Blob file (SSRF-guarded to `*.blob.vercel-storage.com`) |
| `POST` | `/api/contact` | Contact form → Resend + stored lead (honeypot, rate-limit, auto-reply) |
| `POST` | `/api/lead` | Hiring-widget signup (validated, 1/IP/hour) |
| `GET` | `/api/status?url=<project-link>` | Ping a project link → `{ok,status,ms}` (allow-listed to project URLs, 5-min cache) |
| `GET`/`POST` | `/api/views` | Visitor counter (GET total / POST increment + track) |
| `GET` | `/api/stats` | (admin) 30-day analytics series |
| `GET` | `/api/github` | Recent public GitHub events |
| `GET` | `/api/cron/digest` | Nightly digest email (Bearer `CRON_SECRET`) |

### File-convention routes
`app/sitemap.ts` → `/sitemap.xml` · `app/robots.ts` → `/robots.txt` · `app/rss.xml/route.ts` → `/rss.xml` · `app/icon.svg` (hashed favicon) · `app/apple-icon.png`

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+, npm 10+
- An Upstash Redis database + Resend account (for full functionality)

### Setup
```bash
git clone https://github.com/Samstar7550/portfolio-v2.git
cd portfolio-v2
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

### Scripts
```bash
npm run dev       # local dev server
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint
npm run resume    # regenerate public/resume.pdf (puppeteer)
node scripts/generate-favicons.mjs   # regenerate favicon set + OG image
```

---

## 🔑 Environment Variables

Set in `.env.local` (local) and the Vercel dashboard (production):

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Only email allowed into `/admin` + OTP/notifications (server-only) |
| `ADMIN_PASSWORD` | Initial admin password (seeded to Redis on first login, then changed in-app) |
| `RESEND_API_KEY` | Resend key — contact, auto-reply, OTP, digest, notifications |
| `FROM_EMAIL` | Sender address (Resend-verified domain) |
| `CONTACT_EMAIL` | Where contact-form messages are delivered |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email shown in the UI |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis — content, counters, visitors, leads, sessions, rate limits |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-set in prod; dev token from the dashboard) |
| `CRON_SECRET` | Bearer secret for `/api/cron/digest` (`openssl rand -hex 32`) |
| `GITHUB_TOKEN` | *(optional)* raises the GitHub API rate limit for the activity feed |

> **Security:** secrets are server-only — never `NEXT_PUBLIC_`-prefixed. Rotate anything pasted into a chat, commit, or screenshot.

---

## 📁 Project Structure

```
portfolio-v2/
├── app/
│   ├── globals.css            # design tokens, .blog-prose, admin scrollbar, cmdk
│   ├── layout.tsx             # fonts, metadata, JSON-LD, providers, service worker
│   ├── page.tsx               # public site — assembles all sections
│   ├── icon.svg               # hashed favicon (palette-neutral)
│   ├── apple-icon.png
│   ├── sitemap.ts · robots.ts # SEO
│   ├── rss.xml/route.ts       # blog RSS feed
│   ├── admin/page.tsx         # admin console (auth + editors + storage + analytics)
│   ├── blog/                  # /blog list + /blog/[slug] (server-rendered)
│   ├── stats/page.tsx
│   └── api/                   # content, admin/*, blob, contact, lead, status,
│                              #   views, stats, github, cron/digest
├── components/                # Hero, Navbar, Skills, Projects, Blog, CaseStudyModal…
├── lib/
│   ├── content.ts             # typed content model + defaults + palettes
│   ├── redis-content.ts       # server-side Redis read (blog SSR)
│   ├── animations.ts · lead.ts · visitor.ts
├── hooks/useReducedMotion.ts
├── scripts/                   # favicon + resume generators
├── public/                    # favicons, og-image, resume.pdf, photo, sw.js
├── vercel.json                # cron schedule
├── .env.example
└── README.md
```

---

## 📨 Nightly Digest

`vercel.json` schedules `/api/cron/digest` at **18:00 UTC** (≈ 23:30 IST). It emails `ADMIN_EMAIL`: views today/total, new leads since the last run, and new visitors (geo, browser/OS/device, referrer). Protected by `Authorization: Bearer ${CRON_SECRET}`.

---

## 🧑‍💻 Author

**Samuvel L** — DevOps Engineer @ TCS
[LinkedIn](https://linkedin.com/in/samuvel7550) · [GitHub](https://github.com/Samstar7550)
