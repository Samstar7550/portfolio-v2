/**
 * Instagram Carousel Generator — 9-slide swipeable story (1080 × 1350, 4:5)
 * A narrative sequence: Hook → portfolio → features → admin → certs → CTA
 * Output: /home/labuser/Desktop/social-posts/carousel/
 */

import puppeteer from "puppeteer";
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";

const OUT  = "/home/labuser/Desktop/social-posts/carousel";
const BASE = "https://www.samuvel.in";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const AVATAR_SRC = `data:image/jpeg;base64,${(await readFile("/home/labuser/Desktop/portfolio-v2/public/SAM.JPG")).toString("base64")}`;

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

async function shot({ url = BASE, w = 1280, h = 800, wait = 3800, scrollTo = null, mobile = false, navOffset = 72 } = {}) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: mobile ? 3 : 2 });
  await p.goto(url, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, wait));
  let clipY = 0;
  if (scrollTo) {
    await p.evaluate((sel, off) => {
      const el = document.querySelector(sel);
      if (el) { const top = el.getBoundingClientRect().top + window.scrollY - off; window.scrollTo({ top: Math.max(0, top), behavior: "instant" }); }
    }, scrollTo, navOffset);
    await new Promise(r => setTimeout(r, 1800));
    await p.evaluate(() => {
      document.querySelectorAll("*").forEach(el => {
        const s = getComputedStyle(el);
        if (parseFloat(s.opacity) < 0.95 && el.getBoundingClientRect().height > 0) { el.style.opacity = "1"; el.style.transform = "none"; }
      });
    });
    await new Promise(r => setTimeout(r, 400));
    clipY = await p.evaluate(() => window.scrollY);
  }
  const b64 = await p.screenshot({ encoding: "base64", clip: { x: 0, y: clipY, width: w, height: h } });
  await p.close();
  return b64;
}

async function renderB64(html, w, h, scale = 1.5) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await p.setContent(html, { waitUntil: "networkidle0", timeout: 15000 });
  await new Promise(r => setTimeout(r, 400));
  const b64 = await p.screenshot({ encoding: "base64", clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
  return b64;
}

async function render(name, html) {
  process.stdout.write(`  ${name}…`);
  const p = await browser.newPage();
  await p.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 3 });
  await p.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 450));
  await p.screenshot({ path: `${OUT}/${name}`, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
  await p.close();
  console.log(" ✓");
}

console.log("📸  Capturing screenshots for carousel (sequential)…\n");
const cap = async (l, o) => { process.stdout.write(`  ${l}…`); const b = await shot(o); console.log(" ✓"); return b; };
const sHero   = await cap("hero",   { scrollTo: null, wait: 4500 });
const sBlog   = await cap("blog",   { url: BASE + "/blog", wait: 4000 });
const sCerts  = await cap("certs",  { scrollTo: "#certifications", wait: 2200 });
const sSkills = await cap("skills", { scrollTo: "#skills", wait: 2200 });
const sMobile = await cap("mobile", { w: 390, h: 844, mobile: true, wait: 4500 });

// 10 live palette captures
const PALETTES = [
  { name: "Blue / Teal", dark: "#00C8D7" }, { name: "Violet / Fuchsia", dark: "#D946EF" },
  { name: "Emerald / Cyan", dark: "#22D3EE" }, { name: "Rose / Pink", dark: "#F472B6" },
  { name: "Amber / Yellow", dark: "#FDE047" }, { name: "Sky / Indigo", dark: "#6366F1" },
  { name: "Fuchsia / Rose", dark: "#FB7185" }, { name: "Orange / Amber", dark: "#FBBF24" },
  { name: "Lime / Teal", dark: "#2DD4BF" }, { name: "Indigo / Violet", dark: "#C084FC" },
];
async function capturePalettes() {
  const p = await browser.newPage();
  const PW = 1100, PH = 690;
  await p.setViewport({ width: PW, height: PH, deviceScaleFactor: 1 });
  await p.goto(BASE, { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise(r => setTimeout(r, 4500));
  const out = [];
  for (const pal of PALETTES) {
    await p.evaluate(c => document.documentElement.style.setProperty("--accent", c, "important"), pal.dark);
    await new Promise(r => setTimeout(r, 450));
    const b64 = await p.screenshot({ encoding: "base64", type: "jpeg", quality: 88, clip: { x: 0, y: 0, width: PW, height: PH } });
    out.push({ ...pal, b64 });
  }
  await p.close();
  return out;
}
process.stdout.write("  palettes…"); const palettes = await capturePalettes(); console.log(" ✓");
/* old parallel block removed:
const [sHero, sBlog, sCerts, sSkills, sMobile] = await Promise.all([
  shot({ scrollTo: null }),
  shot({ url: BASE + "/blog" }),
  shot({ scrollTo: "#certifications" }),
  shot({ scrollTo: "#skills" }),
  shot({ w: 390, h: 844, mobile: true }),
]); */

// Admin overview mockup (reused design)
const adminHTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{width:1280px;height:800px;background:#060910;overflow:hidden;font-family:'Inter',system-ui,sans-serif;}</style></head><body>
<div style="padding:40px 48px;display:flex;flex-direction:column;height:100%;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:36px;height:36px;border-radius:10px;background:rgba(0,200,215,.12);display:flex;align-items:center;justify-content:center;font-size:16px;">⚙️</div>
      <div><div style="font-size:20px;font-weight:700;color:#E6EDF3;">Admin Console</div>
        <div style="font-size:11px;color:#5C6880;">manage without redeploying</div></div>
    </div>
  </div>
  <div style="display:flex;gap:1px;border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:24px;">
    ${["Overview","Profile","Skills","Experience","Certifications","Blog","Feedback","Storage"].map((t,i)=>`
      <div style="padding:10px 16px;font-size:13px;font-weight:${i===0?'600':'400'};color:${i===0?'#00C8D7':'#5C6880'};border-bottom:${i===0?'2px solid #00C8D7':'2px solid transparent'};margin-bottom:-1px;">${t}</div>`).join("")}
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
    ${[{l:"Today",v:"24"},{l:"Total Visits",v:"1,284"}].map(s=>`
      <div style="border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);padding:18px 22px;">
        <div style="font-size:12px;color:#5C6880;margin-bottom:8px;">👁 ${s.l}</div>
        <div style="font-size:34px;font-weight:800;color:#E6EDF3;">${s.v}</div></div>`).join("")}
  </div>
  <div style="border-radius:16px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);padding:18px 22px;flex:1;">
    <div style="font-size:13px;font-weight:600;color:#E6EDF3;margin-bottom:14px;">Daily Visitors — Last 30 Days</div>
    <div style="height:130px;display:flex;align-items:flex-end;gap:5px;">
      ${[42,55,38,67,49,72,58,45,63,51,78,60,47,69,53,80,62,49,71,56,44,68,52,75,61,48,70,57,66,59].map(h=>`<div style="flex:1;background:linear-gradient(to top,rgba(0,200,215,.6),rgba(0,200,215,.15));border-radius:3px 3px 0 0;height:${h}%;"></div>`).join("")}
    </div>
  </div>
</div></body></html>`;
const sAdmin = await renderB64(adminHTML, 1280, 800);

console.log("✓  Done.\n🎨  Rendering carousel slides…\n");

// ─── Design tokens ────────────────────────────────────────────────────────────
const F = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;width:1080px;height:1350px;background:#060910;}
body::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px;}`;

const g = (r,gn,b,o,w,h,t,l) => `<div style="position:absolute;width:${w}px;height:${h}px;top:${t}px;left:${l}px;background:radial-gradient(circle,rgba(${r},${gn},${b},${o}),transparent 65%);pointer-events:none;z-index:0;filter:blur(70px);"></div>`;
const em = t => `<em style="font-style:normal;background:linear-gradient(130deg,#00C8D7,#4A9EFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${t}</em>`;
const pill = (t,c="#00C8D7") => `<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,215,.07);border:1px solid rgba(0,200,215,.22);border-radius:100px;padding:7px 18px;"><div style="width:7px;height:7px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c};"></div><span style="font-size:13px;font-weight:600;color:${c};letter-spacing:.8px;text-transform:uppercase;">${t}</span></div>`;
const tag = (t,c="#00C8D7",bg="rgba(0,200,215,.1)") => `<span style="background:${bg};border:1px solid ${c}40;border-radius:100px;padding:7px 16px;font-size:14px;font-weight:600;color:${c};white-space:nowrap;">${t}</span>`;

// Slide chrome: header (avatar + handle) + page number; footer swipe hint
const num = (n) => `<div style="position:absolute;top:56px;right:64px;z-index:2;font-size:15px;font-weight:700;color:#5C6880;letter-spacing:1px;">${String(n).padStart(2,'0')}<span style="color:#2A3240;"> / 10</span></div>`;
const header = () => `<div style="display:flex;align-items:center;gap:12px;position:absolute;top:48px;left:64px;z-index:2;">
  <div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;"><img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/></div>
  <div><div style="font-size:15px;font-weight:700;color:#E6EDF3;">Samuvel L</div><div style="font-size:12px;color:#5C6880;">@Samstar7550 · DevOps Engineer</div></div>
</div>`;
const swipe = (label="Swipe") => `<div style="position:absolute;bottom:56px;right:64px;z-index:2;display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#5C6880;">${label} <span style="display:inline-flex;width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,200,215,.3);align-items:center;justify-content:center;color:#00C8D7;font-size:16px;">→</span></div>`;

const browserFrame = (b64, addr, tall=false) => `<div style="border-radius:14px;overflow:hidden;border:1px solid rgba(0,200,215,.25);box-shadow:0 24px 70px rgba(0,0,0,.65),0 0 55px rgba(0,200,215,.12);">
  <div style="background:#0C1018;padding:11px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);">
    <div style="width:11px;height:11px;border-radius:50%;background:#FF5F56;"></div><div style="width:11px;height:11px;border-radius:50%;background:#FFBD2E;"></div><div style="width:11px;height:11px;border-radius:50%;background:#27C93F;"></div>
    <div style="flex:1;background:rgba(255,255,255,.05);border-radius:6px;padding:5px 14px;margin:0 10px;font-size:12px;color:rgba(255,255,255,.3);">${addr}</div>
  </div>
  <img src="data:image/png;base64,${b64}" style="width:100%;display:block;${tall?'height:540px;object-fit:cover;object-position:top;':''}"/>
</div>`;

const slide = (inner) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${F}</style></head><body>${inner}</body></html>`;

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover / Hook
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-1-cover.png", slide(`
${g(0,200,215,.16,900,900,-300,200)}${g(15,100,210,.1,600,600,900,-250)}
${header()}${num(1)}
<div style="position:relative;z-index:1;padding:0 80px;height:1350px;display:flex;flex-direction:column;justify-content:center;">
  ${pill("Portfolio Case Study")}
  <h1 style="font-size:88px;font-weight:900;color:#E6EDF3;letter-spacing:-3px;line-height:1.0;margin:26px 0 22px;">
    I built a<br/>portfolio that's<br/>actually a<br/>${em("full-stack app")}</h1>
  <p style="font-size:22px;color:#5C6880;line-height:1.6;max-width:760px;">
    Not a static template. A live CMS, admin console, blog, analytics
    &amp; PWA — built to <b style="color:#C4CDD9;">prove</b> every DevOps skill, not just list them.</p>
  <div style="display:flex;gap:10px;margin-top:34px;flex-wrap:wrap;">
    ${tag("Next.js 14")}${tag("Redis CMS","#4A9EFF","rgba(74,158,255,.1)")}${tag("Vercel","#34D399","rgba(52,211,153,.1)")}${tag("9 slides →","#A78BFA","rgba(167,139,250,.1)")}</div>
</div>
${swipe("Swipe to explore")}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Portfolio (hero screenshot)
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-2-portfolio.png", slide(`
${g(0,200,215,.12,800,800,-250,400)}${g(15,100,210,.09,500,500,950,-150)}
${header()}${num(2)}
<div style="position:relative;z-index:1;padding:150px 72px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("The Portfolio")}
  <h1 style="font-size:58px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:20px 0 14px;">Meet ${em("www.samuvel.in")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:40px;max-width:840px;">Animated hero, 12+ sections, dark-mode-first design with 10 live accent palettes &amp; smooth Framer Motion transitions throughout.</p>
  <div style="flex:1;">${browserFrame(sHero,"www.samuvel.in",true)}</div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — Live CMS
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-3-cms.png", slide(`
${g(0,200,215,.12,800,800,-250,-150)}${g(15,100,210,.09,500,500,950,550)}
${header()}${num(3)}
<div style="position:relative;z-index:1;padding:170px 80px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Feature 01 — Live CMS")}
  <h1 style="font-size:62px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:22px 0 16px;">Edit anything,<br/>${em("zero redeploys")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:44px;max-width:820px;">Every section is backed by Redis. Change text, projects, skills, certs — it's live on the site instantly. No git push, no build, no wait.</p>
  <div style="display:flex;flex-direction:column;gap:18px;">
    ${[{i:"⚡",t:"Instant updates",d:"Redis-backed content, fetched on mount with defaults fallback"},{i:"🎨",t:"10 color palettes",d:"Switch the whole site's accent — stored & applied with no flash"},{i:"📬",t:"Change notifications",d:"Every save emails a diff of exactly what changed"}].map(f=>`
      <div style="display:flex;gap:18px;align-items:center;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:24px 28px;">
        <div style="font-size:34px;flex-shrink:0;">${f.i}</div>
        <div><div style="font-size:21px;font-weight:700;color:#D4DCE8;margin-bottom:4px;">${f.t}</div><div style="font-size:16px;color:#5C6880;line-height:1.5;">${f.d}</div></div>
      </div>`).join("")}
  </div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — Admin Console
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-4-admin.png", slide(`
${g(0,200,215,.12,800,800,-250,400)}${g(15,100,210,.09,500,500,950,-150)}
${header()}${num(4)}
<div style="position:relative;z-index:1;padding:150px 72px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Feature 02 — Admin Console")}
  <h1 style="font-size:58px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:20px 0 14px;">A real ${em("control panel")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:38px;max-width:840px;">OTP + password login. Analytics, lead inbox, feedback queue, blob storage &amp; full CRUD for every content type — all behind a secure session.</p>
  <div style="flex:1;">${browserFrame(sAdmin,"www.samuvel.in/admin",true)}</div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — Blog
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-5-blog.png", slide(`
${g(0,200,215,.12,800,800,-250,-150)}${g(15,100,210,.09,500,500,950,550)}
${header()}${num(5)}
<div style="position:relative;z-index:1;padding:150px 72px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Feature 03 — Technical Blog")}
  <h1 style="font-size:58px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:20px 0 14px;">I write about ${em("DevOps")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:32px;max-width:840px;">Markdown posts with reading time, tag filters, social share buttons &amp; auto-generated OG images for every post.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:32px;">
    ${tag("⏱ Reading time")}${tag("🏷 Tag filter","#4A9EFF","rgba(74,158,255,.1)")}${tag("🔗 Social share","#A78BFA","rgba(167,139,250,.1)")}${tag("🖼 Auto OG image","#34D399","rgba(52,211,153,.1)")}</div>
  <div style="flex:1;">${browserFrame(sBlog,"www.samuvel.in/blog",true)}</div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — Certifications (accurate)
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-6-certs.png", slide(`
${g(0,200,215,.12,800,800,-250,400)}${g(15,100,210,.09,500,500,950,-150)}
${header()}${num(6)}
<div style="position:relative;z-index:1;padding:170px 80px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Credentials")}
  <h1 style="font-size:62px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:22px 0 16px;">Certified &amp; ${em("growing")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:40px;max-width:820px;">Verifiable certs with live "Verify" links on the portfolio — straight to Credly &amp; Microsoft Learn.</p>
  <div style="display:flex;flex-direction:column;gap:16px;">
    ${[
      {b:"AZ-900",t:"Azure Fundamentals",i:"Microsoft · Aug 2025",s:"✅ Issued",sc:"#22c55e",c:"#0078D4"},
      {b:"GH",t:"GitHub Copilot Certified",i:"GitHub · Mar 2026",s:"✅ Issued",sc:"#22c55e",c:"#2088FF"},
      {b:"AZ-104",t:"Azure Administrator Associate",i:"Microsoft · Target 2026",s:"🔄 In Progress",sc:"#f59e0b",c:"#0078D4"},
      {b:"UX",t:"UI/UX Design",i:"Internshala · Mar 2023",s:"✅ Issued",sc:"#22c55e",c:"#FF7262"},
    ].map(c=>`
      <div style="display:flex;align-items:center;gap:18px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:22px 26px;">
        <div style="width:54px;height:54px;border-radius:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:${c.b.length>3?'13':'16'}px;font-weight:800;color:${c.c};background:${c.c}20;border:1px solid ${c.c}40;">${c.b}</div>
        <div style="flex:1;"><div style="font-size:20px;font-weight:700;color:#D4DCE8;">${c.t}</div><div style="font-size:15px;color:#5C6880;margin-top:3px;">${c.i}</div></div>
        <div style="font-size:15px;font-weight:600;color:${c.sc};white-space:nowrap;">${c.s}</div>
      </div>`).join("")}
  </div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — 10 Palettes (real live captures)
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-7-palettes.png", slide(`
${g(0,200,215,.12,800,800,-250,400)}${g(217,70,239,.07,500,500,950,-150)}
${header()}${num(7)}
<div style="position:relative;z-index:1;padding:150px 64px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Feature 05 — Theme Switcher")}
  <h1 style="font-size:58px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:20px 0 14px;">One site, ${em("10 palettes")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:34px;max-width:840px;">Pick any accent from the admin — the whole site re-themes instantly, stored in Redis with zero flicker on reload.</p>
  <div style="flex:1;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;">
    ${palettes.map(p=>`
      <div style="border-radius:14px;overflow:hidden;border:1px solid ${p.dark}55;box-shadow:0 12px 30px rgba(0,0,0,.5);position:relative;">
        <div style="position:absolute;top:12px;left:14px;z-index:2;display:flex;align-items:center;gap:7px;background:rgba(6,9,16,.7);border-radius:100px;padding:5px 12px;">
          <div style="width:10px;height:10px;border-radius:50%;background:${p.dark};box-shadow:0 0 8px ${p.dark};"></div>
          <span style="font-size:13px;font-weight:600;color:#E6EDF3;">${p.name}</span>
        </div>
        <img src="data:image/jpeg;base64,${p.b64}" style="width:100%;display:block;height:184px;object-fit:cover;object-position:top left;"/>
      </div>`).join("")}
  </div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Tech Stack
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-8-stack.png", slide(`
${g(0,200,215,.12,800,800,-250,-150)}${g(15,100,210,.09,500,500,950,550)}
${header()}${num(8)}
<div style="position:relative;z-index:1;padding:170px 80px 0;height:1350px;display:flex;flex-direction:column;">
  ${pill("Under the Hood")}
  <h1 style="font-size:62px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:22px 0 16px;">The ${em("tech stack")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:42px;max-width:820px;">Full-stack, fully typed, infra-aware — the same tools I work with in DevOps, applied end-to-end.</p>
  <div style="display:flex;flex-direction:column;gap:14px;">
    ${[
      {d:"#fff",n:"Next.js 14",x:"App Router · SSR · ISR",b:"Framework",bc:"rgba(255,255,255,.08)",tc:"#999"},
      {d:"#3178C6",n:"TypeScript",x:"Fully typed content model",b:"Language",bc:"rgba(49,120,198,.15)",tc:"#3178C6"},
      {d:"#06B6D4",n:"Tailwind CSS",x:"Design tokens via CSS vars",b:"Styling",bc:"rgba(6,182,212,.12)",tc:"#06B6D4"},
      {d:"#00C8D7",n:"Upstash Redis",x:"CMS · sessions · rate limits",b:"Database",bc:"rgba(0,200,215,.12)",tc:"#00C8D7"},
      {d:"#0070F3",n:"Vercel + Blob",x:"Hosting · cron · file storage",b:"Infra",bc:"rgba(0,112,243,.12)",tc:"#0070F3"},
      {d:"#9B99F9",n:"Framer Motion",x:"Spring · stagger · scroll",b:"Animation",bc:"rgba(155,153,249,.12)",tc:"#9B99F9"},
    ].map(s=>`
      <div style="display:flex;align-items:center;gap:16px;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px 22px;">
        <div style="width:11px;height:11px;border-radius:50%;background:${s.d};flex-shrink:0;"></div>
        <span style="font-size:19px;font-weight:700;color:#D4DCE8;min-width:200px;">${s.n}</span>
        <span style="font-size:16px;color:#5C6880;flex:1;">${s.x}</span>
        <span style="font-size:13px;font-weight:600;padding:5px 14px;border-radius:100px;background:${s.bc};color:${s.tc};">${s.b}</span>
      </div>`).join("")}
  </div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — Mobile / PWA
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-9-mobile.png", slide(`
${g(0,200,215,.13,900,900,-300,200)}${g(15,100,210,.1,600,600,1000,450)}
${header()}${num(9)}
<div style="position:relative;z-index:1;padding:170px 80px 0;height:1350px;display:flex;flex-direction:column;align-items:center;">
  ${pill("Feature 04 — Responsive PWA")}
  <h1 style="font-size:60px;font-weight:900;color:#E6EDF3;letter-spacing:-2px;line-height:1.05;margin:22px 0 14px;text-align:center;">Installable on ${em("any device")}</h1>
  <p style="font-size:19px;color:#5C6880;line-height:1.6;margin-bottom:48px;text-align:center;max-width:780px;">Network-first service worker, offline-capable, perfect on mobile.</p>
  <div style="display:flex;align-items:center;gap:48px;width:100%;justify-content:center;">
    <div style="width:300px;border-radius:40px;overflow:hidden;border:9px solid #1A1E2A;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 50px rgba(0,200,215,.12);flex-shrink:0;">
      <div style="background:#1A1E2A;height:30px;display:flex;align-items:center;justify-content:center;"><div style="width:90px;height:16px;background:#0C1018;border-radius:0 0 11px 11px;margin-top:-16px;"></div></div>
      <img src="data:image/png;base64,${sMobile}" style="width:100%;display:block;"/>
      <div style="background:#1A1E2A;height:22px;display:flex;align-items:center;justify-content:center;"><div style="width:90px;height:5px;background:rgba(255,255,255,.2);border-radius:3px;"></div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px;flex:1;max-width:440px;">
      ${[{i:"📱",t:"Installable PWA",d:"Add to home screen"},{i:"⚡",t:"Network-first SW",d:"Fresh online, cached offline"},{i:"♿",t:"Accessible",d:"Focus rings, reduced motion"},{i:"🚀",t:"Fast load",d:"Code-split, ISR, no CLS"}].map(f=>`
        <div style="background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px 22px;display:flex;gap:16px;align-items:center;">
          <span style="font-size:30px;">${f.i}</span>
          <div><div style="font-size:19px;font-weight:700;color:#D4DCE8;">${f.t}</div><div style="font-size:15px;color:#5C6880;">${f.d}</div></div>
        </div>`).join("")}
    </div>
  </div>
</div>
${swipe()}`));

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — CTA / Outro
// ═══════════════════════════════════════════════════════════════════════════
await render("slide-10-cta.png", slide(`
${g(0,200,215,.18,1000,1000,-350,150)}${g(15,100,210,.12,700,700,850,-250)}
${num(10)}
<div style="position:relative;z-index:1;padding:0 80px;height:1350px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
  <div style="width:120px;height:120px;border-radius:50%;overflow:hidden;border:4px solid #00C8D7;box-shadow:0 0 50px rgba(0,200,215,.4);margin-bottom:36px;">
    <img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/></div>
  <h1 style="font-size:76px;font-weight:900;color:#E6EDF3;letter-spacing:-2.5px;line-height:1.0;margin-bottom:22px;">See it ${em("live")}</h1>
  <p style="font-size:22px;color:#5C6880;line-height:1.6;margin-bottom:44px;max-width:720px;">The whole thing is open — explore the site, read the blog, and check the source on GitHub.</p>
  <div style="background:linear-gradient(135deg,#00C8D7,#0F64D2);border-radius:100px;padding:26px 72px;font-size:26px;font-weight:800;color:#fff;box-shadow:0 0 60px rgba(0,200,215,.4);margin-bottom:40px;">www.samuvel.in</div>
  <div style="display:flex;gap:14px;">
    ${tag("🔗 linkedin.com/in/samuvel7550","#4A9EFF","rgba(74,158,255,.1)")}
    ${tag("💻 github.com/Samstar7550","#A78BFA","rgba(167,139,250,.1)")}</div>
  <div style="margin-top:64px;display:flex;align-items:center;gap:12px;font-size:18px;font-weight:600;color:#5C6880;">
    <span style="display:inline-flex;width:42px;height:42px;border-radius:50%;border:1px solid rgba(0,200,215,.3);align-items:center;justify-content:center;color:#00C8D7;font-size:20px;">♡</span>
    Like &amp; save if this helped — follow for more</div>
</div>`));

await browser.close();

const slides = ["slide-1-cover","slide-2-portfolio","slide-3-cms","slide-4-admin","slide-5-blog","slide-6-certs","slide-7-palettes","slide-8-stack","slide-9-mobile","slide-10-cta"];
console.log(`\n✅  Carousel done! ${slides.length} slides in ${OUT}/\n`);
console.log(slides.map((s,i)=>`   ${i+1}. ${s}.png`).join("\n"));
