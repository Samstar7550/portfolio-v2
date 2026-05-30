# Samuvel L — Portfolio

> **Building the pipelines that ship code.**

Personal portfolio of **Samuvel L**, DevOps Engineer at Tata Consultancy Services.
Built with Next.js 14, Tailwind CSS, and Framer Motion, with a Redis-backed admin
console that lets all content be edited live — no redeploy required.

---

## 🔗 Live

| Channel | URL |
|---------|-----|
| Portfolio | *deployed on Vercel* (your domain) |
| LinkedIn | https://linkedin.com/in/samuvel7550 |
| GitHub | https://github.com/Samstar7550 |

---

## ✨ Features

### Front-end
- **Dark / Light theme** — dark by default, toggled via `next-themes`
- **Animated typewriter hero** — cycles through DevOps / Cloud / System Engineer
- **Command palette** — `⌘K` / `Ctrl+K` for navigation, theme toggle, resume, links (`cmdk`)
- **Framer Motion** — section entry animations, hover effects, staggered children
- **Cursor spotlight** — radial gradient follows the mouse on desktop
- **Timeline experience**, colour-coded **skill grid**, **certification** & **project** cards
- **GitHub activity feed** — live recent public events via the GitHub API
- **Lead-capture widget** — floating "Hiring?" card (opt-in, with consent note)
- **Contact form** — server-side via Resend (no public API keys in the browser)
- **Fully responsive**, accessible (skip link, focus rings, `prefers-reduced-motion`)
- **Fonts** — Bricolage Grotesque (headings) + Outfit (body) via `next/font`

### Admin console (`/admin`)
- **Password login** (bcrypt-hashed) gated to `ADMIN_EMAIL`
- **Live content editing** — Skills, Experience, Projects, Certifications, profile
  photo, resume, and the "Open to Work" toggle, all stored in Redis and rendered
  without a redeploy
- **Icon / photo uploads** — Vercel Blob (private), served through a proxy route
- **Resume upload** — PDF auto-compressed client-side (pdf-lib) before upload
- **Analytics dashboard** — 30-day visitor chart (recharts)
- **Change password** — OTP emailed to the admin address
- **Change notifications** — every content save emails the admin

### Analytics & automation
- **Visitor counter** — total + per-day, in Redis
- **Visitor tracking** — country/city (IP geo), browser/OS/device, referrer
- **Lead capture** — contact-form submitters + widget sign-ups stored as leads
- **Nightly digest** — one Vercel Cron email (18:00 UTC) with analytics, new
  leads, and new visitors since the last run

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Theme | next-themes |
| Email | Resend |
| Data / cache | Upstash Redis |
| File storage | Vercel Blob (private) |
| Auth hashing | bcryptjs |
| Charts | recharts |
| Command menu | cmdk |
| Icons | lucide-react + simple-icons |
| Hosting / cron | Vercel |

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- Upstash Redis database + Resend account (for full functionality)

### Setup

```bash
git clone https://github.com/Samstar7550/portfolio-v2.git
cd portfolio-v2
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🔑 Environment Variables

Set these in `.env.local` (local) and the Vercel dashboard (production):

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Only email allowed to log into `/admin` and receive OTP / notifications (server-only — never exposed to the browser) |
| `ADMIN_PASSWORD` | Initial admin password (seeded into Redis on first login, then change in-app) |
| `RESEND_API_KEY` | Resend API key — contact form, digest, OTP, notifications |
| `FROM_EMAIL` | Sender address (must be a Resend-verified domain) |
| `CONTACT_EMAIL` | Where contact-form messages are delivered |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact email displayed in the Contact section |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Redis — content, counters, visitors, leads, sessions |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-set in prod; dev token from the dashboard) |
| `CRON_SECRET` | Bearer secret protecting `/api/cron/digest` (`openssl rand -hex 32`) |
| `GITHUB_TOKEN` | *(optional)* raises GitHub API rate limit for the activity feed |

> **Security:** `RESEND_API_KEY`, the Redis token, and the Blob token are
> server-only — never prefixed with `NEXT_PUBLIC_`. Rotate any secret that is
> ever pasted into a chat, commit, or screenshot.

---

## 🗂 Admin Console

Visit `/admin` (also reachable via the small ⚙ in the footer). Sign in with
`ADMIN_EMAIL` + your password. From there you can:

- Toggle **Open to Work** (hero badge)
- Upload a new **profile photo**
- Add / edit / delete **Skills**, **Experience**, **Projects** (with per-item icon uploads)
- View the **30-day analytics** chart, plus **Recent Leads** and **Recent Visitors**
  (geo, browser/OS/device, referrer) — the same data as the nightly digest
- **Change your password** (OTP sent to the admin email)

Content is read by the public components from `/api/content?type=...`, which
falls back to hard-coded defaults in `lib/content.ts` if Redis is empty.

---

## 📨 Nightly Digest

`vercel.json` schedules `/api/cron/digest` at **18:00 UTC** (≈ 23:30 IST). The
cron sends a single email to `ADMIN_EMAIL` containing:

- Views today + total
- 🔥 New leads (contact form + widget) since the last run
- New visitors (geo, browser/OS/device, referrer) since the last run

The endpoint is protected by `Authorization: Bearer ${CRON_SECRET}`.

---

## 📁 Project Structure

```
portfolio-v2/
├── app/
│   ├── globals.css           # CSS variables, dark/light tokens, cmdk styles
│   ├── layout.tsx            # Root layout, fonts, favicon metadata, ThemeProvider
│   ├── page.tsx              # Public site — assembles all sections
│   ├── error.tsx             # Route-level error boundary
│   ├── global-error.tsx      # Root error boundary
│   ├── admin/page.tsx        # Admin console (login + content editors + analytics)
│   ├── stats/page.tsx        # Redirects to /admin
│   └── api/
│       ├── admin/            # login, otp, change-password, session, upload
│       ├── blob/             # proxy for private Vercel Blob files
│       ├── content/          # GET (public) / PUT (admin) live content
│       ├── contact/          # contact form → Resend + lead
│       ├── cron/digest/      # nightly analytics + leads + visitors email
│       ├── github/           # GitHub activity feed
│       ├── lead/             # hiring-widget submissions
│       ├── stats/            # admin-only analytics data
│       └── views/            # visitor counter + visitor tracking
├── components/               # Hero, Navbar, Skills, Projects, LeadCapture, etc.
├── lib/
│   ├── animations.ts         # shared Framer Motion variants
│   ├── content.ts            # content types + hard-coded defaults
│   ├── lead.ts               # Lead type + Redis keys
│   └── visitor.ts            # UA parser, IP geolocation, formatting
├── hooks/useReducedMotion.ts
├── scripts/                  # favicon + resume generators
├── public/                   # favicons, og-image, resume.pdf, profile photo
├── vercel.json               # cron schedule
├── Dockerfile                # legacy container build (deployment is Vercel)
├── .env.example
└── README.md
```

---

## 📄 Resume

`public/resume.pdf` powers the **Download Resume** button. Regenerate it with:

```bash
npm run resume   # scripts/generate-resume.mjs (puppeteer)
```

---

## 🧑‍💻 Author

**Samuvel L** — DevOps Engineer @ TCS
[LinkedIn](https://linkedin.com/in/samuvel7550) · [GitHub](https://github.com/Samstar7550)
