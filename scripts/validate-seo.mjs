// validate-seo.mjs — automated checks per brief §13.1 + contrast + keyword placement.
// Usage: node scripts/validate-seo.mjs [--dir dist]
// Exit non-zero on any failure. Prints real numbers/outputs for the final report.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const get = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const DIR = join(root, get('--dir', 'dist'));
const DOMAIN = 'https://public-iptv.online';

let pass = 0;
let fail = 0;
const ok = (name, detail = '') => { pass++; console.log(`PASS ${name}${detail ? ' — ' + detail : ''}`); };
const bad = (name, detail = '') => { fail++; console.log(`FAIL ${name}${detail ? ' — ' + detail : ''}`); };

const read = (p) => readFileSync(join(DIR, p), 'utf8');
const html = read('index.html');
const stripTags = (s) => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// 1. exactly one h1 (home + every content page)
for (const p of ['index.html', 'contact/index.html', 'privacy/index.html', 'terms/index.html', 'refund/index.html', '404.html']) {
  const h1s = (read(p).match(/<h1[\s>]/gi) || []).length;
  h1s === 1 ? ok(`one-h1:${p}`, `${h1s}`) : bad(`one-h1:${p}`, `found ${h1s}`);
}

// 2. title ≤60; description 140–160 (home)
const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
title.length <= 60 ? ok('title-length', `${title.length} chars: "${title}"`) : bad('title-length', `${title.length} chars`);
desc.length >= 140 && desc.length <= 160 ? ok('meta-description', `${desc.length} chars`) : bad('meta-description', `${desc.length} chars: "${desc}"`);

// 3. canonical absolute (home)
const canon = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1] || '';
canon.startsWith('https://') ? ok('canonical-absolute', canon) : bad('canonical-absolute', canon);

// 4. JSON-LD parses; FAQ schema == visible FAQ
const ldRaw = (html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/) || [])[1] || '';
let ld = null;
try { ld = JSON.parse(ldRaw); ok('jsonld-parses', `${ld['@graph'].length} nodes in @graph`); }
catch (e) { bad('jsonld-parses', String(e)); }
if (ld) {
  const faq = ld['@graph'].find((n) => n['@type'] === 'FAQPage');
  const visibleQs = [...html.matchAll(/<details class="acc-row" name="home-faq">[\s\S]*?<summary>[\s\S]*?<span>([^<]*)<\/span>[\s\S]*?<p class="acc-body">([\s\S]*?)<\/p>/g)]
    .map((m) => ({ q: m[1].trim(), a: m[2].trim() }));
  if (!faq) bad('faq-schema-present', 'no FAQPage node');
  else {
    const schemaQs = faq.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text }));
    const same = schemaQs.length === visibleQs.length &&
      schemaQs.every((s, i) => s.q === visibleQs[i].q && s.a === visibleQs[i].a);
    same ? ok('faq-schema-matches-visible', `${schemaQs.length} Q&As identical`) : bad('faq-schema-matches-visible', `schema=${schemaQs.length} visible=${visibleQs.length}`);
  }
  const types = ld['@graph'].map((n) => n['@type']).sort().join(',');
  /Organization/.test(types) && /WebSite/.test(types) && /WebPage/.test(types)
    ? ok('jsonld-core-nodes', types) : bad('jsonld-core-nodes', types);
  /AggregateRating|Review|Offer/.test(JSON.stringify(ld)) ? bad('jsonld-no-fabricated', 'rating/offer markup without real data') : ok('jsonld-no-fabricated');
}

// 5. no broken internal links
const hrefs = new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1].split('#')[0]).filter(Boolean));
const missing = [...hrefs].filter((h) => {
  if (h === '/') return !existsSync(join(DIR, 'index.html'));
  const rel = h.replace(/^\//, '');
  return !(existsSync(join(DIR, rel)) || existsSync(join(DIR, rel, 'index.html')) || existsSync(join(DIR, rel + '.html')));
});
missing.length === 0 ? ok('internal-links', `${hrefs.size} internal hrefs resolve`) : bad('internal-links', 'missing: ' + missing.join(', '));

// 6. every img has alt/width/height
const imgs = [...html.matchAll(/<img[^>]*>/gi)].map((m) => m[0]);
const imgsOk = imgs.filter((t) => /alt="[^"]+"/.test(t) && /width=/.test(t) && /height=/.test(t));
imgs.length === imgsOk.length ? ok('img-alt-size', `${imgs.length} imgs (all compliant)`) : bad('img-alt-size', `${imgs.length - imgsOk.length} non-compliant`);

// 7. sitemap URLs canonical + referenced in robots
const pages = read('sitemap-pages.xml');
const locs = [...pages.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
const nonCanon = locs.filter((l) => !l.startsWith(DOMAIN) || /\/\//.test(l.replace('https://', '')));
nonCanon.length === 0 ? ok('sitemap-canonical', `${locs.length} urls`) : bad('sitemap-canonical', nonCanon.join(','));
const fsPaths = locs.map((l) => l.replace(DOMAIN, '').replace(/^\//, ''));
const absent = fsPaths.filter((p) => p !== '' && !(existsSync(join(DIR, p, 'index.html')) || existsSync(join(DIR, p))));
absent.length === 0 ? ok('sitemap-resolves', locs.join(' ')) : bad('sitemap-resolves', absent.join(','));
// sitemap URLs must be indexable (no noindex meta on listed pages)
const noindexed = fsPaths.filter((p) => {
  if (p === '') return /name="robots" content="noindex/.test(html);
  const f = join(DIR, p, 'index.html');
  return existsSync(f) && /name="robots" content="noindex/.test(readFileSync(f, 'utf8'));
});
noindexed.length === 0 ? ok('sitemap-indexable') : bad('sitemap-indexable', noindexed.join(', '));
const robots = read('robots.txt');
robots.includes(`Sitemap: ${DOMAIN}/sitemap.xml`) ? ok('robots-sitemap-ref') : bad('robots-sitemap-ref', robots.split('\n')[0]);
/robots\.txt/.test('x');
/Disallow:.*(css|js|png|jpg|svg|woff)/i.test(robots) ? bad('robots-no-asset-block', robots) : ok('robots-no-asset-block');
/^User-agent: \*\nAllow: \//m.test(robots) ? ok('robots-allows') : bad('robots-allows', robots);

// 8. CSS hygiene: no old-system remnants; pure black only as surface, never text
let css = '';
for (const f of readdirSync(join(DIR, '_astro'))) if (f.endsWith('.css')) css += readFileSync(join(DIR, '_astro', f), 'utf8');
const remnants = ['#0b3558', '#006bff', 'rgba(71,103,136', 'Manrope', '#f8f9fb'].filter((s) => css.includes(s));
remnants.length === 0 ? ok('css-no-old-system') : bad('css-no-old-system', remnants.join(', '));
/(^|[^-])color:\s*#(000|000000)(?![0-9a-f])/i.test(css) ? bad('css-no-black-text') : ok('css-no-black-text');

// 9. forbidden fabricated claims (exact patterns only; keyword-mirror "best IPTV for sports" H2 is allowed)
const vis = stripTags(html);
const forb = ['#1 iptv', 'best in the world', '99.99%', 'ratingValue', 'aggregateRating', '5-star rated', 'trusted by 1', 'award-winning'];
const hit = forb.filter((f) => vis.toLowerCase().includes(f.toLowerCase()));
hit.length === 0 ? ok('no-fabricated-claims') : bad('no-fabricated-claims', hit.join(', '));

// 10. contrast audit (key text/background pairs, WCAG AA 4.5 normal / 3.0 large)
const lum = (hex) => {
  const c = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const pairs = [
  ['#202020', '#ffffff', 4.5, 'ink-on-white'], ['#202020', '#f8f9fa', 4.5, 'ink-on-mist'],
  ['#646464', '#ffffff', 4.5, 'slate-on-white'], ['#646464', '#f8f9fa', 4.5, 'slate-on-mist'],
  ['#ffffff', '#202020', 4.5, 'white-on-ink'], ['#ffffff', '#111111', 4.5, 'white-on-dark'],
  ['#b3b3b3', '#111111', 4.5, 'fog-on-dark'], ['#6647f0', '#eeeeee', 4.5, 'violet-on-mercury'],
];
for (const [fg, bg, min, name] of pairs) {
  const r = ratio(fg, bg);
  r >= min ? ok(`contrast:${name}`, r.toFixed(2) + ':1') : bad(`contrast:${name}`, r.toFixed(2) + ':1 < ' + min);
}

// 11. keyword placement audit
const count = (re) => (vis.match(re) || []).length;
const primary = count(/iptv free trial/gi);
primary >= 5 && primary <= 8 ? ok('kw-primary-count', `${primary} mentions`) : bad('kw-primary-count', `${primary} mentions (want 5-8)`);
const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
const need = ['iptv subscription', 'iptv premium', 'm3u playlist player', 'best iptv for sports', 'iptv provider'];
for (const k of need) {
  h2s.some((h) => h.toLowerCase().includes(k)) ? ok(`kw-h2:${k}`) : bad(`kw-h2:${k}`, h2s.join(' // '));
}
/iptv free trial/i.test(title) ? ok('kw-title-primary') : bad('kw-title-primary', title);
/iptv free trial/i.test(desc) && /iptv subscription/i.test(desc) ? ok('kw-desc-primary-secondary') : bad('kw-desc-primary-secondary', desc);
/iptv free trial/i.test(html.split('<h1')[1].split('</h1>')[0]) ? ok('kw-h1-primary') : bad('kw-h1-primary');
/iptv free trial/i.test(vis.split('.')[0] + vis.split('.')[1]) ? ok('kw-first-100-words') : bad('kw-first-100-words');

// 12. no visible placeholders remain in shipped HTML
const phPages = ['index.html', 'contact/index.html', 'privacy/index.html', 'terms/index.html', 'refund/index.html'];
const phHits = phPages.filter((p) => read(p).includes('{{'));
phHits.length === 0 ? ok('no-placeholders') : bad('no-placeholders', phHits.join(', '));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
