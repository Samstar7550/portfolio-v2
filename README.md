# Samuvel L — Portfolio

> **Building the pipelines that ship code.**

Personal portfolio of **Samuvel L**, DevOps Engineer at Tata Consultancy Services.
Built with Next.js 14, Tailwind CSS, and Framer Motion — and shipped via a Docker + GitHub Actions CI/CD pipeline (the portfolio itself is a DevOps showcase).

---

## 🔗 Live

| Channel | URL |
|---------|-----|
| Portfolio | *https://samuvel.dev* (deploy to your domain) |
| LinkedIn | https://linkedin.com/in/samuvel7550 |

---

## ✨ Features

- **Dark / Light theme** — dark by default, toggled via `next-themes`
- **Animated typewriter hero** — cycles through DevOps / Cloud / System Engineer
- **Framer Motion** — section entry animations, hover effects, staggered children
- **Timeline experience** — interactive scrollable timeline
- **Skill grid** — colour-coded logo badges per category
- **Certification cards** — with issued / in-progress status
- **Project cards** — with live links, tech tags, type icons
- **Contact form** — EmailJS powered, no backend required
- **Fully responsive** — mobile-first, looks great on any screen
- **Google Fonts** — Bricolage Grotesque (headings) + Outfit (body)

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Theme | next-themes |
| Contact | @emailjs/browser |
| Icons | lucide-react |
| Fonts | Google Fonts (next/font) |
| Container | Docker (multi-stage, standalone) |
| CI/CD | GitHub Actions → Docker Hub |

---

## 🚀 Local Development

### Prerequisites

- Node.js 20+
- npm 10+

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/samuvel7550/portfolio.git
cd portfolio

# 2. Install dependencies
npm install

# 3. Copy env file and fill in EmailJS values
cp .env.example .env.local

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📧 EmailJS Setup (Contact Form)

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Add a new **Email Service** (Gmail, Outlook, etc.)
3. Create a new **Email Template** — use the variables:
   - `{{name}}` — sender's name
   - `{{email}}` — sender's email
   - `{{message}}` — message body
4. Copy your **Service ID**, **Template ID**, and **Public Key**
5. Add them to `.env.local`:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

---

## 🐳 Docker

### Build locally

```bash
docker build -t portfolio .
docker run -p 3000:3000 portfolio
```

### With env vars (EmailJS)

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_EMAILJS_SERVICE_ID=... \
  -e NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=... \
  -e NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=... \
  portfolio
```

### Pull from Docker Hub

```bash
docker pull samuvel7550/portfolio:latest
docker run -p 3000:3000 samuvel7550/portfolio:latest
```

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` runs on every push to `main`:

```
Push to main
   │
   ▼
[Lint & Type Check]
   │  (npm run lint)
   ▼
[Build Docker Image]
   │  (docker/build-push-action)
   ▼
[Push to Docker Hub]
   (samuvel7550/portfolio:latest)
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not password) |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | EmailJS service ID |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key |

Add these at: **Repository → Settings → Secrets and variables → Actions**

---

## 📁 Project Structure

```
portfolio/
├── app/
│   ├── globals.css        # CSS variables, dark/light tokens
│   ├── layout.tsx         # Root layout, Google Fonts, ThemeProvider
│   └── page.tsx           # Assembles all sections
├── components/
│   ├── ThemeProvider.tsx  # next-themes wrapper
│   ├── Navbar.tsx         # Fixed navbar, mobile menu, theme toggle
│   ├── Hero.tsx           # Typewriter, CTAs, floating dots
│   ├── About.tsx          # Bio, stats grid, education card
│   ├── Experience.tsx     # Timeline layout
│   ├── Skills.tsx         # Animated skill badge grid
│   ├── Certifications.tsx # Cert cards with status
│   ├── Projects.tsx       # Project cards with links
│   ├── Contact.tsx        # EmailJS form + social links
│   └── Footer.tsx         # Minimal footer
├── public/
│   └── resume.pdf         # Drop your resume PDF here
├── Dockerfile             # Multi-stage production build
├── .dockerignore
├── .github/
│   └── workflows/
│       └── deploy.yml     # Build & push pipeline
├── .env.example
└── README.md
```

---

## 📄 Resume

Place your resume PDF at `public/resume.pdf` so the **Download Resume** button works.

---

## 🧑‍💻 Author

**Samuvel L** — DevOps Engineer @ TCS  
[LinkedIn](https://linkedin.com/in/samuvel7550) · [GitHub](https://github.com/samuvel7550)

---

*This portfolio is itself a DevOps project — the CI/CD pipeline that builds and deploys it is part of the showcase.*
