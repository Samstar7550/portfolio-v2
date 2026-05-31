---
name: portfolio-icons
description: "Icon strategy for Skills section — simple-icons inline SVG vs devicons CDN, invertDark flag"
metadata: 
  node_type: memory
  type: project
  originSessionId: 426c8187-cc93-4d94-bd4e-2d075454d2ec
---

## Icon strategy in `components/Skills.tsx`

**Problem:** lucide-react v1 has no brand icons. simple-icons removed Azure, AzureDevOps, Photoshop in v8+.

**Solution — hybrid approach:**

### simple-icons inline SVG (13 icons)
Stored directly in the `ICONS` Record in Skills.tsx as `{ kind: "svg", hex: "RRGGBB", path: "..." }`.  
No CDN dependency. Theme-aware via `invertDark?: boolean` flag (inverts black icons on dark bg to #E6EDF3).

Icons with `invertDark: true`: **Next.js**, **GitHub** (both have black `#000000` / `#181717` brand color)

Current simple-icons inline SVG icons:
Kubernetes, Docker, Ansible, Jenkins, GitLab, GitHub Actions, Next.js, React, TypeScript, MongoDB, Tailwind CSS, Figma, GitHub

### devicons CDN (3 icons)
`{ kind: "img", src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/...", color: "#RRGGBB" }`  
Used for: **Microsoft Azure**, **Azure DevOps**, **Adobe Photoshop**  
ESLint `no-img-element` suppressed with `// eslint-disable-next-line @next/next/no-img-element`

## `BrandIcons.tsx`
Inline SVG components: `LinkedInIcon`, `GitHubIcon`, `FigmaIcon`  
Accept `{ size?: number, className?: string, style?: React.CSSProperties }`  
Used in Contact (social links), Projects (ProjectIcon function component for design type)

## Icon search (added 2026-05-31)
`app/api/icon-search/route.ts` — GET `?q=term`:
- **simple-icons** (local): title/slug match ranked 1-4, returns `{source:"simple-icons", title, slug, hex, svg}`.
- **Iconify** (external fetch, `logos`+`devicon` prefix, 1h cache): returns `{source:"iconify", title, slug, cdnUrl}`.
- Results merged, deduped by normalised title, up to 12.

Admin `IconSearchButton` component:
- 300ms debounced fetch, 4-col grid preview, click-outside closes.
- simple-icons: stored as `data:image/svg+xml,${encodeURIComponent(svg_with_fill)}` — **NOT btoa** (breaks on non-Latin1).
- Iconify: stored as CDN URL directly (`https://api.iconify.design/{prefix}:{name}.svg`).
- For skills only: also passes `#hex` as `color` arg → stored in `Skill.iconColor`.

## Per-item colour (added 2026-05-31)
- **Skills**: `Skill.iconColor?: string` (hex with #). `SkillBadge` priority: `iconColor` → ICONS map → null. null = neutral container (`var(--surface-2)`/`var(--border)`). Per-skill colour swatch in admin uses `<label>` wrapping `<input type="color" className="sr-only">` — the only reliable cross-browser approach.
- **Awards**: `AwardItem.color?: string`. Public Awards.tsx uses `c = award.color ?? "var(--accent)"`.
- **Experience**: `ExperienceItem.color?: string`. Public Experience.tsx uses `c = item.color ?? "var(--accent)"`. Hover border/shadow applied via `onMouseEnter/Leave` (Tailwind can't interpolate runtime values).
- Projects + Certifications already had `color` fields.

## Admin uploads override (added 2026-05-30)
Skills/Experience/Projects items can carry an optional `iconUrl` (uploaded via the admin console → Vercel Blob → `/api/blob` proxy). In each component the render order is: **`iconUrl` (uploaded `<img>`) → built-in ICONS map → 2-letter fallback**. Skills now renders from the Redis-loaded `groups` state (falls back to the static `skillGroups` defaults), so the module-level wave index only covers default skills — admin-added skills get wave index `0`.

## Favicon (2026-05-30)
Moved from runtime dynamic injection to **static `app/icon.svg`** (white "SL" on dark `#080A10`, palette-neutral, hashed by Next). Do NOT add `metadata.icons` (freezes it). Details in [[portfolio-project]].

## Skill proficiency bars (2026-05-30)
`SkillGroup.level` (0-100, optional) renders an animated bar in each category header in Skills.tsx; admin SkillsTab has a per-category level input. Lightweight CSS (no Recharts on the homepage).

## Wave stagger index
Global index computed at module level (outside component) so it doesn't re-run on renders:
```ts
const globalWaveIndex = new Map<string, number>();
let _wi = 0;
for (const g of skillGroups) {
  for (const s of g.skills) {
    globalWaveIndex.set(`${s.name}-${s.note ?? ""}`, _wi++);
  }
}
```
Key format: `"SkillName-note"` (or `"SkillName-"` if no note)

**Related memories:** [[portfolio-project]] [[portfolio-animations]]
