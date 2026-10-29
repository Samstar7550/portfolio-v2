// Generates public/resume.pdf: a single-column, ATS-friendly resume.
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

const contact = [
  "Chennai, India",
  process.env.RESUME_EMAIL || "contact@samuvel.in",
  process.env.RESUME_PHONE,
  "samuvel.in",
  "linkedin.com/in/samuvel7550",
  "github.com/Samstar7550",
].filter(Boolean);

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
  ["CI/CD & Automation", "Jenkins, GitHub Actions, Azure Pipelines, Ansible"],
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
    bullets: [
      "Designed broken Kubernetes and Docker environments for TCS engineer assessments; engineers diagnosed and fixed real infrastructure issues such as pod crashes, misconfigured services, and failed pipelines",
      "Stack: Kubernetes, Docker, Ansible, Jenkins, GitLab, Azure DevOps",
    ],
  },
  {
    name: "Prezenta: Multi-Tenant Portfolio SaaS",
    link: "prezenta.in",
    bullets: [
      "Architected and built a production multi-tenant SaaS platform serving 9 profession groups with 54 unique template combinations",
      "Stack: Next.js 15 (App Router), TypeScript, MongoDB Atlas, Upstash Redis (caching, rate limiting), Cloudflare R2 (storage), NextAuth v5",
      "Implemented OTP authentication, page-level caching, and analytics counters using Redis; deployed on Vercel",
    ],
  },
  {
    name: "Personal Portfolio Platform",
    link: "samuvel.in",
    bullets: [
      "Built a live-editable portfolio site with an admin console enabling content updates without redeployment",
      "Stack: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Upstash Redis, Vercel Blob, Resend",
    ],
  },
  {
    name: "VizualizeHub: AI Image Editing SaaS",
    link: "vizualizehub.vercel.app",
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

const certifications = [
  ["Microsoft Certified: Azure Administrator Associate (AZ-104)", "Microsoft, Jun 2026"],
  ["Microsoft Certified: Azure Fundamentals (AZ-900)", "Microsoft, Aug 2025"],
  ["GitHub Copilot Certified", "GitHub, Mar 2026"],
];

const additional = [
  ["Languages", "English (Professional), Tamil (Native)"],
  ["Interests", "DevOps automation, cloud architecture, UI/UX design, building independent SaaS products"],
];

// ---------------------------------------------------------------------------
// Markup
// ---------------------------------------------------------------------------

const bullets = (list) =>
  `<ul>${list.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`;

const section = (title, body) =>
  `<section><h2>${esc(title)}</h2>${body}</section>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Samuvel L - Resume</title>
<style>
  @page { size: A4; margin: 13mm 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #fff; }
  body {
    background: #fff;
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    font-size: 9.4pt;
    line-height: 1.42;
    color: #111827;
  }
  header { text-align: center; padding-bottom: 8px; margin-bottom: 4px; }
  h1 { font-size: 21pt; font-weight: 700; letter-spacing: 0.3px; }
  .role { font-size: 11pt; color: #0F64D2; font-weight: 600; margin-top: 1px; }
  .contact { font-size: 8.6pt; color: #4b5563; margin-top: 5px; }
  .contact span + span::before { content: "  |  "; color: #9ca3af; }
  section { margin-top: 11px; }
  h2 {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: #0F64D2;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 2px;
    margin-bottom: 6px;
    break-after: avoid;
  }
  p.summary { text-align: justify; }
  .skill-row { margin-bottom: 2px; }
  .skill-row b { font-weight: 700; }
  .item { margin-bottom: 7px; break-inside: avoid; }
  .item-head { display: flex; justify-content: space-between; gap: 12px; }
  .item-head .left { font-weight: 700; }
  .item-head .left .org { font-weight: 400; color: #374151; }
  .item-head .right { color: #4b5563; white-space: nowrap; font-size: 9pt; }
  ul { padding-left: 15px; margin-top: 2px; }
  li { margin-bottom: 1.5px; }
  .link { font-weight: 400; color: #0F64D2; }
  .row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 2px; }
</style>
</head>
<body>
  <header>
    <h1>Samuvel L</h1>
    <div class="role">DevOps &amp; Cloud Engineer</div>
    <div class="contact">${contact.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
  </header>

  ${section("Professional Summary", `<p class="summary">${esc(summary)}</p>`)}

  ${section(
    "Technical Skills",
    skills
      .map(([k, v]) => `<div class="skill-row"><b>${esc(k)}:</b> ${esc(v)}</div>`)
      .join(""),
  )}

  ${section(
    "Experience",
    experience
      .map(
        (e) => `<div class="item">
      <div class="item-head">
        <div class="left">${esc(e.title)} <span class="org">&nbsp;·&nbsp; ${esc(e.org)}</span></div>
        <div class="right">${esc(e.dates)}</div>
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
      <div class="item-head">
        <div class="left">${esc(p.name)}</div>
        <div class="right link">${esc(p.link)}</div>
      </div>
      ${bullets(p.bullets)}
    </div>`,
      )
      .join(""),
  )}

  ${section(
    "Education",
    `<div class="item-head"><div class="left">${esc(education.degree)} <span class="org" style="font-weight:400">&nbsp;·&nbsp; ${esc(education.school)}</span></div><div class="right">${esc(education.dates)}</div></div>
     <div>${esc(education.note)}</div>`,
  )}

  ${section(
    "Certifications",
    certifications
      .map(([n, d]) => `<div class="row"><div>${esc(n)}</div><div style="color:#4b5563;white-space:nowrap">${esc(d)}</div></div>`)
      .join(""),
  )}

  ${section(
    "Additional Information",
    additional
      .map(([k, v]) => `<div class="skill-row"><b>${esc(k)}:</b> ${esc(v)}</div>`)
      .join(""),
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
  await page.setViewport({ width: 794, height: 1123 });
  await page.screenshot({ path: process.env.RESUME_PREVIEW, fullPage: true });
}

const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();

writeFileSync(join(__dirname, "../public/resume.pdf"), pdf);
console.log("✓ Resume generated → public/resume.pdf");
