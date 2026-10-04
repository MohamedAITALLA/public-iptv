# Adding articles (Phase 2 checklist)

Per article — do all steps, in order. Zero refactoring should be needed.

1. **Pick the keyword from the map.** Take the next row in `seo/article-backlog.md`
   (never re-target a `home`-slotted keyword — cannibalization guard).
2. **Create the file** `src/content/blog/<slug>.md` with full typed frontmatter
   (`title` ≤120 chars, `description` 130–165 chars, `publishDate`, `author`,
   `cluster`, `primaryKeyword`, `supportingKeywords`, `relatedSlugs`).
3. **Outline from the map**: one H1 (=title), H2s covering the supporting
   keywords, FAQ-style Q&A where the SERP shows People-Also-Ask.
4. **Internal links**: run `node scripts/suggest-links.mjs --keyword "<target>"`
   and apply its up-link + ≥2 sibling + home-backlink suggestions with unique
   descriptive anchors.
5. **Images**: AVIF/WebP + `width`/`height` + keyword-only-if-genuine `alt`;
   hero image + `heroImageAlt` in frontmatter for OG/`BlogPosting` image.
6. **Publish**: `draft: false`, `noindex: false`. The `[slug]` route, sitemaps,
   RSS and related-posts update automatically at build.
7. **First article unlocks**: create `src/pages/blog/index.astro` (hub: paginated,
   canonical-safe list of published posts) — template below — which also activates
   the nav "Guides" link and the home "Latest guides" block automatically.
8. **Validate + index**: `npm run validate`, then request indexing in Search Console.

## Hub template (create only with the first article — never an empty page)

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { DOMAIN } from '../../data/site';
const posts = (await getCollection('blog', ({ data }) => !data.draft && !data.noindex))
  .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
---
<BaseLayout title="Guides | Public IPTV" description="Setup and viewing guides from Public IPTV: devices, players, quality and troubleshooting." canonical={`${DOMAIN}/blog/`} hasGuides={true}>
  <section class="section"><div class="wrap">
    <h1>Guides</h1>
    {posts.map((p) => (
      <article class="feature-panel">
        <h2><a href={`/blog/${p.data.slug}/`}>{p.data.title}</a></h2>
        <p>{p.data.description}</p>
      </article>
    ))}
  </div></section>
</BaseLayout>
```
