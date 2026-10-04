# Plan — SEO-first IPTV home page (public-iptv.online)

Stack: **Astro + Tailwind v4 + TypeScript, static output** (empty project, best default for SEO/speed per brief §3.2).

Variables:
- SITE_NAME = Public IPTV (derived from domain; owner to confirm)
- DOMAIN = https://public-iptv.online (owner-confirmed)
- PRIMARY_LANGUAGE = en
- TARGET_MARKET = worldwide (US keyword data used as proxy)
- KEYWORD_FILES_PATH = D:\TOOLS\public-iptv (7× xlsx + 1× csv, 18k records)
- SEO_SKILL = C:\Users\moham\Downloads\seo-content.md (read; authoritative for content mechanics)
- DESIGN_SKILL = none provided → brief §7 tokens authoritative (conflict logged in seo-decisions.md)
- PLANS = TBD placeholders
- CONTACT_EMAIL = {{CONTACT_EMAIL}} placeholder

Checklist:
- [x] A0 read skills + inspect project + print Excel schemas
- [x] A keyword intelligence (scripts/analyze_keywords.js → /seo/*)
- [x] B architecture + internal linking doc
- [x] C home page + components + tokens.css + legal stubs + 404 + blog scaffold
- [x] D technical SEO: robots, sitemap-index-ready, head/OG/Twitter, icons/manifest, JSON-LD @graph, _headers, llms.txt
- [x] E validation: validate-seo script (40/40) + contrast + staging/prod robots check + keyword placement audit
- [ ] Lighthouse CI (no Chrome in build env — owner runs per TODO.md)
- [ ] Final report (§15) — see session summary
