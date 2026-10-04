// Linking helper: suggests internal links for a future article from seo/keyword-map.json.
// Reads the keyword map + backlog clusters; prints anchor → target suggestions.
// Usage:
//   node scripts/suggest-links.mjs --keyword "m3u playlist player"
//   node scripts/suggest-links.mjs --cluster trial-evaluation --limit 10
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const map = JSON.parse(readFileSync(join(root, 'seo', 'keyword-map.json'), 'utf8'));

const args = process.argv.slice(2);
const get = (k, d = null) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const kw = (get('--keyword', '') || '').toLowerCase();
const cluster = get('--cluster', '');
const limit = parseInt(get('--limit', '10')) || 10;

if (!kw && !cluster) {
  console.error('Usage: node scripts/suggest-links.mjs --keyword "<target>" [--limit N]');
  console.error('   or: node scripts/suggest-links.mjs --cluster <cluster> [--limit N]');
  process.exit(1);
}

const row = kw ? map.find((r) => r.keyword.toLowerCase() === kw) : null;
if (kw && !row) {
  console.error(`Keyword not in map: ${kw}`);
  process.exit(1);
}
const focus = cluster || row.cluster;

// Rules (see seo/internal-linking.md):
// 1. Up-link: article → its pillar hub (or home section for home-cluster terms).
// 2. Siblings: ≥2 same-cluster articles (published or planned slugs).
// 3. Home: one link back to the relevant home section/CTA with a descriptive anchor.
// 4. Never suggest identical anchor text for two different URLs.
const sameCluster = map
  .filter((r) => r.cluster === focus && (!row || r.keyword.toLowerCase() !== row.keyword.toLowerCase()))
  .sort((a, b) => b.score - a.score);

const homeAnchor = {
  'subscription-plans': { anchor: 'IPTV subscription plans', url: '/#features' },
  'trial-evaluation': { anchor: 'start your IPTV free trial', url: '/contact/' },
  'providers-comparison': { anchor: 'why viewers compare IPTV providers', url: '/#features' },
  'quality-4k-premium': { anchor: 'premium IPTV quality in 4K', url: '/#features' },
  'devices-apps-setup': { anchor: 'works with any compatible M3U playlist player', url: '/#devices' },
  'playlists-m3u-guides': { anchor: 'compatible M3U playlist player', url: '/#devices' },
  'sports-viewing': { anchor: 'sports categories built for match nights', url: '/#features' },
  'legal-safety': { anchor: 'how to tell a legitimate IPTV provider', url: '/#faq' },
  'content-categories': { anchor: 'channels organized by interest', url: '/#features' },
  'general-iptv-info': { anchor: 'Public IPTV home', url: '/' },
}[focus] ?? { anchor: 'Public IPTV home', url: '/' };

console.log(`Focus: ${kw || '(cluster query)'} [${focus}]`);
console.log(`1. UP-LINK (article → pillar/home): "${homeAnchor.anchor}" → ${homeAnchor.url}`);
console.log(`   (pillar page /guides/${focus}/ does not exist yet — link home until it does)`);
const sibArticles = sameCluster.filter((r) => r.slot === 'reserved-article');
const homeTerms = sameCluster.filter((r) => r.slot !== 'reserved-article');
console.log('2. SIBLINGS (same cluster, reserved articles — pick ≥2 with unique anchors):');
sibArticles.slice(0, limit).forEach((r) => {
  console.log(`   - "${r.keyword}" → ${r.proposed_slug} (vol ${r.volume})`);
});
if (homeTerms.length) {
  console.log('3. HOME SECTION terms in this cluster (link UP to these, do not re-target):');
  homeTerms.slice(0, 6).forEach((r) => {
    console.log(`   - "${r.keyword}" → ${r.proposed_slug} (${r.slot})`);
  });
}
if (row) {
  console.log(`4. HOME-BACKLINK: from the home ${focus} section, link "${row.keyword}" → /blog/${row.proposed_slug.replace(/^\/blog\/|\/$/g, '')}/ once published.`);
}
console.log('Rules: descriptive anchors only; no "click here"; no identical anchor → different URL; max ~100 links/page.');
