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
`b0d4f77` — "feat: Resend migration, admin CMS console, analytics & lead capture" — pushed to origin/main 2026-05-30 (50 files: the entire backend/admin/CMS/leads/analytics feature set). See [[portfolio-project]] for the feature map.

**Related memories:** [[portfolio-project]]
