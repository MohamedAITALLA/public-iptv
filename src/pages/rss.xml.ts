import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { DOMAIN, SITE_NAME } from '../data/site';

// RSS feed for future articles (valid empty feed until the first post ships).
export const prerender = true;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => !data.draft && !data.noindex)).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf(),
  );
  const items = posts
    .map(
      (p) =>
        `    <item><title>${esc(p.data.title)}</title><link>${DOMAIN}/blog/${p.data.slug}/</link><guid>${DOMAIN}/blog/${p.data.slug}/</guid><pubDate>${p.data.publishDate.toUTCString()}</pubDate><description>${esc(p.data.description)}</description></item>`,
    )
    .join('\n');
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(SITE_NAME)} guides</title><link>${DOMAIN}/blog/</link><description>Setup and viewing guides.</description>\n` +
    (items ? items + '\n' : '') +
    `</channel></rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};

