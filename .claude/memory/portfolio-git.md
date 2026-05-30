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

## PAT / credentials
- PATs must be classic tokens with `repo` scope
- Format in URL: `https://USERNAME:TOKEN@github.com/...`
- Always revoke token immediately after use — do NOT store in code or `.env`
- Tokens shared in chat are compromised — treat as revoked

## Latest commit
`8c1343a` — "feat: add photo to resume PDF, compress to 159KB"

## ⚠️ Large uncommitted body of work (as of 2026-05-30)
The entire backend/admin feature set from the 2026-05-30 session is **uncommitted** (~42 changed/new files): EmailJS→Resend migration, admin console (`app/admin`), Redis-backed CMS (`api/content`, `lib/content.ts`), leads (`api/lead`, `lib/lead.ts`, `LeadCapture.tsx`), visitor tracking (`lib/visitor.ts`), unified nightly digest, Vercel Blob uploads, password auth + OTP change, command palette, GitHub activity, cursor spotlight, error boundaries. Needs a commit + push when ready. See [[portfolio-project]] for the full feature map.

**Related memories:** [[portfolio-project]]
