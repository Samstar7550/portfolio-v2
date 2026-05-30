#!/usr/bin/env node
/**
 * Favicon generator for Samuvel L — DevOps portfolio
 * Generates all favicon sizes + OG image from SVG source
 *
 * Run: node scripts/generate-favicons.mjs
 */

import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// ── Design tokens ─────────────────────────────────────────────────────────────
const DARK_BG = "#080A10";
const TEAL = "#00C8D7";
const BLUE = "#0F64D2";
const WHITE = "#FFFFFF";

// Liberation Sans Bold is available on this system (Arial-compatible)
const FONT = "Liberation Sans";

// ── SVG builders ──────────────────────────────────────────────────────────────

/**
 * Favicon SVG — "SL" monogram, Option A (bold, tight, unified mark)
 * The negative letter-spacing fuses S and L into a single visual mark.
 */
function faviconSVG(size, bg = DARK_BG, fg = WHITE) {
  const rx = Math.max(3, Math.round(size * 0.19));
  const fontSize = Math.round(size * 0.56);
  const letterSpacing = -Math.round(size * 0.035);
  const y = Math.round(size * 0.695);
  const cx = size / 2;

  // At larger sizes, add a subtle inner ring for polish
  const ring =
    size >= 48
      ? `<rect x="2" y="2" width="${size - 4}" height="${size - 4}"
           rx="${rx - 1}" fill="none"
           stroke="${fg}" stroke-width="1" opacity="0.18"/>`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="${bg}"/>
  ${ring}
  <text x="${cx}" y="${y}"
    text-anchor="middle"
    font-family="'${FONT}', 'DejaVu Sans', Arial, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    letter-spacing="${letterSpacing}"
    fill="${fg}">SL</text>
</svg>`;
}

/** Scalable SVG favicon — viewBox only, no fixed width/height */
function faviconSVGScalable(bg = DARK_BG, fg = WHITE) {
  const size = 32;
  const rx = 6;
  const fontSize = 18;
  const letterSpacing = -1;
  const y = 22;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" ry="${rx}" fill="${bg}"/>
  <text x="16" y="${y}"
    text-anchor="middle"
    font-family="'${FONT}', 'DejaVu Sans', Arial, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    letter-spacing="${letterSpacing}"
    fill="${fg}">SL</text>
</svg>`;
}

/** 1200×630 Open Graph image */
function ogSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">

  <!-- Background -->
  <rect width="1200" height="630" fill="${DARK_BG}"/>

  <!-- Subtle dot-grid -->
  <defs>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="${TEAL}" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#dots)"/>

  <!-- Left accent line -->
  <rect x="80" y="100" width="3" height="430" rx="2" fill="${TEAL}" opacity="0.7"/>

  <!-- Large watermark monogram -->
  <text x="1060" y="560"
    text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="700" font-size="500" letter-spacing="-20"
    fill="${TEAL}" opacity="0.04">SL</text>

  <!-- Badge icon -->
  <rect x="112" y="145" width="88" height="88" rx="14"
    fill="${TEAL}" fill-opacity="0.12"
    stroke="${TEAL}" stroke-width="1.5" stroke-opacity="0.35"/>
  <text x="156" y="204"
    text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="700" font-size="40" letter-spacing="-1"
    fill="${TEAL}">SL</text>

  <!-- Name -->
  <text x="226" y="210"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="700" font-size="72" letter-spacing="-2"
    fill="${WHITE}">Samuvel L</text>

  <!-- Role -->
  <text x="228" y="258"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="400" font-size="26" letter-spacing="3"
    fill="${TEAL}">DEVOPS ENGINEER</text>

  <!-- Divider -->
  <rect x="112" y="298" width="976" height="1" fill="${TEAL}" opacity="0.18"/>

  <!-- Skill tags -->
  <rect x="112" y="326" width="130" height="34" rx="17" fill="${TEAL}" fill-opacity="0.12"/>
  <text x="177" y="348" text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif" font-size="14" font-weight="700"
    fill="${TEAL}">Kubernetes</text>

  <rect x="258" y="326" width="88" height="34" rx="17" fill="${TEAL}" fill-opacity="0.12"/>
  <text x="302" y="348" text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif" font-size="14" font-weight="700"
    fill="${TEAL}">Docker</text>

  <rect x="362" y="326" width="80" height="34" rx="17" fill="${TEAL}" fill-opacity="0.12"/>
  <text x="402" y="348" text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif" font-size="14" font-weight="700"
    fill="${TEAL}">Azure</text>

  <rect x="458" y="326" width="74" height="34" rx="17" fill="${TEAL}" fill-opacity="0.12"/>
  <text x="495" y="348" text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif" font-size="14" font-weight="700"
    fill="${TEAL}">CI/CD</text>

  <rect x="548" y="326" width="86" height="34" rx="17" fill="${TEAL}" fill-opacity="0.12"/>
  <text x="591" y="348" text-anchor="middle"
    font-family="'${FONT}', Arial, sans-serif" font-size="14" font-weight="700"
    fill="${TEAL}">Ansible</text>

  <!-- Tagline -->
  <text x="112" y="450"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="400" font-size="24"
    fill="${WHITE}" opacity="0.45">Building the pipelines that ship code</text>

  <!-- TCS note -->
  <text x="112" y="510"
    font-family="'${FONT}', Arial, sans-serif"
    font-weight="400" font-size="18"
    fill="${WHITE}" opacity="0.28">System Engineer @ Tata Consultancy Services · Remote · India</text>

  <!-- Corner accent dots -->
  <circle cx="1120" cy="100" r="3" fill="${TEAL}" opacity="0.4"/>
  <circle cx="1140" cy="100" r="3" fill="${TEAL}" opacity="0.22"/>
  <circle cx="1160" cy="100" r="3" fill="${TEAL}" opacity="0.1"/>

</svg>`;
}

// ── Minimal ICO builder (multi-size PNG inside ICO container) ─────────────────

function buildIco(images) {
  // images: [{ width, height, png: Buffer }]
  const ICON_DIR_HEADER = 6;
  const ICON_DIR_ENTRY = 16;
  const count = images.length;

  let dataOffset = ICON_DIR_HEADER + ICON_DIR_ENTRY * count;

  const header = Buffer.alloc(ICON_DIR_HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const entries = images.map(({ width, height, png }) => {
    const entry = Buffer.alloc(ICON_DIR_ENTRY);
    // width/height: 0 means 256
    entry.writeUInt8(width >= 256 ? 0 : width, 0);
    entry.writeUInt8(height >= 256 ? 0 : height, 1);
    entry.writeUInt8(0, 2);     // color count (0 = no palette)
    entry.writeUInt8(0, 3);     // reserved
    entry.writeUInt16LE(1, 4);  // planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    dataOffset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(PUBLIC, { recursive: true });

  const log = (msg) => process.stdout.write(msg + "\n");
  log("\n🎨  Generating favicon set...\n");

  // Render PNG at each needed size
  async function renderPNG(size, bg, fg) {
    const svg = faviconSVG(size, bg, fg);
    return sharp(Buffer.from(svg))
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  // ── Favicon PNGs ────────────────────────────────────────────────────────────
  const sizes = [16, 32, 48, 180, 192, 512];
  const pngs = {};
  for (const s of sizes) {
    pngs[s] = await renderPNG(s, DARK_BG, WHITE);
    log(`  ✓ ${s}×${s}  favicon`);
  }

  await fs.writeFile(path.join(PUBLIC, "favicon-16x16.png"), pngs[16]);
  await fs.writeFile(path.join(PUBLIC, "favicon-32x32.png"), pngs[32]);
  await fs.writeFile(path.join(PUBLIC, "apple-touch-icon.png"), pngs[180]);
  await fs.writeFile(path.join(PUBLIC, "android-chrome-192x192.png"), pngs[192]);
  await fs.writeFile(path.join(PUBLIC, "android-chrome-512x512.png"), pngs[512]);

  // ── favicon.ico (16 + 32 + 48) ──────────────────────────────────────────────
  const ico = buildIco([
    { width: 16, height: 16, png: pngs[16] },
    { width: 32, height: 32, png: pngs[32] },
    { width: 48, height: 48, png: pngs[48] },
  ]);
  await fs.writeFile(path.join(PUBLIC, "favicon.ico"), ico);
  log(`  ✓ favicon.ico  (16 + 32 + 48)`);

  // ── favicon.svg (scalable) ──────────────────────────────────────────────────
  await fs.writeFile(path.join(PUBLIC, "favicon.svg"), faviconSVGScalable());
  log(`  ✓ favicon.svg`);

  // ── OG image 1200×630 ───────────────────────────────────────────────────────
  const ogPng = await sharp(Buffer.from(ogSVG()))
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(path.join(PUBLIC, "og-image.png"), ogPng);
  log(`  ✓ og-image.png  (1200×630)`);

  // ── site.webmanifest ────────────────────────────────────────────────────────
  const manifest = {
    name: "Samuvel L — DevOps Engineer",
    short_name: "Samuvel L",
    description: "Building the pipelines that ship code",
    start_url: "/",
    display: "standalone",
    theme_color: DARK_BG,
    background_color: DARK_BG,
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
  await fs.writeFile(
    path.join(PUBLIC, "site.webmanifest"),
    JSON.stringify(manifest, null, 2) + "\n"
  );
  log(`  ✓ site.webmanifest`);

  log("\n✅  Done! All files written to /public\n");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
