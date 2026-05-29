import puppeteer from "puppeteer";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));

const photoBuffer = await sharp(join(__dirname, "../public/SAM.JPG"))
  .resize(200, 200, { fit: "cover", position: "top" })
  .jpeg({ quality: 85 })
  .toBuffer();
const photoSrc = `data:image/jpeg;base64,${photoBuffer.toString("base64")}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    color: #0D1117;
    background: #fff;
    font-size: 9.5pt;
    line-height: 1.5;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    display: grid;
    grid-template-columns: 195px 1fr;
  }

  /* ── SIDEBAR ── */
  .sidebar {
    background: #0D1117;
    color: #E6EDF3;
    padding: 28px 18px;
  }

  .photo {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    display: block;
    margin: 0 auto 22px;
    border: 3px solid #0F64D2;
    box-shadow: 0 0 0 3px rgba(15,100,210,0.25);
  }

  .sb-section { margin-bottom: 20px; }

  .sb-title {
    font-size: 6.5pt;
    font-weight: 700;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: #0F64D2;
    border-bottom: 1px solid #1e3a5f;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }

  .contact-row { margin-bottom: 7px; }
  .contact-label {
    display: block;
    font-size: 6pt;
    color: #0F64D2;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 1px;
  }
  .contact-val { font-size: 7.5pt; color: #8B949E; word-break: break-all; }

  .skill-group { margin-bottom: 9px; }
  .skill-group-name {
    font-size: 6.5pt;
    color: #0F64D2;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .skill-tags { display: flex; flex-wrap: wrap; gap: 3px; }
  .skill-tag {
    background: rgba(15,100,210,0.18);
    color: #93c5fd;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 7pt;
    border: 1px solid rgba(15,100,210,0.3);
  }

  .cert-item { margin-bottom: 8px; }
  .cert-name { font-size: 7.5pt; color: #E6EDF3; font-weight: 600; line-height: 1.3; }
  .cert-meta { font-size: 6.5pt; color: #8B949E; margin-top: 1px; }

  /* ── MAIN ── */
  .main { padding: 28px 26px 24px 22px; }

  .hd-name {
    font-size: 21pt;
    font-weight: 700;
    color: #0D1117;
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .hd-title {
    font-size: 10.5pt;
    color: #0F64D2;
    font-weight: 500;
    margin-top: 3px;
    margin-bottom: 12px;
  }

  .summary {
    font-size: 8.5pt;
    color: #4a5568;
    line-height: 1.6;
    padding-bottom: 13px;
    border-bottom: 2px solid #0F64D2;
    margin-bottom: 14px;
  }

  .section { margin-bottom: 14px; }

  .section-title {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.8px;
    color: #0F64D2;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 10px;
  }

  .exp-item {
    margin-bottom: 10px;
    padding-left: 10px;
    border-left: 2px solid #e2e8f0;
  }
  .exp-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
  }
  .exp-role { font-size: 9pt; font-weight: 600; color: #0D1117; }
  .exp-period { font-size: 7pt; color: #718096; white-space: nowrap; flex-shrink: 0; }
  .exp-company { font-size: 8pt; color: #0F64D2; font-weight: 500; margin-bottom: 3px; }
  .exp-bullets { list-style: none; margin-top: 3px; }
  .exp-bullets li {
    font-size: 8pt;
    color: #4a5568;
    padding-left: 11px;
    position: relative;
    margin-bottom: 2px;
    line-height: 1.4;
  }
  .exp-bullets li::before {
    content: '▸';
    position: absolute;
    left: 0;
    color: #0F64D2;
    font-size: 7pt;
    top: 1px;
  }

  .project-item {
    margin-bottom: 8px;
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    border-left: 3px solid #0F64D2;
  }
  .proj-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3px;
  }
  .proj-name { font-size: 9pt; font-weight: 600; color: #0D1117; }
  .proj-period { font-size: 7pt; color: #718096; }
  .proj-desc { font-size: 7.5pt; color: #4a5568; margin-bottom: 5px; line-height: 1.4; }
  .proj-tags { display: flex; flex-wrap: wrap; gap: 3px; }
  .proj-tag {
    background: #f0f4ff;
    color: #0F64D2;
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 6.5pt;
    border: 1px solid #dbeafe;
  }

  .edu-row { display: flex; justify-content: space-between; align-items: flex-start; }
  .edu-degree { font-size: 9pt; font-weight: 600; color: #0D1117; }
  .edu-school { font-size: 8pt; color: #4a5568; margin-top: 1px; }
  .edu-right { text-align: right; flex-shrink: 0; }
  .edu-score { font-size: 9pt; font-weight: 600; color: #0F64D2; }
  .edu-year { font-size: 7pt; color: #718096; margin-top: 1px; }

  .page-break { break-before: page; padding-top: 24px; }

  .highlight-badge {
    display: inline-block;
    background: #fff7ed;
    color: #c05621;
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 7pt;
    font-weight: 700;
    border: 1px solid #fed7aa;
    margin-right: 4px;
  }
</style>
</head>
<body>
<div class="page">

  <!-- SIDEBAR -->
  <div class="sidebar">
    <img class="photo" src="${photoSrc}" alt="Samuvel L" />

    <div class="sb-section">
      <div class="sb-title">Contact</div>
      <div class="contact-row">
        <span class="contact-label">Email</span>
        <span class="contact-val">samstar7550@gmail.com</span>
      </div>
      <div class="contact-row">
        <span class="contact-label">LinkedIn</span>
        <span class="contact-val">linkedin.com/in/samuvel7550</span>
      </div>
      <div class="contact-row">
        <span class="contact-label">GitHub</span>
        <span class="contact-val">github.com/Samstar7550</span>
      </div>
      <div class="contact-row">
        <span class="contact-label">Location</span>
        <span class="contact-val">Remote · India</span>
      </div>
    </div>

    <div class="sb-section">
      <div class="sb-title">Skills</div>
      <div class="skill-group">
        <div class="skill-group-name">DevOps</div>
        <div class="skill-tags">
          <span class="skill-tag">Kubernetes</span>
          <span class="skill-tag">Docker</span>
          <span class="skill-tag">Ansible</span>
          <span class="skill-tag">Jenkins</span>
          <span class="skill-tag">GitLab</span>
          <span class="skill-tag">Azure DevOps</span>
        </div>
      </div>
      <div class="skill-group">
        <div class="skill-group-name">Cloud</div>
        <div class="skill-tags">
          <span class="skill-tag">Microsoft Azure</span>
        </div>
      </div>
      <div class="skill-group">
        <div class="skill-group-name">CI/CD</div>
        <div class="skill-tags">
          <span class="skill-tag">GitHub Actions</span>
          <span class="skill-tag">Jenkins Pipelines</span>
          <span class="skill-tag">GitLab CI</span>
        </div>
      </div>
      <div class="skill-group">
        <div class="skill-group-name">Web Dev</div>
        <div class="skill-tags">
          <span class="skill-tag">Next.js</span>
          <span class="skill-tag">React</span>
          <span class="skill-tag">TypeScript</span>
          <span class="skill-tag">MongoDB</span>
          <span class="skill-tag">Tailwind CSS</span>
        </div>
      </div>
      <div class="skill-group">
        <div class="skill-group-name">Design</div>
        <div class="skill-tags">
          <span class="skill-tag">Figma</span>
          <span class="skill-tag">Photoshop</span>
        </div>
      </div>
    </div>

    <div class="sb-section">
      <div class="sb-title">Certifications</div>
      <div class="cert-item">
        <div class="cert-name">Azure Fundamentals</div>
        <div class="cert-meta">AZ-900 · Microsoft · Aug 2025</div>
      </div>
      <div class="cert-item">
        <div class="cert-name">GitHub Copilot Certified</div>
        <div class="cert-meta">GitHub · Mar 2026</div>
      </div>
      <div class="cert-item">
        <div class="cert-name">Azure Administrator</div>
        <div class="cert-meta">AZ-104 · In Progress</div>
      </div>
      <div class="cert-item">
        <div class="cert-name">UI/UX Design</div>
        <div class="cert-meta">Internshala · Mar 2023</div>
      </div>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div class="main">
    <div class="hd-name">Samuvel L</div>
    <div class="hd-title">DevOps Engineer &amp; System Engineer</div>

    <div class="summary">
      DevOps Engineer at Tata Consultancy Services with 20+ months of hands-on experience building
      Kubernetes, Docker, Azure, and CI/CD environments for real-world engineer assessments. Ranked
      <strong>top 2% (#6/280)</strong> in TCS Ignite onboarding. AZ-900 &amp; GitHub Copilot certified,
      pursuing AZ-104. Full-stack background in Next.js, React, and TypeScript combined with 2+ years
      of UI/UX design — covering the entire delivery lifecycle from design to deployment.
    </div>

    <div class="section">
      <div class="section-title">Experience</div>

      <div class="exp-item">
        <div class="exp-row">
          <div class="exp-role">System Engineer</div>
          <div class="exp-period">Jan 2026 – Present</div>
        </div>
        <div class="exp-company">Tata Consultancy Services</div>
        <ul class="exp-bullets">
          <li>Lead design and delivery of advanced DevOps training covering Kubernetes, CI/CD, and Azure</li>
          <li>Build challenge environments across Docker, Kubernetes, Ansible, Jenkins, GitLab, and Azure DevOps</li>
          <li>Develop training curricula aligned with real-world production requirements</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-row">
          <div class="exp-role">Assistant System Engineer</div>
          <div class="exp-period">Sep 2025 – Dec 2025</div>
        </div>
        <div class="exp-company">Tata Consultancy Services</div>
        <ul class="exp-bullets">
          <li>Designed and delivered Azure cloud training covering VMs, networking, storage, IAM, and Azure CLI</li>
          <li>Created hands-on lab exercises for provisioning and configuring Azure environments</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-row">
          <div class="exp-role">Assistant System Engineer Trainee</div>
          <div class="exp-period">Jan 2025 – Aug 2025</div>
        </div>
        <div class="exp-company">Tata Consultancy Services</div>
        <ul class="exp-bullets">
          <li>Built hands-on challenge environments using Docker, Kubernetes, Ansible, Jenkins, and GitLab</li>
          <li>Designed training content on Docker architecture, Kubernetes orchestration, and Azure DevOps pipelines</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-row">
          <div class="exp-role">Graduate Trainee</div>
          <div class="exp-period">Sep 2024 – Dec 2024</div>
        </div>
        <div class="exp-company">Tata Consultancy Services</div>
        <ul class="exp-bullets">
          <li>Ranked <strong>#6 out of 280</strong> in TCS Ignite onboarding — top 2% of entire cohort</li>
          <li>Selected for Talent Development team based on exceptional performance</li>
        </ul>
      </div>

      <div class="exp-item">
        <div class="exp-row">
          <div class="exp-role">Freelance Graphic Designer</div>
          <div class="exp-period">Sep 2022 – Sep 2024</div>
        </div>
        <div class="exp-company">Self-Employed</div>
        <ul class="exp-bullets">
          <li>Delivered logo, web, and UI/UX design projects over 2 years using Figma and Adobe Photoshop</li>
        </ul>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Projects</div>

      <div class="project-item">
        <div class="proj-row">
          <div class="proj-name">DevOps Challenge Environment</div>
          <div class="proj-period">2025 · Internal TCS</div>
        </div>
        <div class="proj-desc">
          Designed broken Kubernetes and Docker environments for TCS engineer assessments.
          Engineers diagnosed pod crashes, misconfigured services, and failed CI/CD pipelines.
        </div>
        <div class="proj-tags">
          <span class="proj-tag">Kubernetes</span>
          <span class="proj-tag">Docker</span>
          <span class="proj-tag">Ansible</span>
          <span class="proj-tag">Jenkins</span>
          <span class="proj-tag">GitLab</span>
          <span class="proj-tag">Azure DevOps</span>
        </div>
      </div>

      <div class="project-item">
        <div class="proj-row">
          <div class="proj-name">VizualizeHub</div>
          <div class="proj-period">Feb – Apr 2024 · vizualizehub.vercel.app</div>
        </div>
        <div class="proj-desc">
          Full-stack SaaS for AI-powered image editing with user authentication and credit-based billing. Deployed with Vercel CD.
        </div>
        <div class="proj-tags">
          <span class="proj-tag">Next.js</span>
          <span class="proj-tag">TypeScript</span>
          <span class="proj-tag">MongoDB</span>
          <span class="proj-tag">Cloudinary</span>
          <span class="proj-tag">Clerk</span>
          <span class="proj-tag">Vercel</span>
        </div>
      </div>

      <div class="project-item">
        <div class="proj-row">
          <div class="proj-name">Feedback System</div>
          <div class="proj-period">Dec 2023 · feedback-system-online-eight.vercel.app</div>
        </div>
        <div class="proj-desc">
          Anonymous feedback web app with real-time email delivery, form validation, and EmailJS integration for instant notifications.
        </div>
        <div class="proj-tags">
          <span class="proj-tag">React</span>
          <span class="proj-tag">JavaScript</span>
          <span class="proj-tag">EmailJS</span>
          <span class="proj-tag">Vercel</span>
        </div>
      </div>

      <div class="project-item">
        <div class="proj-row">
          <div class="proj-name">Student Attendance Management</div>
          <div class="proj-period">Dec 2023 – Jan 2024 · UI/UX Design</div>
        </div>
        <div class="proj-desc">
          End-to-end Figma design with real-time dashboard, analytics charts, and a three-role login system (Admin, Teacher, Student) with a complete design system.
        </div>
        <div class="proj-tags">
          <span class="proj-tag">Figma</span>
          <span class="proj-tag">UI/UX</span>
          <span class="proj-tag">Design System</span>
          <span class="proj-tag">Prototyping</span>
        </div>
      </div>
    </div>

    <div class="section page-break">
      <div class="section-title">Education</div>
      <div class="edu-row">
        <div>
          <div class="edu-degree">B.Sc Computer Science</div>
          <div class="edu-school">Sankara College of Arts &amp; Science</div>
        </div>
        <div class="edu-right">
          <div class="edu-score">89%</div>
          <div class="edu-year">2021 – 2024</div>
        </div>
      </div>
    </div>
  </div>

</div>
</body>
</html>`;

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: "domcontentloaded" });

const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
});

await browser.close();

writeFileSync(join(__dirname, "../public/resume.pdf"), pdf);
console.log("✓ Resume generated → public/resume.pdf");
