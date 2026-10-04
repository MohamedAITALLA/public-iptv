import type { APIRoute } from 'astro';
import { DOMAIN } from '../data/site';

// robots.txt generated at build so staging and production diverge deterministically:
// staging/preview → Disallow: / (plus X-Robots-Tag: noindex via host header, see public/_headers + docs).
// Never blocks CSS/JS/images/fonts. No Crawl-delay, no Noindex-in-robots.
// AI-crawler policy: default allow; toggle block commented below (see docs/seo-decisions.md).
export const prerender = true;

export const GET: APIRoute = () => {
  const staging = import.meta.env.PUBLIC_INDEXING === 'staging';
  const body = staging
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /search?\n\n# AI crawlers: default allow. To block, uncomment the next two lines:\n# User-agent: GPTBot\n# Disallow: /\n\nSitemap: ${DOMAIN}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

