/**
 * Social Media Mockup Generator — All Sections, Accurate Data
 * Uses real portfolio screenshots + admin panel HTML mockups
 */

import puppeteer from "puppeteer";
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";

const OUT  = "/home/labuser/Desktop/social-posts";
const BASE = "https://www.samuvel.in";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

// ─── Local profile photo ─────────────────────────────────────────────────────
const AVATAR_B64 = (await readFile("/home/labuser/Desktop/portfolio-v2/public/SAM.JPG")).toString("base64");
const AVATAR_SRC = `data:image/jpeg;base64,${AVATAR_B64}`;

// ─── Launch browser ───────────────────────────────────────────────────────────
const browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

// ─── Screenshot helper ────────────────────────────────────────────────────────
// Clips at the ACTUAL scroll offset (clip is document-relative, so y:0 always
// grabbed the hero). Scrolls with a navbar offset, waits for in-view animations,
// and force-reveals any not-yet-animated elements so the section is fully painted.
async function shot({ url = BASE, w = 1280, h = 800, wait = 3500, scrollTo = null, mobile = false, navOffset = 72 } = {}) {
  const page = await browser.newPage();
  const scale = mobile ? 3 : 2;
  await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await page.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  // Let the loading screen finish + hero stagger settle
  await new Promise(r => setTimeout(r, wait));

  let clipY = 0;
  if (scrollTo) {
    // Scroll so the section sits just below the fixed navbar
    await page.evaluate((sel, off) => {
      const el = document.querySelector(sel);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - off;
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      }
    }, scrollTo, navOffset);
    // Wait for whileInView / scroll-triggered animations to complete
    await new Promise(r => setTimeout(r, 1800));
    // Force-finish any element still mid-animation (opacity/transform) so nothing is faded out
    await page.evaluate(() => {
      document.querySelectorAll("*").forEach(el => {
        const s = getComputedStyle(el);
        if (parseFloat(s.opacity) < 0.95 && el.getBoundingClientRect().height > 0) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });
    });
    await new Promise(r => setTimeout(r, 400));
    clipY = await page.evaluate(() => window.scrollY);
  }

  // clip is document-relative; clipping at the real scroll offset captures the section
  const b64 = await page.screenshot({
    encoding: "base64",
    clip: { x: 0, y: clipY, width: w, height: h },
  });
  await page.close();
  return b64;
}

// ─── Render HTML to PNG (3× = high-resolution) ────────────────────────────────
async function render(name, w, h, html) {
  process.stdout.write(`  ${name}…`);
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 3 });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: `${OUT}/${name}`, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  console.log(" ✓");
}

// ─── Capture the live hero in N accent colours (real palette switch) ──────────
const PALETTES = [
  { name: "Blue / Teal",      dark: "#00C8D7" },
  { name: "Violet / Fuchsia", dark: "#D946EF" },
  { name: "Emerald / Cyan",   dark: "#22D3EE" },
  { name: "Rose / Pink",      dark: "#F472B6" },
  { name: "Amber / Yellow",   dark: "#FDE047" },
  { name: "Sky / Indigo",     dark: "#6366F1" },
  { name: "Fuchsia / Rose",   dark: "#FB7185" },
  { name: "Orange / Amber",   dark: "#FBBF24" },
  { name: "Lime / Teal",      dark: "#2DD4BF" },
  { name: "Indigo / Violet",  dark: "#C084FC" },
];

async function capturePalettes() {
  const page = await browser.newPage();
  // Lighter res — these tiles display small in a 2-col grid, and 10 base64
  // images in one HTML must stay parseable by setContent.
  const PW = 1100, PH = 690;
  await page.setViewport({ width: PW, height: PH, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 4500)); // loading screen + hero settle
  const out = [];
  for (const p of PALETTES) {
    // inline + important on <html> beats every stylesheet rule, incl. PaletteProvider
    await page.evaluate(c => {
      document.documentElement.style.setProperty("--accent", c, "important");
    }, p.dark);
    await new Promise(r => setTimeout(r, 450));
    const b64 = await page.screenshot({ encoding: "base64", type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: PW, height: PH } });
    out.push({ ...p, b64 });
    process.stdout.write(`  palette ${p.name}…✓ `);
  }
  console.log("");
  await page.close();
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1 — Capture all portfolio sections
// ─────────────────────────────────────────────────────────────────────────────
console.log("📸  Capturing portfolio sections from www.samuvel.in (sequential)…\n");

// Sequential — one section at a time so each fully renders before the next.
const cap = async (label, opts) => { process.stdout.write(`  capturing ${label}…`); const b = await shot(opts); console.log(" ✓"); return b; };

const sHero     = await cap("hero",           { scrollTo: null,             wait: 4500 });
const sAbout    = await cap("about",          { scrollTo: "#about",         wait: 2200 });
const sExp      = await cap("experience",     { scrollTo: "#experience",    wait: 2200 });
const sSkills   = await cap("skills",         { scrollTo: "#skills",        wait: 2200 });
const sCerts    = await cap("certifications", { scrollTo: "#certifications",wait: 2200 });
const sProjects = await cap("projects",       { scrollTo: "#projects",      wait: 2200 });
const sContact  = await cap("contact",        { scrollTo: "#contact",       wait: 2200 });
const sBlog     = await cap("blog",           { url: BASE + "/blog",        wait: 4000 });
const sMobile   = await cap("mobile",         { w: 390, h: 844, mobile: true, wait: 4500 });

console.log("\n🎨  Capturing live hero in 10 accent palettes…");
const palettes = await capturePalettes();

console.log("✓  All screenshots done.\n");
console.log("🎨  Generating posts…\n");

// ─────────────────────────────────────────────────────────────────────────────
// SHARED DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const F = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Inter',system-ui,sans-serif; -webkit-font-smoothing:antialiased; overflow:hidden; }`;

const DOTS = `body::before { content:''; position:absolute; inset:0; pointer-events:none; z-index:0;
  background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);
  background-size:30px 30px; }`;

const g = (r,g2,b,o,w,h,top,left) =>
  `<div style="position:absolute;width:${w}px;height:${h}px;top:${top}px;left:${left}px;
  background:radial-gradient(circle,rgba(${r},${g2},${b},${o}),transparent 65%);
  pointer-events:none;z-index:0;filter:blur(70px);"></div>`;

const pill = (t, c="#00C8D7") =>
  `<div style="display:inline-flex;align-items:center;gap:7px;
    background:rgba(0,200,215,.07);border:1px solid rgba(0,200,215,.22);
    border-radius:100px;padding:5px 14px;">
    <div style="width:6px;height:6px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c};"></div>
    <span style="font-size:11px;font-weight:600;color:${c};letter-spacing:.8px;text-transform:uppercase;">${t}</span>
  </div>`;

const h1 = (html, size=46) =>
  `<h1 style="font-size:${size}px;font-weight:900;color:#E6EDF3;letter-spacing:-1.5px;line-height:1.05;">${html}</h1>`;

const em = t =>
  `<em style="font-style:normal;background:linear-gradient(130deg,#00C8D7,#4A9EFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${t}</em>`;

const urlBadge = (u="www.samuvel.in") =>
  `<div style="background:rgba(0,200,215,.1);border:1px solid rgba(0,200,215,.3);border-radius:100px;
    padding:8px 20px;font-size:13px;font-weight:700;color:#00C8D7;white-space:nowrap;">${u}</div>`;

const tag = (t, c="#00C8D7", bg="rgba(0,200,215,.1)") =>
  `<span style="background:${bg};border:1px solid ${c}40;border-radius:100px;
    padding:4px 12px;font-size:11px;font-weight:600;color:${c};white-space:nowrap;">${t}</span>`;

const authorRow = () =>
  `<div style="display:flex;align-items:center;gap:10px;">
    <div style="width:42px;height:42px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;">
      <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/>
    </div>
    <div>
      <div style="font-size:14px;font-weight:700;color:#E6EDF3;">Samuvel L</div>
      <div style="font-size:11px;color:#5C6880;">System Engineer · Tata Consultancy Services</div>
    </div>
  </div>`;

const browserChrome = (b64, addr, tall = false) =>
  `<div style="border-radius:12px;overflow:hidden;border:1px solid rgba(0,200,215,.25);
    box-shadow:0 0 0 1px rgba(255,255,255,.04),0 24px 70px rgba(0,0,0,.65),0 0 55px rgba(0,200,215,.1);">
    <div style="background:#0C1018;padding:10px 14px;display:flex;align-items:center;gap:7px;
      border-bottom:1px solid rgba(255,255,255,.06);">
      <div style="width:11px;height:11px;border-radius:50%;background:#FF5F56;"></div>
      <div style="width:11px;height:11px;border-radius:50%;background:#FFBD2E;"></div>
      <div style="width:11px;height:11px;border-radius:50%;background:#27C93F;"></div>
      <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:4px 12px;margin:0 10px;
        font-size:11px;color:rgba(255,255,255,.28);">${addr}</div>
    </div>
    <img src="data:image/png;base64,${b64}" style="width:100%;display:block;${tall ? 'max-height:480px;object-fit:cover;object-position:top;' : ''}"/>
  </div>`;

const browserPerspective = (b64, addr) =>
  `<div style="transform:perspective(1100px) rotateY(6deg) rotateX(2deg);transform-origin:left center;">
    ${browserChrome(b64, addr)}
  </div>`;

const phoneFrame = (b64) =>
  `<div style="border-radius:36px;overflow:hidden;border:8px solid #1A1E2A;
    box-shadow:0 0 0 1px rgba(255,255,255,.08),0 30px 80px rgba(0,0,0,.7),0 0 50px rgba(0,200,215,.12);">
    <div style="background:#1A1E2A;height:28px;display:flex;align-items:center;justify-content:center;">
      <div style="width:80px;height:14px;background:#0C1018;border-radius:0 0 10px 10px;margin-top:-14px;"></div>
    </div>
    <img src="data:image/png;base64,${b64}" style="width:100%;display:block;"/>
    <div style="background:#1A1E2A;height:20px;display:flex;align-items:center;justify-content:center;">
      <div style="width:80px;height:4px;background:rgba(255,255,255,.2);border-radius:2px;"></div>
    </div>
  </div>`;

// ─── Common page wrapper ──────────────────────────────────────────────────────
const page = (w, h, bg="#060910") =>
  `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>${F} ${DOTS} body{width:${w}px;height:${h}px;background:${bg};}</style>
  </head><body>`;

// ═════════════════════════════════════════════════════════════════════════════
//  ADMIN CONSOLE — HTML MOCKUPS  (built from actual source code)
// ═════════════════════════════════════════════════════════════════════════════

const ADMIN_BG = "#060910";
const ADMIN_SURF = "rgba(255,255,255,.025)";
const ADMIN_BORDER = "rgba(255,255,255,.07)";

const adminTabBar = (active) => {
  const tabs = ["Overview","Profile","Settings","Skills","Experience","Projects","Certifications","Awards","Testimonials","Feedback","Blog","Storage"];
  return `<div style="display:flex;gap:1px;overflow:hidden;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:28px;flex-shrink:0;">
    ${tabs.map(t => `
      <div style="padding:10px 16px;font-size:13px;font-weight:${t===active?'600':'400'};white-space:nowrap;
        color:${t===active?'#00C8D7':'#5C6880'};
        border-bottom:${t===active?'2px solid #00C8D7':'2px solid transparent'};
        margin-bottom:-1px;cursor:pointer;">${t}</div>
    `).join("")}
  </div>`;
};

const adminShell = (content, activeTab="Overview") =>
  `<div style="background:${ADMIN_BG};width:100%;height:100%;padding:40px 48px;display:flex;flex-direction:column;font-family:Inter,system-ui,sans-serif;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,200,215,.12);display:flex;align-items:center;justify-content:center;font-size:16px;">⚙️</div>
        <div>
          <div style="font-size:20px;font-weight:700;color:#E6EDF3;">Admin Console</div>
          <div style="font-size:11px;color:#5C6880;margin-top:1px;">portfolio.dev · manage without redeploying</div>
        </div>
      </div>
      <div style="font-size:12px;color:#5C6880;">← Back to portfolio</div>
    </div>
    ${adminTabBar(activeTab)}
    <div style="flex:1;overflow:hidden;">${content}</div>
  </div>`;

// Build admin screenshot sources
const adminOverviewHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:16px;height:100%;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      ${[{l:"Today",v:"24"},{l:"Total Visits",v:"1,284"}].map(s => `
        <div style="border-radius:16px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:20px 24px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <span style="font-size:14px;">👁</span>
            <span style="font-size:12px;color:#5C6880;">${s.l}</span>
          </div>
          <div style="font-size:36px;font-weight:800;color:#E6EDF3;">${s.v}</div>
        </div>
      `).join("")}
    </div>
    <div style="border-radius:16px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:20px 24px;flex:1;">
      <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:16px;">Daily Visitors — Last 30 Days</div>
      <div style="height:120px;display:flex;align-items:flex-end;gap:4px;padding-bottom:4px;">
        ${Array.from({length:30},(_,i)=>{const h=Math.round(20+Math.random()*70);return `<div style="flex:1;background:linear-gradient(to top,rgba(0,200,215,.6),rgba(0,200,215,.15));border-radius:3px 3px 0 0;height:${h}%;"></div>`}).join("")}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;min-height:0;">
      <div style="border-radius:16px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:16px 20px;">
        <div style="font-size:12px;font-weight:600;color:#E6EDF3;margin-bottom:10px;">Recent Leads</div>
        ${[{n:"John D.",e:"john@example.com",s:"contact"},{n:"Sarah M.",e:"sarah@acme.io",s:"widget"}].map(l=>`
          <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);">
            <div style="width:30px;height:30px;border-radius:50%;background:rgba(0,200,215,.12);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#00C8D7;flex-shrink:0;">${l.n[0]}</div>
            <div><div style="font-size:12px;color:#D4DCE8;font-weight:500;">${l.n}</div><div style="font-size:10px;color:#5C6880;">${l.e}</div></div>
            <div style="margin-left:auto;font-size:10px;background:rgba(0,200,215,.1);color:#00C8D7;border-radius:100px;padding:2px 8px;">${l.s}</div>
          </div>
        `).join("")}
      </div>
      <div style="border-radius:16px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:16px 20px;">
        <div style="font-size:12px;font-weight:600;color:#E6EDF3;margin-bottom:10px;">Recent Visitors</div>
        ${[{c:"🇮🇳",l:"Chennai, IN",d:"Chrome · Desktop"},{c:"🇺🇸",l:"New York, US",d:"Safari · Mobile"},{c:"🇬🇧",l:"London, UK",d:"Firefox · Desktop"}].map(v=>`
          <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);">
            <span style="font-size:18px;">${v.c}</span>
            <div><div style="font-size:12px;color:#D4DCE8;">${v.l}</div><div style="font-size:10px;color:#5C6880;">${v.d}</div></div>
          </div>
        `).join("")}
      </div>
    </div>
  </div>
`, "Overview")}
</body></html>`;

const adminCertsHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
      <div style="font-size:13px;color:#5C6880;">Manage your certifications shown on the portfolio.</div>
      <div style="display:flex;gap:10px;">
        <div style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);font-size:13px;color:#5C6880;cursor:pointer;">+ Add Certification</div>
        <div style="padding:8px 20px;border-radius:8px;background:#00C8D7;font-size:13px;font-weight:600;color:#060910;cursor:pointer;">Save All</div>
      </div>
    </div>
    ${[
      {badge:"AZ-900",title:"Microsoft Azure Fundamentals",issuer:"Microsoft",date:"Aug 2025",status:"issued",color:"#0078D4"},
      {badge:"GH",title:"GitHub Copilot Certified",issuer:"GitHub",date:"Mar 2026",status:"issued",color:"#2088FF"},
      {badge:"AZ-104",title:"Azure Administrator Associate",issuer:"Microsoft",date:"In Progress",status:"progress",color:"#0078D4"},
      {badge:"UX",title:"UI/UX Design",issuer:"Internshala",date:"Mar 2023",status:"issued",color:"#FF7262"},
    ].map((c,i) => `
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};overflow:hidden;">
        <div style="display:flex;align-items:center;padding:14px 20px;gap:14px;">
          <div style="width:38px;height:38px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;
            font-size:${c.badge.length>3?'9':'11'}px;font-weight:700;color:${c.color};
            background:${c.color}20;border:1px solid ${c.color}40;">${c.badge}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#E6EDF3;">${c.title}</div>
            <div style="font-size:11px;color:#5C6880;margin-top:2px;">${c.issuer} · ${c.date}</div>
          </div>
          <div style="font-size:11px;padding:4px 12px;border-radius:100px;font-weight:500;
            background:${c.status==='issued'?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'};
            color:${c.status==='issued'?'#22c55e':'#f59e0b'};">
            ${c.status==='issued'?'Issued':'In Progress'}
          </div>
          <div style="font-size:12px;color:#5C6880;">›</div>
        </div>
        ${i===1?`
          <div style="padding:16px 20px 20px;border-top:1px solid rgba(255,255,255,.05);">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
              <input placeholder="Title" value="GitHub Copilot Certified" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#D4DCE8;font-family:inherit;"/>
              <input placeholder="Issuer" value="GitHub" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#D4DCE8;font-family:inherit;"/>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;color:#5C6880;">Accent colour</span>
              <div style="width:32px;height:32px;border-radius:8px;background:#2088FF;border:1px solid rgba(255,255,255,.1);"></div>
              <input value="#2088FF" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:6px 10px;font-size:11px;color:#D4DCE8;width:90px;font-family:inherit;"/>
            </div>
          </div>
        `:''}
      </div>
    `).join("")}
  </div>
`, "Certifications")}
</body></html>`;

const adminBlogHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
      <div style="font-size:13px;color:#5C6880;">Write and manage your technical blog posts.</div>
      <div style="display:flex;gap:10px;">
        <div style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);font-size:13px;color:#5C6880;">+ New Post</div>
        <div style="padding:8px 20px;border-radius:8px;background:#00C8D7;font-size:13px;font-weight:600;color:#060910;">Save All</div>
      </div>
    </div>
    ${[
      {title:"Zero-Downtime Deployments with Kubernetes",tags:["Kubernetes","DevOps"],date:"May 2025",pub:true},
      {title:"Building CI/CD Pipelines with GitLab",tags:["GitLab","CI/CD"],date:"Apr 2025",pub:true},
      {title:"Azure Fundamentals for DevOps Engineers",tags:["Azure","Cloud"],date:"Mar 2025",pub:false},
    ].map(p => `
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:16px 20px;display:flex;align-items:center;gap:14px;">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:4px;">${p.title}</div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${p.tags.map(t=>`<span style="background:rgba(0,200,215,.1);border:1px solid rgba(0,200,215,.2);color:#00C8D7;border-radius:100px;padding:2px 8px;font-size:10px;">${t}</span>`).join("")}
            <span style="font-size:11px;color:#5C6880;">${p.date}</span>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:11px;padding:4px 12px;border-radius:100px;font-weight:500;
            background:${p.pub?'rgba(34,197,94,.12)':'rgba(245,158,11,.12)'};
            color:${p.pub?'#22c55e':'#f59e0b'};">${p.pub?'Published':'Draft'}</div>
          <div style="font-size:11px;color:#5C6880;cursor:pointer;">✏️ Edit</div>
        </div>
      </div>
    `).join("")}
    <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:20px;margin-top:4px;">
      <div style="font-size:12px;font-weight:600;color:#E6EDF3;margin-bottom:12px;">✏️ Editing — Azure Fundamentals for DevOps Engineers</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <input placeholder="Post title" value="Azure Fundamentals for DevOps Engineers" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#D4DCE8;font-family:inherit;"/>
        <input placeholder="Slug" value="azure-fundamentals-devops" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#5C6880;font-family:inherit;"/>
      </div>
      <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:10px 12px;height:64px;font-size:11px;color:#5C6880;font-family:monospace;">## Introduction&#10;Azure is Microsoft's cloud platform...</div>
    </div>
  </div>
`, "Blog")}
</body></html>`;

const adminFeedbackHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div style="font-size:13px;color:#5C6880;">3 submissions awaiting review</div>
    ${[
      {name:"Rahul S.",role:"DevOps Engineer @ Infosys",quote:"Samuvel's portfolio shows exceptional depth — both in design and in the infrastructure behind it. Rare to see a DevOps engineer this fluent across the full stack.",time:"2d ago"},
      {name:"Priya K.",role:"Tech Lead @ HCL",quote:"The challenge environments Samuvel built for our Azure training were the most realistic I've seen. Students loved the hands-on approach.",time:"4d ago"},
    ].map(f => `
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:18px 20px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,200,215,.12);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#00C8D7;">${f.name[0]}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:600;color:#E6EDF3;">${f.name}</div>
            <div style="font-size:11px;color:#5C6880;">${f.role}</div>
          </div>
          <div style="font-size:11px;color:#5C6880;">${f.time}</div>
        </div>
        <div style="font-size:12px;color:#8892A4;line-height:1.6;padding-left:4px;border-left:2px solid rgba(0,200,215,.2);padding:10px 12px;border-radius:4px;background:rgba(0,0,0,.2);margin-bottom:14px;">"${f.quote}"</div>
        <div style="display:flex;gap:10px;">
          <div style="padding:7px 18px;border-radius:8px;background:#00C8D7;font-size:12px;font-weight:600;color:#060910;cursor:pointer;">✓ Add to Testimonials</div>
          <div style="padding:7px 18px;border-radius:8px;border:1px solid rgba(255,100,100,.2);font-size:12px;color:#f87171;cursor:pointer;">Dismiss</div>
        </div>
      </div>
    `).join("")}
  </div>
`, "Feedback")}
</body></html>`;

// ── Admin: Settings tab (palette picker + toggles + uploads) ──────────────────
const adminSettingsHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:14px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
      <div style="font-size:13px;color:#5C6880;">Site-wide settings, theme &amp; uploads.</div>
      <div style="padding:8px 20px;border-radius:8px;background:#00C8D7;font-size:13px;font-weight:600;color:#060910;">Save</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:18px 20px;">
        <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:14px;">Availability</div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
          <span style="font-size:12px;color:#8892A4;">Open to Work</span>
          <div style="width:44px;height:24px;border-radius:100px;background:#00C8D7;position:relative;"><div style="width:18px;height:18px;border-radius:50%;background:#fff;position:absolute;top:3px;right:3px;"></div></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;color:#8892A4;">Contact cooldown</span>
          <span style="font-size:12px;color:#D4DCE8;">30 min</span>
        </div>
      </div>
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:18px 20px;">
        <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:14px;">Uploads</div>
        ${[["Profile photo","SAM.JPG"],["Resume PDF","resume.pdf · compressed"],["Booking link","cal.com/samuvel"]].map(([l,v])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;">
            <span style="font-size:12px;color:#8892A4;">${l}</span><span style="font-size:11px;color:#00C8D7;">${v}</span>
          </div>`).join("")}
      </div>
    </div>
    <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:18px 20px;">
      <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:4px;">Colour Palette <span style="color:#5C6880;font-weight:400;">— live accent switcher (10 themes)</span></div>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:14px;">
        ${[
          {n:"Blue / Teal",c:"#00C8D7",active:true},{n:"Violet",c:"#D946EF"},{n:"Emerald",c:"#22D3EE"},{n:"Rose",c:"#F472B6"},{n:"Amber",c:"#FDE047"},
          {n:"Sky",c:"#6366F1"},{n:"Fuchsia",c:"#FB7185"},{n:"Orange",c:"#FBBF24"},{n:"Lime",c:"#2DD4BF"},{n:"Indigo",c:"#C084FC"},
        ].map(p=>`
          <div style="border-radius:12px;border:2px solid ${p.active?p.c:'rgba(255,255,255,.08)'};background:rgba(255,255,255,.02);padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="width:100%;height:34px;border-radius:8px;background:linear-gradient(135deg,${p.c},${p.c}66);"></div>
            <span style="font-size:10px;color:${p.active?p.c:'#8892A4'};font-weight:${p.active?'600':'400'};">${p.n}</span>
          </div>`).join("")}
      </div>
    </div>
  </div>
`, "Settings")}
</body></html>`;

// ── Admin: Projects tab (CRUD with rich fields) ───────────────────────────────
const adminProjectsHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}
</style></head><body>
${adminShell(`
  <div style="display:flex;flex-direction:column;gap:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:2px;">
      <div style="padding:8px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.1);font-size:13px;color:#5C6880;">+ Add Project</div>
      <div style="padding:8px 20px;border-radius:8px;background:#00C8D7;font-size:13px;font-weight:600;color:#060910;">Save All</div>
    </div>
    ${[
      {c:"#7C3AED",t:"VizualizeHub",p:"Feb – Apr 2024",type:"web"},
      {c:"#0F64D2",t:"Feedback System",p:"Dec 2023",type:"web"},
    ].map(p=>`
      <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:16px 20px;display:flex;align-items:center;gap:14px;">
        <div style="width:6px;height:34px;border-radius:100px;background:${p.c};flex-shrink:0;"></div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:600;color:#E6EDF3;">${p.t}</div>
          <div style="font-size:11px;color:#5C6880;margin-top:2px;">${p.p} · ${p.type}</div></div>
        <div style="font-size:10px;background:rgba(0,200,215,.1);color:#00C8D7;border-radius:100px;padding:3px 10px;">Featured</div>
        <div style="font-size:12px;color:#5C6880;">›</div>
      </div>`).join("")}
    <div style="border-radius:14px;border:1px solid ${ADMIN_BORDER};background:${ADMIN_SURF};padding:20px;">
      <div style="font-size:12px;font-weight:600;color:#E6EDF3;margin-bottom:14px;">✏️ Editing — DevOps Challenge Environment</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <input value="DevOps Challenge Environment" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#D4DCE8;font-family:inherit;"/>
        <input value="2025" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;font-size:12px;color:#5C6880;font-family:inherit;"/>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
        ${["🖼 Images","🎨 Figma link","📹 Video demo","📄 Case study","🟢 Live status"].map(f=>`<span style="background:rgba(0,200,215,.08);border:1px solid rgba(0,200,215,.18);color:#00C8D7;border-radius:100px;padding:5px 12px;font-size:11px;">${f}</span>`).join("")}
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:12px;color:#5C6880;">Accent</span>
        <div style="width:30px;height:30px;border-radius:8px;background:#00C8D7;"></div>
        <div style="width:74px;height:48px;border-radius:8px;border:1px dashed rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;color:#5C6880;">🖼</div>
        <div style="width:74px;height:48px;border-radius:8px;border:1px dashed rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:18px;color:#5C6880;">＋</div>
      </div>
    </div>
  </div>
`, "Projects")}
</body></html>`;

// Render admin panels to base64
async function renderToBase64(html, w, h, scale = 2) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise(r => setTimeout(r, 400));
  const b64 = await page.screenshot({ encoding: "base64", clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
  return b64;
}

console.log("  Rendering admin panel mockups…");
const [sAdminOverview, sAdminCerts, sAdminBlog, sAdminFeedback, sAdminSettings, sAdminProjects] = await Promise.all([
  renderToBase64(adminOverviewHTML,   1280, 800),
  renderToBase64(adminCertsHTML,      1280, 800),
  renderToBase64(adminBlogHTML,       1280, 800),
  renderToBase64(adminFeedbackHTML,   1280, 800),
  renderToBase64(adminSettingsHTML,   1280, 800),
  renderToBase64(adminProjectsHTML,   1280, 800),
]);
console.log("  ✓ Admin mockups done.\n");

// ═════════════════════════════════════════════════════════════════════════════
//  INSTAGRAM POSTS  (1080 × 1080)
// ═════════════════════════════════════════════════════════════════════════════

// Helper for standard IG layout (browser left + content right)
const igSplit = (b64, addr, pillText, heading, subtext, tags, bottomLeft, bottomRight="") =>
  page(1080,1080) +
  g(0,200,215,.11,650,650,-220,480) + g(15,100,210,.09,500,500,600,-120) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${bottomLeft}${urlBadge(addr)}</div>
    ${pill(pillText)}
    <div style="margin-bottom:0;">${h1(heading)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.65;margin-bottom:0;">${subtext}</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);
      box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <div style="background:#0C1018;padding:9px 14px;display:flex;align-items:center;gap:7px;border-bottom:1px solid rgba(255,255,255,.05);">
        <div style="width:10px;height:10px;border-radius:50%;background:#FF5F56;"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#FFBD2E;"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#27C93F;"></div>
        <div style="flex:1;background:rgba(255,255,255,.04);border-radius:5px;padding:3px 10px;margin:0 8px;font-size:10px;color:rgba(255,255,255,.25);">${addr}</div>
      </div>
      <img src="data:image/png;base64,${b64}" style="width:100%;display:block;height:calc(100% - 34px);object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">${tags}</div>
  </div></body></html>`;

await render("ig-01-hero.png", 1080, 1080, igSplit(sHero,"www.samuvel.in","Portfolio Launch",`My Portfolio<br/>is ${em("Live 🚀")}`,"A full-stack web application — not just a static site.<br/>Built to prove every DevOps skill on the résumé.",tag("⚡ Live CMS")+tag("📝 Blog","#4A9EFF","rgba(74,158,255,.1)")+tag("🔐 Admin Panel","#A78BFA","rgba(167,139,250,.1)")+tag("📱 PWA","#34D399","rgba(52,211,153,.1)"),authorRow()));

await render("ig-02-about.png", 1080, 1080, igSplit(sAbout,"www.samuvel.in/#about","About Me",`${em("System Engineer")}<br/>@ TCS`,"DevOps & Cloud Engineer with 1 yr 9 months at Tata Consultancy Services.<br/>Ranked Top 2% (#6/279) in TCS Ignite.",tag("🏆 #6 / 279 Ignite")+tag("☁️ AZ-900 Certified","#0078D4","rgba(0,120,212,.1)")+tag("🔧 Kubernetes · Docker","#34D399","rgba(52,211,153,.1)"),authorRow()));

await render("ig-03-experience.png", 1080, 1080, igSplit(sExp,"www.samuvel.in/#experience","Career Timeline",`${em("1 Yr 9 Months")}<br/>at TCS`,"Growing from Graduate Trainee to System Engineer — building<br/>real-world DevOps labs for Kubernetes, Azure, Docker & CI/CD.",tag("System Engineer")+tag("ASE","#4A9EFF","rgba(74,158,255,.1)")+tag("Top 2% TCS Ignite","#F59E0B","rgba(245,158,11,.1)")+tag("Freelance Design 2yr","#A78BFA","rgba(167,139,250,.1)"),authorRow()));

await render("ig-04-skills.png", 1080, 1080, igSplit(sSkills,"www.samuvel.in/#skills","Tech Skills",`${em("Tools")} I Master`,`DevOps · Cloud · Web Dev · Design — a full delivery lifecycle<br/>from infrastructure to UI, all in one engineer.`,["Kubernetes","Docker","Ansible","Jenkins","Azure","GitLab","Next.js","TypeScript"].map((s,i)=>tag(s,["#00C8D7","#4A9EFF","#A78BFA","#34D399","#0078D4","#FC6D26","#fff","#3178C6"][i])).join(""),authorRow()));

await render("ig-05-certifications.png", 1080, 1080, igSplit(sCerts,"www.samuvel.in/#certifications","Certifications",`Certified &<br/>${em("Verified")}`,`AZ-900 issued · GitHub Copilot issued · AZ-104 in progress.<br/>Constantly levelling up on the Azure stack.`,tag("✅ AZ-900 Issued","#0078D4","rgba(0,120,212,.1)")+tag("✅ GitHub Copilot","#2088FF","rgba(32,136,255,.1)")+tag("🔄 AZ-104 In Progress","#F59E0B","rgba(245,158,11,.1)"),authorRow()));

await render("ig-06-projects.png", 1080, 1080, igSplit(sProjects,"www.samuvel.in/#projects","Projects",`Things I've ${em("Built")}`,`Web apps, DevOps tools, and design projects — all with<br/>live status badges, galleries, and case studies.`,tag("🟢 Live Status")+tag("🖼 Galleries","#4A9EFF","rgba(74,158,255,.1)")+tag("📄 Case Studies","#A78BFA","rgba(167,139,250,.1)")+tag("🎨 Figma Links","#FB923C","rgba(251,146,60,.1)"),authorRow()));

await render("ig-07-contact.png", 1080, 1080, igSplit(sContact,"www.samuvel.in/#contact","Open to Work",`Let's ${em("Connect")}`,`Available for DevOps & Cloud roles — Remote · India.<br/>Contact form, booking link, and social links all here.`,tag("📧 contact@samuvel.in")+tag("💼 Open to Remote","#34D399","rgba(52,211,153,.1)")+tag("📅 Book a Call","#A78BFA","rgba(167,139,250,.1)"),authorRow()));

await render("ig-08-blog.png", 1080, 1080, igSplit(sBlog,"www.samuvel.in/blog","Technical Blog",`I write about<br/>${em("DevOps & Cloud")}`,`Practical notes on Kubernetes, CI/CD, Azure &amp; building<br/>pipelines that ship code reliably.`,tag("⏱ Reading Time")+tag("🏷 Tag Filter","#4A9EFF","rgba(74,158,255,.1)")+tag("🔗 Social Share","#A78BFA","rgba(167,139,250,.1)")+tag("🖼 Auto OG Image","#34D399","rgba(52,211,153,.1)"),authorRow()));

// ── IG Admin posts ─────────────────────────────────────────────────────────────
await render("ig-09-admin-overview.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,700,700,-250,380) + g(15,100,210,.09,500,500,600,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Admin Console")}
    <div>${h1(`Analytics ${em("Dashboard")}`)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Real-time visitor analytics, lead tracking &amp; 30-day<br/>trend charts — all from the password-protected admin.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);
      box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminOverview}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;">${tag("📊 30-day Charts")}${tag("🌍 Geo Data","#4A9EFF","rgba(74,158,255,.1)")}${tag("📱 Device Breakdown","#A78BFA","rgba(167,139,250,.1)")}${tag("📬 Lead Inbox","#34D399","rgba(52,211,153,.1)")}</div>
  </div></body></html>`);

await render("ig-10-admin-certifications.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,650,650,-200,480) + g(15,100,210,.08,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Live CMS — Certifications")}
    <div>${h1(`Edit Certs ${em("Without Redeploying")}`,38)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Add icons, verify links and accent colours to every cert.<br/>Changes go live instantly — powered by Redis.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);
      box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminCerts}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;">${tag("✅ AZ-900","#0078D4","rgba(0,120,212,.1)")}${tag("✅ GitHub Copilot","#2088FF","rgba(32,136,255,.1)")}${tag("🔄 AZ-104 In Progress","#F59E0B","rgba(245,158,11,.1)")}</div>
  </div></body></html>`);

await render("ig-11-admin-blog.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,650,650,-200,480) + g(15,100,210,.08,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Live CMS — Blog")}
    <div>${h1(`Write &amp; Publish ${em("from the Admin")}`,38)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Full markdown editor, auto-slug, publish toggle, cover image.<br/>Posts go live immediately — no redeploy needed.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);
      box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminBlog}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;">${tag("📝 Markdown Editor")}${tag("🏷 Tags","#4A9EFF","rgba(74,158,255,.1)")}${tag("🔄 Publish Toggle","#34D399","rgba(52,211,153,.1)")}${tag("🖼 Cover Image","#A78BFA","rgba(167,139,250,.1)")}</div>
  </div></body></html>`);

await render("ig-12-admin-feedback.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,650,650,-200,480) + g(15,100,210,.08,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Feedback Inbox")}
    <div>${h1(`Visitor ${em("Feedback")} → Testimonials`,40)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Visitors submit feedback from the Testimonials section.<br/>One click to promote to a live testimonial or dismiss.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);
      box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminFeedback}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;">${tag("💬 Public Form")}${tag("✓ Promote to Testimonial","#34D399","rgba(52,211,153,.1)")}${tag("🚫 Dismiss","#F87171","rgba(248,113,113,.1)")}</div>
  </div></body></html>`);

// ═════════════════════════════════════════════════════════════════════════════
//  INSTAGRAM STORIES  (1080 × 1920)
// ═════════════════════════════════════════════════════════════════════════════

await render("story-01-full-portfolio.png", 1080, 1920,
  page(1080,1920) +
  g(0,200,215,.13,900,900,-300,180) + g(15,100,210,.1,600,600,1200,-200) + g(0,200,215,.07,500,500,900,700) +
  `<div style="position:relative;z-index:1;padding:80px 72px;height:1920px;display:flex;flex-direction:column;align-items:center;">
    <div style="display:flex;align-items:center;gap:14px;width:100%;margin-bottom:60px;">
      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;">
        <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/></div>
      <div><div style="font-size:17px;font-weight:700;color:#E6EDF3;">Samuvel L</div>
        <div style="font-size:12px;color:#5C6880;">System Engineer · TCS · 1yr 9mo</div></div>
      ${urlBadge()}
    </div>
    ${pill("Portfolio 2025")}
    <h1 style="font-size:72px;font-weight:900;color:#E6EDF3;letter-spacing:-2.5px;line-height:1.0;margin-top:20px;margin-bottom:8px;text-align:center;">
      My Portfolio<br/>${em("is Live")}
    </h1>
    <p style="font-size:16px;color:#5C6880;margin-bottom:44px;text-align:center;line-height:1.6;">
      A full-stack app proving every DevOps<br/>skill — not just listing them.
    </p>
    <div style="width:100%;border-radius:20px;overflow:hidden;margin-bottom:36px;border:1px solid rgba(0,200,215,.25);
      box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 60px rgba(0,200,215,.12);">
      <div style="background:#0C1018;padding:11px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);">
        <div style="width:11px;height:11px;border-radius:50%;background:#FF5F56;"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:#FFBD2E;"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:#27C93F;"></div>
        <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:5px 14px;margin:0 10px;font-size:12px;color:rgba(255,255,255,.3);">www.samuvel.in</div>
      </div>
      <img src="data:image/png;base64,${sHero}" style="width:100%;display:block;"/>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;margin-bottom:32px;">
      ${[{i:"⚡",t:"Live CMS",d:"Edit without redeploying"},{i:"🔐",t:"Admin Console",d:"OTP auth · analytics"},{i:"📝",t:"Blog + RSS",d:"Markdown · reading time"},{i:"☁️",t:"AZ-900 Certified",d:"Microsoft Azure · 2025"},{i:"📊",t:"Analytics",d:"30-day charts · geo data"},{i:"📱",t:"PWA Ready",d:"Installable · offline"},].map(f=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px 14px;">
          <div style="font-size:22px;margin-bottom:7px;">${f.i}</div>
          <div style="font-size:13px;font-weight:700;color:#D4DCE8;margin-bottom:2px;">${f.t}</div>
          <div style="font-size:11px;color:#5C6880;">${f.d}</div>
        </div>`).join("")}
    </div>
    <div style="margin-top:auto;background:linear-gradient(135deg,#00C8D7,#0F64D2);border-radius:100px;padding:20px 60px;font-size:20px;font-weight:800;color:#fff;box-shadow:0 0 50px rgba(0,200,215,.35);">Visit → www.samuvel.in</div>
  </div></body></html>`);

await render("story-02-admin.png", 1080, 1920,
  page(1080,1920) +
  g(0,200,215,.12,800,800,-280,280) + g(15,100,210,.09,600,600,1100,-150) +
  `<div style="position:relative;z-index:1;padding:80px 72px;height:1920px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:14px;width:100%;margin-bottom:60px;">
      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;">
        <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top;"/></div>
      <div><div style="font-size:17px;font-weight:700;color:#E6EDF3;">Samuvel L</div>
        <div style="font-size:12px;color:#5C6880;">System Engineer · TCS</div></div>
      ${urlBadge("samuvel.in/admin")}
    </div>
    ${pill("Admin Console")}
    <h1 style="font-size:60px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.0;margin-top:20px;margin-bottom:12px;">
      Edit the site<br/>${em("without code")}
    </h1>
    <p style="font-size:16px;color:#5C6880;line-height:1.6;margin-bottom:40px;">OTP-protected admin console built into the portfolio.<br/>Every section, the blog, and certs — fully editable.</p>
    <div style="border-radius:20px;overflow:hidden;margin-bottom:32px;border:1px solid rgba(0,200,215,.22);box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 60px rgba(0,200,215,.12);">
      <div style="background:#0C1018;padding:11px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);">
        <div style="width:11px;height:11px;border-radius:50%;background:#FF5F56;"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:#FFBD2E;"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:#27C93F;"></div>
        <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:5px 14px;margin:0 10px;font-size:12px;color:rgba(255,255,255,.3);">www.samuvel.in/admin</div>
      </div>
      <img src="data:image/png;base64,${sAdminOverview}" style="width:100%;display:block;"/>
    </div>
    <div style="border-radius:20px;overflow:hidden;margin-bottom:32px;border:1px solid rgba(0,200,215,.18);box-shadow:0 20px 50px rgba(0,0,0,.6);">
      <img src="data:image/png;base64,${sAdminCerts}" style="width:100%;display:block;"/>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:40px;">
      ${[{i:"🔐",t:"OTP Login",d:"Email-verified, bcrypt-hashed, 24h session"},{i:"📊",t:"Analytics Dashboard",d:"Visitor geo, device, referrer, 30-day chart"},{i:"💬",t:"Feedback Inbox",d:"Visitor feedback → promote to testimonials"},{i:"🗂️",t:"Storage Tab",d:"Manage all uploaded files in Vercel Blob"},].map(f=>`
        <div style="display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 18px;">
          <span style="font-size:22px;">${f.i}</span>
          <div><div style="font-size:14px;font-weight:700;color:#D4DCE8;">${f.t}</div>
          <div style="font-size:12px;color:#5C6880;">${f.d}</div></div>
        </div>`).join("")}
    </div>
    <div style="margin-top:auto;background:linear-gradient(135deg,#00C8D7,#0F64D2);border-radius:100px;padding:20px 60px;text-align:center;font-size:20px;font-weight:800;color:#fff;box-shadow:0 0 50px rgba(0,200,215,.35);">Explore → www.samuvel.in</div>
  </div></body></html>`);

await render("story-03-mobile.png", 1080, 1920,
  page(1080,1920) +
  g(0,200,215,.12,900,900,-300,100) + g(15,100,210,.1,600,600,1200,480) +
  `<div style="position:relative;z-index:1;padding:80px 72px;height:1920px;display:flex;flex-direction:column;align-items:center;">
    <div style="display:flex;align-items:center;gap:14px;width:100%;margin-bottom:60px;">
      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;">
        <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top;"/></div>
      <div><div style="font-size:17px;font-weight:700;color:#E6EDF3;">Samuvel L</div>
        <div style="font-size:12px;color:#5C6880;">System Engineer · TCS</div></div>
      ${urlBadge()}
    </div>
    ${pill("Fully Responsive + PWA")}
    <h1 style="font-size:62px;font-weight:900;color:#E6EDF3;letter-spacing:-2.5px;line-height:1.0;margin-top:20px;margin-bottom:12px;text-align:center;">
      Looks great<br/>${em("on any screen")}
    </h1>
    <p style="font-size:16px;color:#5C6880;text-align:center;margin-bottom:50px;line-height:1.6;">PWA-ready, installable &amp; optimised for every device.</p>
    <div style="width:280px;margin-bottom:48px;">${phoneFrame(sMobile)}</div>
    <div style="display:flex;flex-direction:column;gap:14px;width:100%;margin-bottom:48px;">
      ${[{i:"📱",t:"Installable PWA",d:"Add to home screen on Android &amp; iOS"},{i:"⚡",t:"Network First SW",d:"Always fresh online, cached offline"},{i:"🎨",t:"Dark by Default",d:"10 accent palettes, adapts to preference"},{i:"♿",t:"Accessible",d:"Skip links, focus rings, reduced motion support"},{i:"🚀",t:"Fast Load",d:"Code-split, ISR, 60s revalidate, no layout shift"},].map(f=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 18px;display:flex;gap:14px;align-items:center;">
          <span style="font-size:22px;">${f.i}</span>
          <div><div style="font-size:14px;font-weight:700;color:#D4DCE8;">${f.t}</div>
          <div style="font-size:12px;color:#5C6880;">${f.d}</div></div>
        </div>`).join("")}
    </div>
    <div style="margin-top:auto;background:linear-gradient(135deg,#00C8D7,#0F64D2);border-radius:100px;padding:20px 60px;font-size:20px;font-weight:800;color:#fff;box-shadow:0 0 50px rgba(0,200,215,.35);">Try it → www.samuvel.in</div>
  </div></body></html>`);

// ═════════════════════════════════════════════════════════════════════════════
//  LINKEDIN POSTS  (1200 × 627)
// ═════════════════════════════════════════════════════════════════════════════

const liWrap = (leftContent, rightContent) =>
  page(1200,627) +
  g(0,200,215,.12,650,650,-220,550) + g(15,100,210,.09,500,500,300,-150) +
  `<div style="position:relative;z-index:1;display:flex;align-items:center;height:627px;padding:50px 54px;gap:50px;">
    ${leftContent}${rightContent}
  </div></body></html>`;

await render("li-01-launch.png", 1200, 627, liWrap(
  `<div style="flex-shrink:0;width:500px;">${browserPerspective(sHero,"www.samuvel.in")}</div>`,
  `<div style="flex:1;display:flex;flex-direction:column;">
    ${pill("Portfolio Launch")}
    <div style="margin:14px 0 10px;">${h1(`My Portfolio<br/>is ${em("Live 🚀")}`,42)}</div>
    <p style="font-size:13px;color:#5C6880;line-height:1.65;margin-bottom:20px;">A full-stack web application proving every DevOps skill on the résumé.<br/>System Engineer @ TCS · 1 yr 9 months experience.</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">
      ${[["⚡","Live CMS","edit any section without redeploying"],["📝","Blog","reading time, tag filter &amp; dynamic OG images"],["🔐","Admin Console","OTP auth, analytics &amp; feedback inbox"],["📱","PWA","installable · live uptime badges · nightly digest"]].map(([i,t,d])=>`
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:28px;height:28px;border-radius:8px;flex-shrink:0;font-size:12px;display:flex;align-items:center;justify-content:center;background:rgba(0,200,215,.08);border:1px solid rgba(0,200,215,.15);">${i}</div>
          <span style="font-size:12px;color:#7A8699;"><b style="color:#C4CDD9;font-weight:600;">${t}</b> — ${d}</span>
        </div>`).join("")}
    </div>
    <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:16px;"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
  </div>`));

await render("li-02-experience.png", 1200, 627, liWrap(
  `<div style="flex-shrink:0;width:480px;">${browserChrome(sExp,"www.samuvel.in/#experience")}</div>`,
  `<div style="flex:1;display:flex;flex-direction:column;">
    ${pill("Career Journey")}
    <div style="margin:14px 0 10px;">${h1(`${em("1 Yr 9 Months")}<br/>at TCS`,40)}</div>
    <p style="font-size:12.5px;color:#5C6880;line-height:1.65;margin-bottom:16px;">Growing from Graduate Trainee to System Engineer — building hands-on challenge environments for Kubernetes, Azure, Docker, Jenkins &amp; GitLab.</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
      ${[["Jan 2026 – Now","System Engineer","Current · DevOps Training Lead","#22c55e"],["Sep–Dec 2025","Asst. System Engineer","Azure Cloud Training","#00C8D7"],["Jan–Aug 2025","ASE Trainee","Docker, K8s, CI/CD labs","#4A9EFF"],["Sep–Dec 2024","Graduate Trainee","#6/279 · Top 2% Ignite","#F59E0B"]].map(([p,r,d,c])=>`
        <div style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:8px 12px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${c};flex-shrink:0;"></div>
          <div style="flex:1;"><span style="font-size:12px;font-weight:600;color:#D4DCE8;">${r}</span> <span style="font-size:11px;color:#5C6880;">— ${d}</span></div>
          <span style="font-size:10px;color:#5C6880;white-space:nowrap;">${p}</span>
        </div>`).join("")}
    </div>
    <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:14px;"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
  </div>`));

await render("li-03-certifications.png", 1200, 627, liWrap(
  `<div style="flex-shrink:0;width:480px;">${browserChrome(sCerts,"www.samuvel.in/#certifications")}</div>`,
  `<div style="flex:1;display:flex;flex-direction:column;">
    ${pill("Certifications")}
    <div style="margin:14px 0 10px;">${h1(`Certified &amp;<br/>${em("Verified")}`,40)}</div>
    <p style="font-size:12.5px;color:#5C6880;line-height:1.6;margin-bottom:16px;">Azure Fundamentals issued · GitHub Copilot issued · AZ-104 in progress. Continuously levelling up on the Microsoft stack.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
      ${[{b:"AZ-900",t:"Azure Fundamentals",i:"Microsoft",d:"Aug 2025",s:true,c:"#0078D4"},{b:"GH",t:"GitHub Copilot",i:"GitHub",d:"Mar 2026",s:true,c:"#2088FF"},{b:"AZ-104",t:"Azure Administrator",i:"Microsoft",d:"Target 2026",s:false,c:"#0078D4"},{b:"UX",t:"UI/UX Design",i:"Internshala",d:"Mar 2023",s:true,c:"#FF7262"}].map(c=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${c.b.length>2?'8':'11'}px;font-weight:700;color:${c.c};background:${c.c}20;border:1px solid ${c.c}40;">${c.b}</div>
          <div><div style="font-size:12px;font-weight:600;color:#D4DCE8;">${c.t}</div>
            <div style="font-size:10px;color:${c.s?'#22c55e':'#f59e0b'};margin-top:2px;">${c.s?'✅ Issued · '+c.d:'🔄 In Progress'}</div></div>
        </div>`).join("")}
    </div>
    <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:14px;"></div>
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
  </div>`));

// ═════════════════════════════════════════════════════════════════════════════
//  TWITTER / X  (1200 × 675)
// ═════════════════════════════════════════════════════════════════════════════

await render("tw-01-launch.png", 1200, 675,
  page(1200,675) +
  g(0,200,215,.13,700,700,-260,510) + g(15,100,210,.1,500,500,350,-180) +
  `<div style="position:relative;z-index:1;display:flex;align-items:center;height:675px;padding:54px 58px;gap:54px;">
    <div style="flex-shrink:0;width:520px;">${browserPerspective(sHero,"www.samuvel.in")}</div>
    <div style="flex:1;">
      ${pill("Just Shipped")}
      <div style="margin:14px 0 10px;">${h1(`My portfolio<br/>is live 🚀<br/>${em("www.samuvel.in")}`,38)}</div>
      <p style="font-size:13px;color:#5C6880;line-height:1.65;margin-bottom:16px;">Full-stack portfolio with live CMS, blog, admin console,<br/>analytics &amp; PWA — 1yr 9mo DevOps @ TCS.</p>
      <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;">${tag("#DevOps")}${tag("#NextJS","#4A9EFF","rgba(74,158,255,.1)")}${tag("#OpenToWork","#34D399","rgba(52,211,153,.1)")}${tag("#PortfolioLaunch","#A78BFA","rgba(167,139,250,.1)")}</div>
      <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:16px;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
    </div>
  </div></body></html>`);

await render("tw-02-certifications.png", 1200, 675,
  page(1200,675) +
  g(0,200,215,.12,650,650,-220,-170) + g(15,100,210,.1,550,550,300,680) +
  `<div style="position:relative;z-index:1;display:flex;align-items:center;height:675px;padding:54px 58px;gap:54px;">
    <div style="flex-shrink:0;width:520px;">${browserChrome(sCerts,"www.samuvel.in/#certifications")}</div>
    <div style="flex:1;">
      ${pill("Microsoft Certified")}
      <div style="margin:14px 0 10px;">${h1(`Certified &amp;<br/>${em("Growing")}`,40)}</div>
      <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
        ${[{b:"AZ-900",t:"Azure Fundamentals",d:"✅ Issued Aug 2025",c:"#0078D4"},{b:"GH",t:"GitHub Copilot",d:"✅ Issued Mar 2026",c:"#2088FF"},{b:"AZ-104",t:"Azure Administrator",d:"🔄 In Progress — next milestone",c:"#0078D4"},{b:"UX",t:"UI/UX Design",d:"✅ Issued Mar 2023",c:"#FF7262"}].map(c=>`
          <div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:9px 14px;">
            <div style="width:32px;height:32px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${c.b.length>2?'8':'10'}px;font-weight:700;color:${c.c};background:${c.c}20;">${c.b}</div>
            <div style="flex:1;font-size:13px;font-weight:600;color:#D4DCE8;">${c.t}</div>
            <div style="font-size:11px;color:#5C6880;">${c.d}</div>
          </div>`).join("")}
      </div>
      <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:14px;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
    </div>
  </div></body></html>`);

// ═════════════════════════════════════════════════════════════════════════════
//  DRIBBBLE SHOT  (1600 × 1200)
// ═════════════════════════════════════════════════════════════════════════════

await render("db-01-showcase.png", 1600, 1200,
  page(1600,1200) +
  g(0,200,215,.11,900,900,-350,350) + g(15,100,210,.09,700,700,700,-200) + g(0,200,215,.07,500,500,800,1200) +
  `<div style="position:relative;z-index:1;padding:70px 80px;height:1200px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:48px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;">
          <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top;"/></div>
        <div>
          <div style="font-size:18px;font-weight:700;color:#E6EDF3;">Samuvel L — Portfolio v2</div>
          <div style="font-size:13px;color:#5C6880;">Next.js 14 · Redis CMS · Framer Motion · Vercel · System Engineer @ TCS · 1yr 9mo</div>
        </div>
      </div>
      ${urlBadge()}
    </div>
    <div style="flex:1;display:grid;grid-template-columns:1.35fr 1fr;gap:22px;min-height:0;">
      <div style="border-radius:20px;overflow:hidden;border:1px solid rgba(0,200,215,.25);box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 60px rgba(0,200,215,.12);">
        <div style="background:#0C1018;padding:12px 18px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);">
          <div style="width:12px;height:12px;border-radius:50%;background:#FF5F56;"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#FFBD2E;"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:#27C93F;"></div>
          <div style="flex:1;background:rgba(255,255,255,.05);border-radius:7px;padding:5px 14px;margin:0 12px;font-size:12px;color:rgba(255,255,255,.3);">www.samuvel.in</div>
        </div>
        <img src="data:image/png;base64,${sHero}" style="width:100%;display:block;height:calc(100% - 46px);object-fit:cover;object-position:top;"/>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px;">
        <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.18);box-shadow:0 20px 50px rgba(0,0,0,.6);">
          <div style="background:#0C1018;padding:9px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid rgba(255,255,255,.05);">
            <div style="width:10px;height:10px;border-radius:50%;background:#FF5F56;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#FFBD2E;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#27C93F;"></div>
            <div style="flex:1;background:rgba(255,255,255,.04);border-radius:5px;padding:3px 10px;margin:0 8px;font-size:10px;color:rgba(255,255,255,.25);">/admin — Analytics</div>
          </div>
          <img src="data:image/png;base64,${sAdminOverview}" style="width:100%;display:block;height:calc(100% - 36px);object-fit:cover;object-position:top;"/>
        </div>
        <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.18);box-shadow:0 20px 50px rgba(0,0,0,.6);">
          <div style="background:#0C1018;padding:9px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid rgba(255,255,255,.05);">
            <div style="width:10px;height:10px;border-radius:50%;background:#FF5F56;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#FFBD2E;"></div>
            <div style="width:10px;height:10px;border-radius:50%;background:#27C93F;"></div>
            <div style="flex:1;background:rgba(255,255,255,.04);border-radius:5px;padding:3px 10px;margin:0 8px;font-size:10px;color:rgba(255,255,255,.25);">/blog</div>
          </div>
          <img src="data:image/png;base64,${sBlog}" style="width:100%;display:block;height:calc(100% - 36px);object-fit:cover;object-position:top;"/>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:14px;margin-top:22px;">
      ${[{n:"1yr 9mo",l:"@ TCS"},{n:"Top 2%",l:"TCS Ignite #6/279"},{n:"AZ-900",l:"✅ Issued"},{n:"GitHub",l:"Copilot ✅"},{n:"AZ-104",l:"🔄 In Progress"},{n:"PWA",l:"Installable"}].map(s=>`
        <div style="flex:1;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:#00C8D7;letter-spacing:-.5px;">${s.n}</div>
          <div style="font-size:11px;color:#5C6880;margin-top:3px;">${s.l}</div>
        </div>`).join("")}
    </div>
  </div></body></html>`);

// ═════════════════════════════════════════════════════════════════════════════
//  10-PALETTE SHOWCASE  (1080 × 1350)  — real live captures in each accent
// ═════════════════════════════════════════════════════════════════════════════
await render("ig-13-palettes.png", 1080, 1350,
  page(1080,1350) +
  g(0,200,215,.1,700,700,-250,400) + g(217,70,239,.07,500,500,950,-150) +
  `<div style="position:relative;z-index:1;padding:64px 64px 0;height:1350px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">${authorRow()}${urlBadge()}</div>
    ${pill("Theme Switcher")}
    <div style="margin:18px 0 8px;">${h1(`One site, ${em("10 palettes")}`,52)}</div>
    <p style="font-size:16px;color:#5C6880;line-height:1.6;margin-bottom:30px;">Pick any accent from the admin — it updates the whole site instantly, stored in Redis with zero flicker on reload.</p>
    <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
      ${palettes.map(p=>`
        <div style="border-radius:14px;overflow:hidden;border:1px solid ${p.dark}55;box-shadow:0 12px 30px rgba(0,0,0,.5);position:relative;">
          <div style="position:absolute;top:10px;left:12px;z-index:2;display:flex;align-items:center;gap:6px;background:rgba(6,9,16,.7);border-radius:100px;padding:4px 10px;backdrop-filter:blur(4px);">
            <div style="width:9px;height:9px;border-radius:50%;background:${p.dark};box-shadow:0 0 8px ${p.dark};"></div>
            <span style="font-size:11px;font-weight:600;color:#E6EDF3;">${p.name}</span>
          </div>
          <img src="data:image/jpeg;base64,${p.b64}" style="width:100%;display:block;height:172px;object-fit:cover;object-position:top left;"/>
        </div>`).join("")}
    </div>
    <div style="padding:22px 0 26px;text-align:center;font-size:14px;color:#5C6880;">🎨 Live accent switcher · stored in Redis · instant theme change</div>
  </div></body></html>`);

// ═════════════════════════════════════════════════════════════════════════════
//  ADMIN — ALL FEATURES GRID  (1080 × 1350)
// ═════════════════════════════════════════════════════════════════════════════
await render("ig-14-admin-all-features.png", 1080, 1350,
  page(1080,1350) +
  g(0,200,215,.1,700,700,-250,400) + g(15,100,210,.08,500,500,950,-150) +
  `<div style="position:relative;z-index:1;padding:64px 60px 0;height:1350px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:26px;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Admin Console")}
    <div style="margin:18px 0 8px;">${h1(`${em("12 tabs")}, one console`,50)}</div>
    <p style="font-size:16px;color:#5C6880;line-height:1.55;margin-bottom:26px;">A complete CMS behind OTP login — every section of the site is editable without a single redeploy.</p>
    <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
      ${[
        {i:"📊",t:"Overview",d:"Visitor analytics, 30-day chart, leads & geo"},
        {i:"👤",t:"Profile",d:"All hero / about / contact text"},
        {i:"⚙️",t:"Settings",d:"Open-to-work, photo, resume, 10 palettes"},
        {i:"🧩",t:"Skills",d:"CRUD, icon search, colour, proficiency bars"},
        {i:"💼",t:"Experience",d:"Roles, bullets, tags, accent colour"},
        {i:"🗂️",t:"Projects",d:"Galleries, Figma, video, case study, status"},
        {i:"📜",t:"Certifications",d:"Badges, verify links, icons, colours"},
        {i:"🏆",t:"Awards",d:"Icon search + per-card colour"},
        {i:"💬",t:"Testimonials",d:"Quotes with avatar upload"},
        {i:"📥",t:"Feedback",d:"Visitor submissions → testimonials"},
        {i:"📝",t:"Blog",d:"Markdown editor, auto-slug, publish toggle"},
        {i:"🗄️",t:"Storage",d:"Manage Blob files, reset sections"},
      ].map(f=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px 16px;">
          <div style="font-size:22px;margin-bottom:7px;">${f.i}</div>
          <div style="font-size:14px;font-weight:700;color:#D4DCE8;margin-bottom:2px;">${f.t}</div>
          <div style="font-size:11px;color:#5C6880;line-height:1.4;">${f.d}</div>
        </div>`).join("")}
    </div>
    <div style="padding:22px 0 26px;text-align:center;font-size:14px;color:#5C6880;">🔐 OTP login · 🔁 live updates · 📧 change notifications</div>
  </div></body></html>`);

// Admin Settings post (palette picker inside admin)
await render("ig-15-admin-settings.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,650,650,-200,480) + g(217,70,239,.06,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Admin — Settings")}
    <div>${h1(`Theme &amp; settings, ${em("built-in")}`,40)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Toggle availability, upload resume &amp; photo, set a booking link, and switch between 10 live accent palettes.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminSettings}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">${tag("🎨 10 Palettes")}${tag("📄 Resume Upload","#4A9EFF","rgba(74,158,255,.1)")}${tag("📅 Booking Link","#A78BFA","rgba(167,139,250,.1)")}${tag("🔘 Open-to-Work","#34D399","rgba(52,211,153,.1)")}</div>
  </div></body></html>`);

// Admin Projects post
await render("ig-16-admin-projects.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.1,650,650,-200,480) + g(15,100,210,.08,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:20px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/admin")}</div>
    ${pill("Admin — Projects")}
    <div>${h1(`Rich project ${em("editor")}`,40)}</div>
    <p style="font-size:14px;color:#5C6880;line-height:1.6;">Each project supports image galleries, a Figma link, a demo video, a markdown case study, live status &amp; a custom accent colour.</p>
    <div style="flex:1;border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);box-shadow:0 20px 60px rgba(0,0,0,.65),0 0 50px rgba(0,200,215,.1);">
      <img src="data:image/png;base64,${sAdminProjects}" style="width:100%;display:block;height:100%;object-fit:cover;object-position:top;"/>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">${tag("🖼 Galleries")}${tag("🎨 Figma","#4A9EFF","rgba(74,158,255,.1)")}${tag("📹 Video","#A78BFA","rgba(167,139,250,.1)")}${tag("📄 Case Study","#FB923C","rgba(251,146,60,.1)")}${tag("🟢 Live Status","#34D399","rgba(52,211,153,.1)")}</div>
  </div></body></html>`);

await browser.close();

// ─── Summary ──────────────────────────────────────────────────────────────────
const files = [
  "ig-01-hero.png","ig-02-about.png","ig-03-experience.png","ig-04-skills.png",
  "ig-05-certifications.png","ig-06-projects.png","ig-07-contact.png","ig-08-blog.png",
  "ig-09-admin-overview.png","ig-10-admin-certifications.png","ig-11-admin-blog.png","ig-12-admin-feedback.png",
  "ig-13-palettes.png","ig-14-admin-all-features.png","ig-15-admin-settings.png","ig-16-admin-projects.png",
  "story-01-full-portfolio.png","story-02-admin.png","story-03-mobile.png",
  "li-01-launch.png","li-02-experience.png","li-03-certifications.png",
  "tw-01-launch.png","tw-02-certifications.png",
  "db-01-showcase.png",
];
console.log(`\n✅  Done! ${files.length} posts in /home/labuser/Desktop/social-posts/\n`);
console.log(files.map(f=>`   ${f}`).join("\n"));
