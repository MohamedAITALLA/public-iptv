# Internal linking (Phase B)

URL policy: lowercase, hyphenated slugs; no dates in URLs; `trailingSlash: 'never'`
(no trailing-slash inconsistency — canonicals match emitted URLs exactly);
`www`→apex and `http`→`https` via host 301s (host config, not code).
Future structure (reserved, zero empty pages today): `/blog/` hub →
`/blog/{slug}/` spokes; optional `/guides/{cluster}/` pillars once ≥3 posts
exist in a cluster. The `[slug]` route + `ArticleLayout` already implement
single-H1, TOC-ready, author box, `BlogPosting` + `BreadcrumbList`, related
posts (cluster/`relatedSlugs`), back-to-pillar CTA and per-article canonical/OG.

Rules:
1. Home links only to URLs that exist (validated by `validate-seo`). The
   "Latest guides" block and the nav "Guides" link render only when ≥1
   published, indexable post exists (`hasGuides` / component guard).
2. Anchors are descriptive and keyword-relevant; never "click here"; never the
   same anchor text pointing to two different URLs (checked per article via
   `scripts/suggest-links.mjs`).
3. Pillar ↔ spokes bidirectional when pillars exist: every article links up to
   its pillar (or the relevant home section until the pillar exists), to ≥2
   siblings (same cluster), and back to the relevant home section/CTA.
4. Max ~100 links per page; main-content links over footer links; no orphans
   (every post reachable from hub/related/home-guides); no broken internal links
   (CI: `validate-seo` fails the build on any).
5. Internal links never `nofollow`; external links get `rel="noopener"`.
6. Skip-link to `#main` on every page.

Per-cluster home anchors (used by the helper + future editors):
subscription-plans → `/#features` · trial-evaluation → `/contact/` ·
providers-comparison → `/#features` · quality-4k-premium → `/#features` ·
devices/playlists → `/#devices` · sports/categories → `/#features` ·
legal-safety → `/#faq`.
Conversion (no pricing section on the site by owner decision): all trial CTAs
route to `/contact/` (email activation). If pricing ever returns, re-add a
`/#plans` anchor and repoint the helper.
