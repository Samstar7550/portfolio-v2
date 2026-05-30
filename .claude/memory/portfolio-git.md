---
name: portfolio-git
description: "Git / GitHub setup — proxy bypass, username, repo URL, push method"
metadata: 
  node_type: memory
  type: project
  originSessionId: 426c8187-cc93-4d94-bd4e-2d075454d2ec
---

## Repository
- **GitHub:** `https://github.com/Samstar7550/portfolio-v2`
- **Actual username:** `Samstar7550` (NOT samuvel7550 — verified via GitHub API)
- **Local remote:** `git remote get-url origin` → `https://github.com/Samstar7550/portfolio-v2.git`

## Proxy issue (this environment)
Git is configured with proxy `hproxy.cloudloka.com:9004` which blocks GitHub.  
**Bypass per-command:**
```bash
git -c http.proxy="" -c https.proxy="" push "https://Samstar7550:TOKEN@github.com/Samstar7550/portfolio-v2.git" main
```

## Commit identity (IMPORTANT)
- Commit as **Samuvel L <samstar7550@gmail.com>** — NOT the machine default `labuser <labuser@tcs.com>`. Set before committing: `git config user.name "Samuvel L" && git config user.email "samstar7550@gmail.com"`.
- **2026-05-30:** entire history (35 commits) rewritten from labuser → Samuvel L via `git filter-branch --env-filter` and force-pushed. Keep `Co-Authored-By: Claude ...` trailers. If the repo is cloned elsewhere, re-clone (don't pull) — all SHAs changed.

## PAT / credentials
- PATs must be classic tokens with `repo` scope
- Format in URL: `https://USERNAME:TOKEN@github.com/...`
- Always revoke token immediately after use — do NOT store in code or `.env`
- Tokens shared in chat are compromised — treat as revoked

## Latest work
Big feature session 2026-05-30: blog, storage tab, status badges, contact hardening, booking link, case studies, skill levels, audience analytics, PWA, SEO (sitemap/robots/JSON-LD), static neutral favicon. Removed Dockerfile + Geist fonts. See [[portfolio-project]] for the full feature map.

**Related memories:** [[portfolio-project]]
