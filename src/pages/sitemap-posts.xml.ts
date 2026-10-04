import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { DOMAIN } from '../data/site';

// Future articles only (auto-wired to the content collection; drafts + noindex excluded).
// Valid (possibly small) urlset even with zero posts.
export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.noindex);
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    posts
      .map(
        (p) =>
          `  <url><loc>${DOMAIN}/blog/${p.data.slug}/</loc><lastmod>${(p.data.updatedDate ?? p.data.publishDate).toISOString().slice(0, 10)}</lastmod></url>`,
      )
      .join('\n') +
    (posts.length ? '\n' : '') +
    `</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

