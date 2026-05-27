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
