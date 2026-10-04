import type { APIRoute } from 'astro';
import { DOMAIN } from '../data/site';

// Sitemap index (ready for future growth; children generated at the same build).
export const prerender = true;

export const GET: APIRoute = () => {
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <sitemap><loc>${DOMAIN}/sitemap-pages.xml</loc></sitemap>\n` +
    `  <sitemap><loc>${DOMAIN}/sitemap-posts.xml</loc></sitemap>\n` +
    `</sitemapindex>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

