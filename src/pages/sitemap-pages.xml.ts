import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { DOMAIN } from '../data/site';
import { LASTMOD } from '../data/lastmod';

// Canonical static pages (only indexable, 200-status URLs; no priority/changefreq).
const STATIC_PAGES = ['/', '/privacy/', '/terms/', '/refund/', '/contact/'];

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.noindex);
  const urls = [
    ...STATIC_PAGES.map((p) => ({ loc: `${DOMAIN}${p === '/' ? '/' : p}`, lastmod: LASTMOD[p] ?? '2026-10-04' })),
    ...posts.map((p) => ({
      loc: `${DOMAIN}/blog/${p.data.slug}/`,
      lastmod: (p.data.updatedDate ?? p.data.publishDate).toISOString().slice(0, 10),
    })),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

