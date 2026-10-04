# TODO — remaining owner input before/after launch

All `{{PLACEHOLDERS}}` are resolved — `validate-seo` asserts zero `{{` in shipped
HTML. What is left is confirmation and operations, not missing copy.

## Confirm (site runs on these; tell me if any are wrong)
- [ ] `contact@public-iptv.online` inbox actually exists and is monitored
      (footer, contact page, JSON-LD `contactPoint`).
- [ ] Trial terms: trial length + activation flow behind the contact email
      (copy promises nothing time-specific — safe either way).
- [ ] Service scope: channel lineup, VOD, catch-up, EPG, screens, quality
      (copy stays qualitative — no counts claimed anywhere).
- [ ] Legal review (recommended): Privacy / Terms / Refund are now full drafted
      pages — have a lawyer confirm them for your jurisdiction before launch.

## Measurement & ops (post-launch, not blocking)
- [ ] Lighthouse CI (no Chrome in build env — run `npx lighthouse
      https://public-iptv.online/ --view` mobile + desktop; targets Perf ≥95,
      A11y 100, BP ≥95, SEO 100).
- [ ] Rich Results test on built HTML + Search Console indexing request.
- [ ] Keyboard-only walkthrough sign-off (statically verified: native
      `<details>`, disclosure menu with `aria-expanded`, skip-link, focus rings).
- [ ] Host: `www`→apex + `http`→`https` 301s; staging builds run
      `npm run build:staging` with `PUBLIC_INDEXING=staging` in the environment
      (Unix prefix, or `$env:PUBLIC_INDEXING='staging'` on PowerShell) plus an
      `X-Robots-Tag: noindex` header from the host config.
- [ ] Bump `src/data/lastmod.ts` on every copy change (sitemap `<lastmod>`).
- [ ] First 10 articles from `seo/article-backlog.md` (zero written by design).
- [ ] If pricing ever returns: re-add `/#plans` section + `Offer` schema +
      repoint `suggest-links.mjs` anchors (see `seo/internal-linking.md`).
