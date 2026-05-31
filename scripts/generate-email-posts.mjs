/**
 * Email Edition — social mockups focused on the Resend email system.
 * Different font: Bricolage Grotesque (headings) + Outfit (body) — the
 * portfolio's real type, so this set is fresh AND on-brand.
 * Renders the ACTUAL contact-form email templates inside an email-client frame.
 * Output: /home/labuser/Desktop/social-posts/email-edition/
 */

import puppeteer from "puppeteer";
import { mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import { contactNotificationEmail, contactAutoReplyEmail } from "../lib/email-templates.ts";

const OUT  = "/home/labuser/Desktop/social-posts/email-edition";
const BASE = "https://www.samuvel.in";
if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

const AVATAR_SRC = `data:image/jpeg;base64,${(await readFile("/home/labuser/Desktop/portfolio-v2/public/SAM.JPG")).toString("base64")}`;

const browser = await puppeteer.launch({
  headless: "new",
  executablePath: "/usr/bin/google-chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

// ─── Capture the live contact section ─────────────────────────────────────────
async function shot({ url = BASE, w = 1280, h = 800, wait = 3500, scrollTo = null, mobile = false, navOffset = 72 } = {}) {
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
    await p.evaluate(() => document.querySelectorAll("*").forEach(el => { const s = getComputedStyle(el); if (parseFloat(s.opacity) < 0.95 && el.getBoundingClientRect().height > 0) { el.style.opacity = "1"; el.style.transform = "none"; } }));
    await new Promise(r => setTimeout(r, 400));
    clipY = await p.evaluate(() => window.scrollY);
  }
  const b64 = await p.screenshot({ encoding: "base64", clip: { x: 0, y: clipY, width: w, height: h } });
  await p.close();
  return b64;
}

// Render any HTML → base64 png (for the email templates)
async function renderB64(html, w, h, scale = 2) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: scale });
  await p.setContent(html, { waitUntil: "networkidle0", timeout: 20000 });
  await new Promise(r => setTimeout(r, 500));
  // measure actual content height
  const real = await p.evaluate(() => document.body.scrollHeight);
  const b64 = await p.screenshot({ encoding: "base64", clip: { x: 0, y: 0, width: w, height: Math.min(real, h) } });
  await p.close();
  return { b64, height: Math.min(real, h) };
}

async function render(name, w, h, html) {
  process.stdout.write(`  ${name}…`);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 3 });
  await p.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise(r => setTimeout(r, 450));
  await p.screenshot({ path: `${OUT}/${name}`, clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
  console.log(" ✓");
}

console.log("📸  Capturing contact section + rendering email templates…\n");

const sContact = await shot({ scrollTo: "#contact", wait: 4000 });

// Sample data for the email previews
const notif = contactNotificationEmail({
  name: "Priya Sharma",
  email: "priya.sharma@acme.io",
  message: "Hi Samuvel! We're hiring a DevOps Engineer at Acme and your portfolio really stood out — especially the live CMS and Kubernetes work. Would love to set up a quick call this week.",
});
const reply = contactAutoReplyEmail({
  name: "Priya Sharma",
  message: "Hi Samuvel! We're hiring a DevOps Engineer at Acme and your portfolio really stood out. Would love to set up a quick call this week.",
});

// Render emails at 600px wide (email width), tall canvas, auto-measured
const notifImg = await renderB64(notif.html, 600, 900);
const replyImg = await renderB64(reply.html, 600, 900);

console.log("✓  Done.\n🎨  Rendering email-edition posts…\n");

// ─── Design tokens — NEW FONTS ────────────────────────────────────────────────
const F = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Outfit:wght@300;400;500;600;700&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Outfit',system-ui,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;}
.head{font-family:'Bricolage Grotesque',system-ui,sans-serif;}`;

const DOTS = `body::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
  background-image:radial-gradient(circle,rgba(255,255,255,.04) 1px,transparent 1px);background-size:32px 32px;}`;

const g = (r,gn,b,o,w,h,t,l) => `<div style="position:absolute;width:${w}px;height:${h}px;top:${t}px;left:${l}px;background:radial-gradient(circle,rgba(${r},${gn},${b},${o}),transparent 65%);pointer-events:none;z-index:0;filter:blur(70px);"></div>`;
const em = t => `<em style="font-style:normal;background:linear-gradient(130deg,#00C8D7,#4A9EFF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${t}</em>`;
const pill = (t,c="#00C8D7") => `<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,215,.07);border:1px solid rgba(0,200,215,.22);border-radius:100px;padding:6px 16px;"><div style="width:7px;height:7px;border-radius:50%;background:${c};box-shadow:0 0 8px ${c};"></div><span style="font-size:12px;font-weight:600;color:${c};letter-spacing:.8px;text-transform:uppercase;">${t}</span></div>`;
const tag = (t,c="#00C8D7",bg="rgba(0,200,215,.1)") => `<span style="background:${bg};border:1px solid ${c}40;border-radius:100px;padding:6px 15px;font-size:13px;font-weight:600;color:${c};white-space:nowrap;">${t}</span>`;
const urlBadge = (u="www.samuvel.in") => `<div style="background:rgba(0,200,215,.1);border:1px solid rgba(0,200,215,.3);border-radius:100px;padding:8px 20px;font-size:13px;font-weight:700;color:#00C8D7;white-space:nowrap;">${u}</div>`;
const authorRow = () => `<div style="display:flex;align-items:center;gap:11px;">
  <div style="width:42px;height:42px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;"><img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/></div>
  <div><div style="font-size:14px;font-weight:700;color:#E6EDF3;">Samuvel L</div><div style="font-size:11px;color:#5C6880;">System Engineer · TCS</div></div></div>`;

// Email client window frame around an email screenshot
const mailClient = (img, { subject, from, fromEmail, to, time }) => `
  <div style="border-radius:14px;overflow:hidden;border:1px solid rgba(0,200,215,.22);box-shadow:0 24px 70px rgba(0,0,0,.65),0 0 55px rgba(0,200,215,.12);background:#0C1018;">
    <div style="background:#0C1018;padding:11px 16px;display:flex;align-items:center;gap:8px;border-bottom:1px solid rgba(255,255,255,.06);">
      <div style="width:11px;height:11px;border-radius:50%;background:#FF5F56;"></div><div style="width:11px;height:11px;border-radius:50%;background:#FFBD2E;"></div><div style="width:11px;height:11px;border-radius:50%;background:#27C93F;"></div>
      <div style="flex:1;text-align:center;font-size:12px;color:rgba(255,255,255,.35);">📧 Mail — Inbox</div>
    </div>
    <div style="background:#12161F;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.06);">
      <div class="head" style="font-size:16px;font-weight:700;color:#E6EDF3;margin-bottom:8px;">${subject}</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#0F64D2,#00C8D7);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${from[0]}</div>
        <div style="flex:1;"><div style="font-size:13px;color:#D4DCE8;font-weight:600;">${from} <span style="color:#5C6880;font-weight:400;">&lt;${fromEmail}&gt;</span></div>
          <div style="font-size:11px;color:#5C6880;">to ${to}</div></div>
        <div style="font-size:11px;color:#5C6880;">${time}</div>
      </div>
    </div>
    <img src="data:image/png;base64,${img}" style="width:100%;display:block;"/>
  </div>`;

const page = (w,h) => `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${F} ${DOTS} body{width:${w}px;height:${h}px;background:#060910;}</style></head><body>`;

// ═══════════════════════════════════════════════════════════════════════════
//  POST 1 — Email System feature (LinkedIn 1200×627)
// ═══════════════════════════════════════════════════════════════════════════
await render("li-email-system.png", 1200, 627,
  page(1200,627) +
  g(0,200,215,.12,650,650,-220,560) + g(15,100,210,.09,500,500,300,-150) +
  `<div style="position:relative;z-index:1;display:flex;align-items:center;height:627px;padding:50px 54px;gap:50px;">
    <div style="flex-shrink:0;width:430px;transform:perspective(1100px) rotateY(6deg);transform-origin:left center;">
      ${mailClient(notifImg.b64, { subject:"New message from Priya Sharma", from:"Portfolio", fromEmail:"noreply@samuvel.in", to:"contact@samuvel.in", time:"now" })}
    </div>
    <div style="flex:1;">
      ${pill("Email System · Resend")}
      <h1 class="head" style="font-size:44px;font-weight:800;color:#E6EDF3;letter-spacing:-1px;line-height:1.05;margin:16px 0 12px;">Branded email,<br/>${em("end to end")}</h1>
      <p style="font-size:14px;color:#5C6880;line-height:1.65;margin-bottom:20px;">Every contact-form submission routes through Resend &amp; lands as a polished, branded HTML email — not a plain-text blob.</p>
      <div style="display:flex;flex-direction:column;gap:9px;margin-bottom:22px;">
        ${[["📬","Instant notification","branded email to my inbox with sender details"],["✅","Auto-reply","the visitor gets a styled thank-you instantly"],["🛡️","Spam-safe","honeypot, rate-limiting & email validation"],["🌙","Nightly digest","a daily summary of leads & visitors"]].map(([i,t,d])=>`
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:30px;height:30px;border-radius:8px;flex-shrink:0;font-size:13px;display:flex;align-items:center;justify-content:center;background:rgba(0,200,215,.08);border:1px solid rgba(0,200,215,.15);">${i}</div>
            <span style="font-size:12.5px;color:#7A8699;"><b style="color:#C4CDD9;font-weight:600;">${t}</b> — ${d}</span>
          </div>`).join("")}
      </div>
      <div style="height:1px;background:rgba(255,255,255,.06);margin-bottom:16px;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge()}</div>
    </div>
  </div></body></html>`);

// ═══════════════════════════════════════════════════════════════════════════
//  POST 2 — The branded notification email (IG 1080×1350)
// ═══════════════════════════════════════════════════════════════════════════
await render("ig-email-notification.png", 1080, 1350,
  page(1080,1350) +
  g(0,200,215,.11,700,700,-250,400) + g(15,100,210,.08,500,500,950,-150) +
  `<div style="position:relative;z-index:1;padding:64px 72px 0;height:1350px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">${authorRow()}${urlBadge()}</div>
    ${pill("Contact → Inbox")}
    <h1 class="head" style="font-size:52px;font-weight:800;color:#E6EDF3;letter-spacing:-1.5px;line-height:1.05;margin:18px 0 12px;">Every lead, ${em("beautifully")} delivered</h1>
    <p style="font-size:17px;color:#5C6880;line-height:1.6;margin-bottom:34px;">When someone fills the contact form, I get a clean branded email — sender, message &amp; a one-tap reply button.</p>
    <div style="flex:1;display:flex;align-items:flex-start;justify-content:center;">
      <div style="width:660px;">
        ${mailClient(notifImg.b64, { subject:"New message from Priya Sharma", from:"Portfolio", fromEmail:"noreply@samuvel.in", to:"contact@samuvel.in", time:"now" })}
      </div>
    </div>
    <div style="padding:24px 0 26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">${tag("📬 Resend")}${tag("🎨 Branded HTML","#4A9EFF","rgba(74,158,255,.1)")}${tag("↩️ One-tap Reply","#A78BFA","rgba(167,139,250,.1)")}</div>
  </div></body></html>`);

// ═══════════════════════════════════════════════════════════════════════════
//  POST 3 — The auto-reply email (IG 1080×1350)
// ═══════════════════════════════════════════════════════════════════════════
await render("ig-email-autoreply.png", 1080, 1350,
  page(1080,1350) +
  g(0,200,215,.11,700,700,-250,400) + g(15,100,210,.08,500,500,950,-150) +
  `<div style="position:relative;z-index:1;padding:64px 72px 0;height:1350px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;">${authorRow()}${urlBadge()}</div>
    ${pill("Instant Auto-Reply")}
    <h1 class="head" style="font-size:52px;font-weight:800;color:#E6EDF3;letter-spacing:-1.5px;line-height:1.05;margin:18px 0 12px;">Visitors get a ${em("warm welcome")}</h1>
    <p style="font-size:17px;color:#5C6880;line-height:1.6;margin-bottom:34px;">The moment they hit send, they receive a branded thank-you — with their message echoed back and links to explore.</p>
    <div style="flex:1;display:flex;align-items:flex-start;justify-content:center;">
      <div style="width:660px;">
        ${mailClient(replyImg.b64, { subject:"Thanks for reaching out — Samuvel L", from:"Samuvel L", fromEmail:"noreply@samuvel.in", to:"priya.sharma@acme.io", time:"now" })}
      </div>
    </div>
    <div style="padding:24px 0 26px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">${tag("✅ Auto-Reply")}${tag("👋 Personalised","#4A9EFF","rgba(74,158,255,.1)")}${tag("🔗 CTA Buttons","#34D399","rgba(52,211,153,.1)")}</div>
  </div></body></html>`);

// ═══════════════════════════════════════════════════════════════════════════
//  POST 4 — Contact form → email flow (IG 1080×1080)
// ═══════════════════════════════════════════════════════════════════════════
await render("ig-contact-flow.png", 1080, 1080,
  page(1080,1080) +
  g(0,200,215,.11,650,650,-200,480) + g(15,100,210,.08,500,500,650,-100) +
  `<div style="position:relative;z-index:1;padding:50px 52px;height:1080px;display:flex;flex-direction:column;gap:18px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">${authorRow()}${urlBadge("samuvel.in/#contact")}</div>
    ${pill("Get in Touch")}
    <h1 class="head" style="font-size:42px;font-weight:800;color:#E6EDF3;letter-spacing:-1px;line-height:1.05;">From form to ${em("inbox")} in seconds</h1>
    <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:stretch;">
      <div style="border-radius:16px;overflow:hidden;border:1px solid rgba(0,200,215,.22);box-shadow:0 20px 50px rgba(0,0,0,.6);">
        <div style="background:#0C1018;padding:9px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid rgba(255,255,255,.05);">
          <div style="width:10px;height:10px;border-radius:50%;background:#FF5F56;"></div><div style="width:10px;height:10px;border-radius:50%;background:#FFBD2E;"></div><div style="width:10px;height:10px;border-radius:50%;background:#27C93F;"></div>
          <div style="flex:1;background:rgba(255,255,255,.04);border-radius:5px;padding:3px 10px;margin:0 8px;font-size:10px;color:rgba(255,255,255,.25);">/#contact</div>
        </div>
        <img src="data:image/png;base64,${sContact}" style="width:100%;display:block;height:calc(100% - 36px);object-fit:cover;object-position:top;"/>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;justify-content:center;">
        ${[["1","📝","Visitor sends a message","via the contact form"],["2","⚡","Resend routes it","branded HTML, instantly"],["3","📬","I get notified","+ they get an auto-reply"],["4","🌙","Logged as a lead","into the nightly digest"]].map(([n,i,t,d])=>`
          <div style="display:flex;gap:14px;align-items:center;background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 16px;">
            <div style="width:30px;height:30px;border-radius:50%;background:rgba(0,200,215,.12);color:#00C8D7;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;">${n}</div>
            <div style="font-size:20px;">${i}</div>
            <div><div style="font-size:14px;font-weight:700;color:#D4DCE8;">${t}</div><div style="font-size:11px;color:#5C6880;">${d}</div></div>
          </div>`).join("")}
      </div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">${tag("📧 Resend")}${tag("🛡️ Honeypot","#4A9EFF","rgba(74,158,255,.1)")}${tag("⏱ Rate-limited","#A78BFA","rgba(167,139,250,.1)")}${tag("📅 Booking link","#34D399","rgba(52,211,153,.1)")}</div>
  </div></body></html>`);

// ═══════════════════════════════════════════════════════════════════════════
//  POST 5 — Both emails side by side (Story 1080×1920)
// ═══════════════════════════════════════════════════════════════════════════
await render("story-email-system.png", 1080, 1920,
  page(1080,1920) +
  g(0,200,215,.13,900,900,-300,180) + g(15,100,210,.1,600,600,1200,-200) + g(0,200,215,.07,500,500,1000,650) +
  `<div style="position:relative;z-index:1;padding:80px 64px 0;height:1920px;display:flex;flex-direction:column;align-items:center;">
    <div style="display:flex;align-items:center;gap:14px;width:100%;margin-bottom:50px;">
      <div style="width:52px;height:52px;border-radius:50%;overflow:hidden;border:2px solid #00C8D7;flex-shrink:0;"><img src="${AVATAR_SRC}" style="width:100%;height:100%;object-fit:cover;object-position:top center;"/></div>
      <div><div style="font-size:17px;font-weight:700;color:#E6EDF3;">Samuvel L</div><div style="font-size:12px;color:#5C6880;">System Engineer · TCS</div></div>
      ${urlBadge()}
    </div>
    ${pill("Email System · Resend")}
    <h1 class="head" style="font-size:62px;font-weight:800;color:#E6EDF3;letter-spacing:-2px;line-height:1.02;margin:22px 0 12px;text-align:center;">Professional<br/>${em("branded emails")}</h1>
    <p style="font-size:17px;color:#5C6880;text-align:center;line-height:1.6;margin-bottom:44px;">Two emails fire on every contact submission —<br/>a notification to me, an auto-reply to them.</p>
    <div style="width:560px;margin-bottom:30px;transform:rotate(-2deg);">
      ${mailClient(notifImg.b64, { subject:"New message from Priya Sharma", from:"Portfolio", fromEmail:"noreply@samuvel.in", to:"contact@samuvel.in", time:"now" })}
    </div>
    <div style="width:560px;transform:rotate(2deg);margin-top:-20px;">
      ${mailClient(replyImg.b64, { subject:"Thanks for reaching out — Samuvel L", from:"Samuvel L", fromEmail:"noreply@samuvel.in", to:"priya.sharma@acme.io", time:"now" })}
    </div>
    <div style="margin-top:auto;margin-bottom:60px;background:linear-gradient(135deg,#00C8D7,#0F64D2);border-radius:100px;padding:20px 60px;font-size:20px;font-weight:800;color:#fff;box-shadow:0 0 50px rgba(0,200,215,.35);" class="head">www.samuvel.in</div>
  </div></body></html>`);

await browser.close();

const files = ["li-email-system.png","ig-email-notification.png","ig-email-autoreply.png","ig-contact-flow.png","story-email-system.png"];
console.log(`\n✅  Email edition done! ${files.length} posts in ${OUT}/\n`);
console.log(files.map(f=>`   ${f}`).join("\n"));
