// Generates public/resume.pdf in the original resume format:
// US Letter, Calibri/Carlito, navy section headings, grey italic dates.
//
//   node scripts/generate-resume.mjs
//
// Optional environment variables:
//   RESUME_EMAIL     contact email   (default: contact@samuvel.in)
//   RESUME_PHONE     phone number    (omitted when not set; keep it out of git)
//   CHROME_PATH      Chrome/Chromium executable (default: /usr/bin/google-chrome)
//   RESUME_PREVIEW   if set, also writes a PNG preview to this path
import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

const contactPlain = [
  "Chennai, India",
  process.env.RESUME_EMAIL || "contact@samuvel.in",
  process.env.RESUME_PHONE,
].filter(Boolean);
const contactLinks = ["samuvel.in", "linkedin.com/in/samuvel7550", "github.com/Samstar7550"];

const summary =
  "DevOps and Systems Engineer with nearly 2 years of experience designing and building production-grade " +
  "training infrastructure using Kubernetes, Docker, Ansible, Jenkins, GitLab, and Azure DevOps. Ranked 6th out of " +
  "279 (top 2%) in the TCS Ignite cohort, leading to placement on the Talent Development team. Azure-certified " +
  "(AZ-104, AZ-900) with hands-on experience independently architecting and deploying full-stack, multi-tenant " +
  "SaaS products end-to-end, including cloud infrastructure, CI/CD, caching, and storage. Brings a full-stack " +
  "development background to DevOps work, offering a complete view of the software delivery lifecycle from code " +
  "to production.";

const skills = [
  ["Cloud", "Microsoft Azure (Virtual Machines, Networking, Storage, IAM, Azure CLI), Azure DevOps"],
  ["Containers & Orchestration", "Docker, Kubernetes, Helm"],
  ["Infrastructure as Code", "Terraform, Bicep"],
  ["CI/CD & Automation", "Jenkins, GitHub Actions, Ansible, Azure Pipelines"],
  ["Operating Systems", "Linux"],
  ["Programming & Scripting", "Python, Java"],
  ["Version Control", "Git, GitHub, GitLab"],
  ["Full-Stack Development", "Next.js, React, TypeScript, MongoDB, Tailwind CSS"],
  ["Design", "Figma, Adobe Photoshop, UI/UX Design"],
];

const experience = [
  {
    title: "System Engineer",
    org: "Tata Consultancy Services",
    dates: "Jan 2026 – Present",
    bullets: [
      "Lead design and delivery of advanced DevOps training programs covering Kubernetes, CI/CD, and Azure for incoming engineers",
      "Build hands-on challenge environments across Docker, Kubernetes, Ansible, Jenkins, GitLab, and Azure DevOps, simulating real production failure scenarios",
      "Develop training curricula aligned with real-world production requirements and current industry best practices",
    ],
  },
  {
    title: "Assistant System Engineer",
    org: "Tata Consultancy Services",
    dates: "Sep 2025 – Dec 2025",
    bullets: [
      "Designed and delivered Azure cloud training covering virtual machines, networking, storage, IAM, and Azure CLI",
      "Created hands-on lab exercises for provisioning and configuring Azure environments",
      "Collaborated with senior engineers to align training content with current Azure best practices",
    ],
  },
  {
    title: "Assistant System Engineer Trainee",
    org: "Tata Consultancy Services",
    dates: "Jan 2025 – Aug 2025",
    bullets: [
      "Built hands-on challenge environments using Docker, Kubernetes, Ansible, Jenkins, and GitLab for engineer skill assessments",
      "Designed training content on Docker architecture, Kubernetes orchestration, and Azure DevOps pipelines",
      "Supported new engineers through onboarding labs covering core DevOps tooling and workflows",
    ],
  },
  {
    title: "Graduate Trainee",
    org: "Tata Consultancy Services",
    dates: "Sep 2024 – Dec 2024",
    bullets: [
      "Ranked 6th out of 279 (top 2%) in the TCS Ignite onboarding cohort; selected for the Talent Development team based on performance",
    ],
  },
  {
    title: "Freelance Graphic & UI/UX Designer",
    org: "Self-Employed",
    dates: "Sep 2022 – Sep 2024",
    bullets: [
      "Delivered logo, web, and UI/UX design projects for clients over 2 years using Figma and Adobe Photoshop",
    ],
  },
];

const projects = [
  {
    name: "DevOps Challenge Environments",
    link: "Internal TCS project, 2025",
    isLink: false,
    bullets: [
      "Designed broken Kubernetes and Docker environments for TCS engineer assessments; engineers diagnosed and fixed real infrastructure issues such as pod crashes, misconfigured services, and failed pipelines",
      "Stack: Kubernetes, Docker, Ansible, Jenkins, GitLab, Azure DevOps",
    ],
  },
  {
    name: "Prezenta — Multi-Tenant Portfolio SaaS",
    link: "prezenta.in",
    isLink: true,
    bullets: [
      "Architected and built a production multi-tenant SaaS platform serving 9 profession groups with 54 unique template combinations",
      "Stack: Next.js 15 (App Router), TypeScript, MongoDB Atlas, Upstash Redis (caching, rate limiting), Cloudflare R2 (storage), NextAuth v5",
      "Implemented OTP authentication, page-level caching, and analytics counters using Redis; deployed on Vercel",
    ],
  },
  {
    name: "Personal Portfolio Platform",
    link: "samuvel.in",
    isLink: true,
    bullets: [
      "Built a live-editable portfolio site with an admin console enabling content updates without redeployment",
      "Stack: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Upstash Redis, Vercel Blob, Resend",
    ],
  },
  {
    name: "VizualizeHub — AI Image Editing SaaS",
    link: "vizualizehub.vercel.app",
    isLink: true,
    bullets: [
      "Built a full-stack image editing application with AI-powered transformations, user authentication, and credit-based billing",
      "Stack: Next.js, TypeScript, MongoDB, Cloudinary, Clerk, Vercel",
    ],
  },
];

const education = {
  degree: "B.Sc. Computer Science",
  school: "Sankara College of Arts & Science",
  dates: "2021 – 2024",
  note: "Aggregate: 89%",
};

// "Name — Issuer, Mon YYYY"
const certifications = [
  "GitHub Actions Certified — GitHub, Oct 2026",
  "Claude Certified Developer: Foundations — Anthropic, Sep 2026",
  "Microsoft Certified: Azure Administrator Associate (AZ-104) — Microsoft, Jun 2026",
  "GitHub Copilot Certified — GitHub, Mar 2026",
  "Microsoft Certified: Azure Fundamentals (AZ-900) — Microsoft, Aug 2025",
];

const additional = [
  ["Languages", "English (Professional), Tamil (Native)"],
  ["Interests", "DevOps automation, cloud architecture, UI/UX design, building independent SaaS products"],
];

// ---------------------------------------------------------------------------
// Markup
// ---------------------------------------------------------------------------

const bullets = (list) => `<ul>${list.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;
const section = (title, body) => `<section><h2>${esc(title)}</h2>${body}</section>`;
const SEP = `<span class="pipe">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`;

const contactHtml =
  contactPlain.map((c) => `<span>${esc(c)}</span>`).join(SEP) +
  SEP +
  contactLinks.map((l) => `<a>${esc(l)}</a>`).join(SEP);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Samuvel L - Resume</title>
<style>
  @page { size: Letter; margin: 0.55in 0.75in 0.6in 0.75in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #fff; }
  body {
    background: #fff;
    font-family: Carlito, Calibri, 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.3;
    color: #000;
  }
  h1 { font-size: 22pt; font-weight: 700; color: #1a1a1a; line-height: 1.15; }
  .role { font-size: 12pt; font-weight: 700; color: #1f4e79; margin-top: 3px; }
  .contact { font-size: 10pt; color: #595959; margin-top: 5px; line-height: 1.35; }
  .contact a { color: #1f4e79; text-decoration: underline; }
  .pipe { color: #bfbfbf; }
  .hdr-rule { border: 0; border-top: 1px solid #d9d9d9; margin: 7px 0 0; }
  section { margin-top: 15px; }
  h2 {
    font-size: 10.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #1f4e79;
    border-bottom: 1.4px solid #1f4e79;
    padding-bottom: 3px;
    margin-bottom: 8px;
    break-after: avoid;
  }
  .skill-row { margin-bottom: 4px; }
  .skill-row b { font-weight: 700; }
  .item { margin-bottom: 9px; break-inside: avoid; }
  .head { display: flex; justify-content: space-between; align-items: baseline; padding-right: 54pt; }
  .head .title { font-weight: 700; }
  .head .dash, .head .org { color: #595959; }
  .head .org { margin-left: 0; }
  .head .date { font-style: italic; color: #595959; font-size: 10pt; white-space: nowrap; }
  .head .link { font-style: italic; color: #1f4e79; font-size: 10pt; white-space: nowrap; }
  .head .link.plain { color: #595959; }
  ul { list-style: disc; padding-left: 16pt; margin-top: 3px; }
  li { margin-bottom: 3.2pt; padding-left: 1pt; }
  .note { color: #595959; font-size: 9.5pt; margin-top: 1px; }
  p.summary { }
</style>
</head>
<body>
  <header>
    <h1>Samuvel L</h1>
    <div class="role">DevOps &amp; Cloud Engineer</div>
    <div class="contact">${contactHtml}</div>
    <hr class="hdr-rule">
  </header>

  ${section("Professional Summary", `<p class="summary">${esc(summary)}</p>`)}

  ${section(
    "Technical Skills",
    skills.map(([k, v]) => `<div class="skill-row"><b>${esc(k)}:</b> ${esc(v)}</div>`).join(""),
  )}

  ${section(
    "Experience",
    experience
      .map(
        (e) => `<div class="item">
      <div class="head">
        <div><span class="title">${esc(e.title)}</span> <span class="dash">&nbsp;—&nbsp;</span> <span class="org">${esc(e.org)}</span></div>
        <div class="date">${esc(e.dates)}</div>
      </div>
      ${bullets(e.bullets)}
    </div>`,
      )
      .join(""),
  )}

  ${section(
    "Projects",
    projects
      .map(
        (p) => `<div class="item">
      <div class="head">
        <div class="title">${esc(p.name)}</div>
        <div class="link${p.isLink ? "" : " plain"}">${esc(p.link)}</div>
      </div>
      ${bullets(p.bullets)}
    </div>`,
      )
      .join(""),
  )}

  ${section(
    "Education",
    `<div class="head"><div><span class="title">${esc(education.degree)}</span> <span class="dash">&nbsp;—&nbsp;</span> <span class="org">${esc(education.school)}</span></div><div class="date">${esc(education.dates)}</div></div>
     <div class="note">${esc(education.note)}</div>`,
  )}

  ${section("Certifications", bullets(certifications))}

  ${section(
    "Additional Information",
    additional.map(([k, v]) => `<div class="skill-row"><b>${esc(k)}:</b> ${esc(v)}</div>`).join(""),
  )}
</body>
</html>`;

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: "domcontentloaded" });

if (process.env.RESUME_PREVIEW) {
  await page.setViewport({ width: 816, height: 1056 });
  await page.screenshot({ path: process.env.RESUME_PREVIEW, fullPage: true });
}

const pdf = await page.pdf({
  format: "Letter",
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();

writeFileSync(join(__dirname, "../public/resume.pdf"), pdf);
console.log("✓ Resume generated → public/resume.pdf");
