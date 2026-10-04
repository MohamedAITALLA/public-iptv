# SEO decisions log

1. **Stack: Astro + Tailwind v4 + TypeScript, static.** Empty project → brief default. No JS framework runtime; only script shipped is the mobile-menu toggle. LCP element is text (hero H1), so no LCP image optimization debt.
2. **Design skill missing.** No `{{DESIGN_SKILL_PATH}}` was provided; brief §7 tokens are authoritative for visuals. No conflict to resolve beyond that.
3. **SEO skill vs brief.** `seo-content.md` is content-quality/E-E-A-T guidance, not a technical-SEO spec — no mechanic conflicts with §8. Applied: answer-first FAQ (40–80 words), single H1, quotable stats (25/10 Mbps), structured Q&A for AI-citation readiness. Its E-E-A-T weights (T30/E25/A25/X20) informed the legal/contact/transparency emphasis, not a numeric target.
4. **No pandas: Node + `xlsx` pipeline.** No Python on this host; `scripts/analyze_keywords.js` is the reproducible equivalent (documented in `seo/keyword-analysis.md`). Deterministic from the same inputs.
5. **Difficulty 0 = reported, low-trust.** `iptv free trial` D0 likely means "unmeasured", not "free win". Title/H1 pair it with `iptv subscription` so the page competes on intent breadth.
6. **Structural secondary (`m3u playlist player`).** Algorithmic top-5 had no devices term but §6 mandates a devices H2; swapped the lowest algorithmic pick with justification logged in `keyword-analysis.md`.
7. **Reseller cluster off-home.** B2B intent with no §6 home section → `future-article` only.
8. **Sitemap via build endpoints, not `@astrojs/sitemap`.** Needed env-aware robots + draft/noindex filtering + exact `sitemap-{pages,posts}` naming; plugin removed to keep the dependency surface minimal.
9. **`trailingSlash` default (ignore) + directory URLs.** Canonicals use trailing slashes for pages; host must 301 `www`→apex and `http`→`https` (host config, not code).
10. **No page images by performance design.** All product visuals are HTML/CSS (zero `<img>`, zero CLS/LCP risk). The "one image alt" primary slot is satisfied by the hero EPG figure's `aria-label`; OG PNG exists for crawlers/social only.
11. **No `Offer`/`AggregateRating` schema.** Prices are `{{PRICE}}` placeholders → schema would be fabrication. Added on real-price day with `validate-seo` re-run.
12. **No `HowTo` schema on home.** Steps describe the planned flow; markup ships once the flow is live and verified.
13. **FAQ rich-result caveat.** Google limits FAQ rich results, but markup stays: exact-match enforced by single-source `src/data/faq.ts` + validator assertion.
14. **`_headers` is prod-safe.** Staging `X-Robots-Tag: noindex` must come from host deploy-context config, never this file.
15. **AI crawlers: default allow**, toggle block commented in `robots.txt`. Rationale: AI-search citation is a KPI per the SEO skill; re-evaluate if crawl budget/hotlinking becomes an issue.
16. **Adult/brand/piracy quarantine.** Documented in `seo/keyword-analysis.md` assumptions; `suggest-links.mjs` never surfaces rejected rows.
17. **Design v2 (owner-supplied ClickUp-style skill, 2026-10-04).** Full rewrite:
    navy/blue system replaced by ink-black/grayscale + violet (badges only) +
    signal-blue (interactive accents); 9999px pill buttons (dark fill primary);
    Plus Jakarta Sans (display) + Inter (body) + Sometype Mono (kickers), Latin
    subsets self-hosted; plaster section bands + one dark-fade panel; single
    rotating conic-ring CTA (static under reduced-motion); stat band uses only
    page-verifiable numbers. Micro-deviations, all documented: (a) mono kickers
    use slate `#646464` instead of ash `#838383` so 12px text passes WCAG AA;
    (b) violet appears as text-on-mercury (4.86:1), never white-on-violet;
    (c) `#000` allowed as dark-panel surface, never as text color (validator
    enforces). Pricing section removed entirely per owner request — conversion
    routes to `/contact/`; `Offer` schema stays out.
18. **Placeholders eliminated (2026-10-04).** Owner had no contact/service facts
    yet, so every `{{...}}` became either the domain-derived
    `contact@public-iptv.online` (inbox existence unconfirmed — TODO.md) or
    honest generic wording with no counts, SLAs, or time promises. Validator
    asserts zero `{{` in shipped HTML.
