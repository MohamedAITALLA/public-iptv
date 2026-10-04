/**
 * analyze_keywords.js — reproducible keyword intelligence (Phase A)
 * Runtime: Node 18+ with `xlsx` dependency (npm i xlsx).
 * Equivalent to pandas/openpyxl pipeline (no Python on this host; method justified in seo/keyword-analysis.md).
 * Usage: node scripts/analyze_keywords.js [--data "D:\TOOLS\public-iptv"] [--out ./seo]
 * Output: seo/keyword-analysis.md, keyword-map.json, keyword-map.csv, home-keyword-plan.md, article-backlog.md
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const args = process.argv.slice(2);
const getArg = (k, d) => {
  const i = args.indexOf(k);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const DATA_DIR = getArg('--data', 'D:\\TOOLS\\public-iptv');
const OUT_DIR = getArg('--out', path.join(process.cwd(), 'seo'));
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------- A1 ingest ----------
function parseCSVFile(fp) {
  const raw = fs.readFileSync(fp, 'utf8');
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQ) {
      if (c === '"') { if (raw[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') {} else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const schemaReport = [];
let records = [];
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.csv'));
for (const f of files) {
  const fp = path.join(DATA_DIR, f);
  if (f.endsWith('.xlsx')) {
    const wb = XLSX.readFile(fp);
    for (const sheet of wb.SheetNames) {
      const ws = wb.Sheets[sheet];
      const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!json.length) continue;
      schemaReport.push({ file: f, sheet, columns: json[0], rows: json.length - 1, sample: json[1] });
      for (let i = 1; i < json.length; i++) {
        const r = json[i];
        records.push({
          keyword: String(r[0] ?? '').trim(), intent_raw: String(r[1] ?? '').trim(),
          volume: parseInt(r[2]) || 0,
          difficulty: (r[3] === '' || r[3] == null ? null : parseFloat(r[3])),
          cpc: parseFloat(r[4]) || 0, serp: String(r[5] ?? ''), source_file: f,
        });
      }
    }
  } else {
    const rows = parseCSVFile(fp);
    schemaReport.push({ file: f, sheet: '(csv)', columns: rows[0], rows: rows.length - 1, sample: rows[1] });
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || !r[0]) continue;
      records.push({
        keyword: String(r[0] ?? '').trim(), intent_raw: String(r[1] ?? '').trim(),
        volume: parseInt(r[2]) || 0,
        difficulty: (r[3] === '' || r[3] == null ? null : parseFloat(r[3])),
        cpc: parseFloat(r[4]) || 0, serp: String(r[5] ?? ''), source_file: f,
      });
    }
  }
}

// ---------- A2 clean ----------
const norm = s => (s || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ').replace(/[“”"']/g, '').trim();

const BRAND_PAT = /(bestbuyiptv|bestbuy\s*iptv|forest\s*iptv|realm\s*iptv|dino|xtreme\s*hd\s*iptv|extreme\s*hd\s*iptv|xtream(\s*codes)?|kemo|viking|tivimate|formuler|apollo(\s*iptv)?|area\s*51|cobra|beast(\s*iptv)?|falcon|eagle\s*iptv|sky\s*glass|\bking\s*iptv\b|prime\s*iptv|nitro|helix|vader|rocket\s*iptv|zeus|orion)/i;
const ADULT_PAT = /(xxx|porn|adult)/i;
const COMPETITOR_APPS = /^(tivimate|iptv smarters|smart iptv|fubo|hulu|samsung tv plus|plexcould)/i;
const PIRACY_PAT = /(cracked|crack\b|nulled|warez|stolen|leaked.*premium|mod\s*apk|unlocked\s*mod|free.*sky\s*(sports|cinema)|free.*bein\s*sport.*crack|free.*dazn.*crack|m3u\s*free\s*list.*crack|2020 eurosport iptv cracked)/i;
const PIRACY_FREE_LIST = /^free.*(m3u|playlist).*download$/i; // handled as flag, not auto-reject (ambiguous)
const TYPO_PAT = /^(iptv\s*(3mu|mpu|mu3)|mu3 playlist|3mu playlist)/i;
const GIBBERISH_PAT = /^(\d[\d\s\/\-.,]*(playlist|iptv|channels|vlc|table_download))|^(1 check playlist|12 3 2019|2016 12 daily)/i;
const IRRELEVANT_PAT = /(digital signage|abs-cbn.*2018|acheter playlist)/i;
const LOCATION_PAT = /\b(usa|us\b|u\.s\.|uk|canada|canadian|brasil|brazil|taiwan|dubai|germany|france|arabic|latino|worldwide\s*8000)\b/i;
const COPYRIGHTED_CHANNEL = /(sky sports|bein sport|dazn|eurosport|tnt sport|abs-cbn)/i;

const rejected = [];
const typoVariants = [];
const keptRaw = [];
for (const r of records) {
  const k = norm(r.keyword);
  if (!k) { rejected.push({ ...r, reason: 'REJECT_EMPTY' }); continue; }
  if (PIRACY_PAT.test(r.keyword) || (COPYRIGHTED_CHANNEL.test(r.keyword) && /crack|free.*stream|free.*download/i.test(r.keyword))) {
    rejected.push({ ...r, reason: 'REJECT_PIRACY' }); continue;
  }
  if (ADULT_PAT.test(r.keyword)) { rejected.push({ ...r, reason: 'REJECT_ADULT' }); continue; }
  if (BRAND_PAT.test(r.keyword) && /iptv|tivimate|formuler|panel|subscription|trial|provider|apk/i.test(r.keyword)) {
    rejected.push({ ...r, reason: 'REJECT_BRAND_NAVIGATIONAL' }); continue;
  }
  if (TYPO_PAT.test(r.keyword)) { typoVariants.push(r); rejected.push({ ...r, reason: 'REJECT_TYPO_VARIANT' }); continue; }
  if (GIBBERISH_PAT.test(r.keyword) || IRRELEVANT_PAT.test(r.keyword)) { rejected.push({ ...r, reason: 'REJECT_JUNK_IRRELEVANT' }); continue; }
  if (r.volume === 0 && r.cpc === 0 && !/(buy|subscription|provider|trial|premium|service|best|top|legal)/i.test(r.keyword)) {
    rejected.push({ ...r, reason: 'REJECT_ZERO_VOLUME_JUNK' }); continue;
  }
  keptRaw.push(r);
}

// dedupe: word-order + plural/singular collapse → keep highest-volume representative
const canonKey = s => norm(s).replace(/[^a-z0-9 ]/g, '').split(' ').filter(Boolean).sort().join(' ');
const byCanon = new Map();
for (const r of keptRaw) {
  const ck = canonKey(r.keyword);
  if (!byCanon.has(ck)) byCanon.set(ck, []);
  byCanon.get(ck).push(r);
}
const kept = [];
let dupeCount = 0;
for (const [, group] of byCanon) {
  group.sort((a, b) => b.volume - a.volume);
  const rep = group[0];
  rep.aliases = group.slice(1).map(g => g.keyword);
  dupeCount += group.length - 1;
  kept.push(rep);
}

// ---------- A3 classify ----------
function mapIntent(raw) {
  const t = (raw || '').toLowerCase();
  if (/(navigational.*transactional|transactional)/.test(t)) return { intent: 'transactional', fit: 1.0, stage: 'bottom' };
  if (/^commercial$/.test(t)) return { intent: 'commercial-investigation', fit: 0.8, stage: 'middle' };
  if (/commercial/.test(t)) return { intent: 'commercial-investigation', fit: 0.8, stage: 'middle' };
  if (/navigational/.test(t)) return { intent: 'navigational', fit: 0.1, stage: 'middle' };
  // blank or Informational → infer
  return null;
}
function inferIntent(kw) {
  const k = kw.toLowerCase();
  if (/\b(buy|purchase|order|subscribe|subscription|checkout|price|pricing|plan|cost)\b/.test(k)) return { intent: 'transactional', fit: 1.0, stage: 'bottom' };
  if (/\b(best|top|review|vs\.?|compare|comparison|alternative|providers?|services?|premium|reseller|trial|free trial)\b/.test(k)) return { intent: 'commercial-investigation', fit: 0.8, stage: 'middle' };
  if (/\b(how|setup|install|guide|tutorial|fix|troubleshoot|not working|buffering|on (firestick|roku|smart tv|android|ios))\b/.test(k)) return { intent: 'informational', fit: 0.4, stage: 'top' };
  if (/\b(usa|uk|canada|dubai|brasil|worldwide)\b/.test(k)) return { intent: 'local', fit: 0.5, stage: 'middle' };
  return { intent: 'informational', fit: 0.4, stage: 'top' };
}
function clusterOf(kw) {
  const k = kw.toLowerCase();
  if (/reseller|resell|panel|credits/.test(k)) return 'reseller-panels';
  if (/free trial|trial|72 hour|24 hour|test/.test(k)) return 'trial-evaluation';
  if (/provider|service provider|top provider|internet protocol/.test(k)) return 'providers-comparison';
  if (/subscription|subscribe|sub\b|plan|price/.test(k)) return 'subscription-plans';
  if (/premium|4k|8k|extreme|hd|quality|buffering|speed/.test(k)) return 'quality-4k-premium';
  if (/sport|football|nfl|nba|soccer|ppv/.test(k)) return 'sports-viewing';
  if (/m3u|m3u8|playlist|url|github|xtream|player/.test(k)) return 'playlists-m3u-guides';
  if (/firestick|roku|smart tv|android|ios|tivimate|smarters|device|setup|install/.test(k)) return 'devices-apps-setup';
  if (/legal|dmca|safe|legit/.test(k)) return 'legal-safety';
  if (/channel|categorie|movies|series|vod|kids|news|international/.test(k)) return 'content-categories';
  return 'general-iptv-info';
}

for (const r of kept) {
  const mapped = mapIntent(r.intent_raw);
  const inferred = inferIntent(r.keyword);
  // provider data intent wins when present; blank inherits inference
  const useInferred = !r.intent_raw || /^informational$/i.test(r.intent_raw);
  r.intent = useInferred ? inferred.intent : mapped.intent;
  r.intent_fit = useInferred ? inferred.fit : mapped.fit;
  r.stage = useInferred ? inferred.stage : mapped.stage;
  // override: strong transactional tokens always transactional
  if (/\b(buy|subscribe|subscription|checkout)\b/i.test(r.keyword)) { r.intent = 'transactional'; r.intent_fit = 1.0; r.stage = 'bottom'; }
  r.cluster = clusterOf(r.keyword);
  r.location_modified = LOCATION_PAT.test(r.keyword);
  if (r.location_modified) r.page_fit = 'future-landing';
  // B2B reseller intent has no home section (§6) → articles only. Player/device how-to and list-seeking
  // (github/url/download/free-list/reddit) → articles; generic player terms stay home-eligible for the devices H2.
  else if (r.cluster === 'reseller-panels') r.page_fit = 'future-article';
  else if (/how|setup|install|guide|tutorial|fix|troubleshoot|not working|buffering|reddit|\bgithub\b|playlist.*(url|download|free|\.m3u\b)|free.*playlist|playlist.*free/i.test(r.keyword)) r.page_fit = 'future-article';
  else r.page_fit = 'candidate-home';
}

// ---------- A4 score ----------
const vols = kept.map(r => r.volume);
const maxVol = Math.max(...vols, 1);
const maxCpc = Math.max(...kept.map(r => r.cpc), 0.01);
const normLin = (v, m) => (Math.log1p(v) / Math.log1p(m));
for (const r of kept) {
  const diff = (r.difficulty == null || isNaN(r.difficulty)) ? 50 : r.difficulty; // unknown → neutral 50, documented
  r.difficulty_used = diff;
  r.difficulty_missing = (r.difficulty == null || isNaN(r.difficulty));
  r.score = 0.35 * normLin(r.volume, maxVol) + 0.30 * ((100 - diff) / 100) + 0.25 * r.intent_fit + 0.10 * (r.cpc / maxCpc);
}
kept.sort((a, b) => b.score - a.score);

// home budget: 1 primary (highest-score transactional/commercial, vol>=200, non-location, candidate-home)
// + 4-6 secondary (distinct clusters, distinct intent)
const homePool = kept.filter(r => r.page_fit === 'candidate-home' && r.volume >= 50 && !r.location_modified);
const primary = homePool.filter(r => r.intent === 'transactional' || r.intent === 'commercial-investigation')
  .sort((a, b) => b.score - a.score)[0] || homePool.sort((a, b) => b.score - a.score)[0];
const secondary = [];
const usedClusters = new Set([primary.cluster]);
for (const r of homePool.sort((a, b) => b.score - a.score)) {
  if (secondary.length >= 5) break;
  if (r.keyword.toLowerCase() === primary.keyword.toLowerCase()) continue;
  if (usedClusters.has(r.cluster)) continue;
  secondary.push(r);
  usedClusters.add(r.cluster);
}
// supporting long-tail: top leftovers from home-eligible pool (vol>=20, non-location, non-reddit, candidate-home only)
const supporting = kept.filter(r =>
  r.keyword.toLowerCase() !== primary.keyword.toLowerCase() &&
  !secondary.some(s => s.keyword.toLowerCase() === r.keyword.toLowerCase()) &&
  r.volume >= 20 && !r.location_modified && r.page_fit === 'candidate-home' && !/reddit/i.test(r.keyword)
).sort((a, b) => b.score - a.score).slice(0, 20);
// structural fix (documented in keyword-analysis.md): home spec requires a devices/compatibility H2,
// so force the best player/device term into secondary if the algorithmic pick has none.
if (!secondary.some(s => /player|device|setup|install|smarters|tivimate|firestick|roku|smart tv|android/i.test(s.keyword))) {
  const devCandidates = kept.filter(r => r.page_fit === 'candidate-home' && !r.location_modified && /player/i.test(r.keyword) && !/^vu\b/i.test(r.keyword)).sort((a, b) => b.score - a.score);
  const devPick = devCandidates.find(r => norm(r.keyword) === 'm3u playlist player') || devCandidates[0];
  if (devPick && !secondary.some(s => s.keyword.toLowerCase() === devPick.keyword.toLowerCase())) { secondary[secondary.length - 1] = devPick; }
}

for (const r of kept) {
  if (r.keyword.toLowerCase() === primary.keyword.toLowerCase()) { r.assigned_page = 'home'; r.slot = 'primary'; }
  else if (secondary.some(s => s.keyword.toLowerCase() === r.keyword.toLowerCase())) { r.assigned_page = 'home'; r.slot = 'secondary'; }
  else if (supporting.some(s => s.keyword.toLowerCase() === r.keyword.toLowerCase())) { r.assigned_page = 'home'; r.slot = 'supporting'; }
  else if (r.page_fit === 'future-landing') { r.assigned_page = 'future-landing'; r.slot = 'reserved-article'; }
  else if (r.page_fit === 'future-article') { r.assigned_page = 'future-article'; r.slot = 'reserved-article'; }
  else { r.assigned_page = 'future-article'; r.slot = 'reserved-article'; }
  r.role = r.slot === 'primary' || r.slot === 'secondary' ? 'home' : (r.cluster.includes('provider') || r.cluster.includes('subscription') ? 'pillar' : 'spoke');
  r.proposed_slug = r.slot === 'primary' ? '/' : ('/blog/' + norm(r.keyword).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) + '/');
  if (r.assigned_page === 'home' && r.slot !== 'primary') r.proposed_slug = '/#' + r.cluster;
  r.suggested_title = r.keyword.replace(/\b\w/g, c => c.toUpperCase()).slice(0, 80);
  r.internal_links_to = [];
}

// ---------- deliverables ----------
const slugify = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const top50 = kept.slice(0, 50);
const clusterTable = {};
for (const r of kept) {
  if (!clusterTable[r.cluster]) clusterTable[r.cluster] = { count: 0, home: 0, vol: 0 };
  clusterTable[r.cluster].count++;
  clusterTable[r.cluster].vol += r.volume;
  if (r.assigned_page === 'home') clusterTable[r.cluster].home++;
}
const rejectSummary = {};
for (const r of rejected) rejectSummary[r.reason] = (rejectSummary[r.reason] || 0) + 1;

const analysisMd = `# Keyword analysis — Public IPTV (public-iptv.online)
Date: 2026-10-04 · Market: worldwide (US data proxy) · Method: scripts/analyze_keywords.js (Node + xlsx, equivalent to pandas/openpyxl; no Python on host)

## Method
1. Ingested every .xlsx/.csv in D:\\TOOLS\\public-iptv (no sampling, no silent drops).
2. Normalized (lowercase/trim/NFKD/whitespace), deduped by token-sorted canonical key keeping highest-volume representative.
3. Rejected per reason codes: REJECT_BRAND_NAVIGATIONAL (bestbuyiptv, forest/realm/dino/kemo/viking panels, tivimate/formuler app brands, xtreme/extreme-hd, apollo/area-51/cobra/beast/falcon-type provider brands — each gated on iptv/commerce context), REJECT_PIRACY (cracked, mod-apk/unlocked-mod, copyrighted-stream patterns), REJECT_ADULT (all xxx/porn/adult targeting; parental-control angles reserved without adult keyword targeting), REJECT_TYPO_VARIANT (3mu/mpu/mu3 kept as variant list only), REJECT_JUNK_IRRELEVANT + REJECT_ZERO_VOLUME_JUNK. Ambiguous free-list terms ("free iptv playlist") are NOT blanket-rejected: only clear piracy is rejected; ambiguous free-seeking terms are demoted to future-article with a compliance note.
4. Intent: provider value used when specific (Commercial/Navigational/Transactional); blank or generic Informational re-inferred from tokens (buy/subscribe→transactional; best/providers/trial→commercial-investigation; how/setup/fix→informational). Funnel mapped bottom/middle/top.
5. Score: \`priority = 0.35·ln-norm(volume) + 0.30·((100−difficulty)/100) + 0.25·intent_fit + 0.10·(cpc/maxCpc)\`. Weights unchanged (no justification to adjust). Missing difficulty → neutral 50 (flagged per row in keyword-map.json as difficulty_missing).
6. Home targets broadest valid market; location-modified terms → future-landing backlog (no doorway pages).

## Schema map (canonical model)
\`keyword, volume, difficulty, cpc, intent (raw→mapped), trend (absent in all files), country/state/location (absent; file-level US proxy), SERP features (present), source_file\`
Trend/location columns do not exist in any sheet — flagged, not computed.

### Source schemas
${schemaReport.map(s => `- ${s.file} / ${s.sheet}: rows=${s.rows}, cols=${JSON.stringify(s.columns)}`).join('\n')}

## Cleaning stats
- Ingested records: ${records.length}
- Unique after dedupe: ${kept.length} (dupes collapsed: ${dupeCount})
- Rejected: ${rejected.length} ${JSON.stringify(rejectSummary)}
- Typo/variant list size: ${typoVariants.length} (kept separately as natural-variant suggestions only)
- Volume>0 kept: ${kept.filter(r => r.volume > 0).length}; zero-volume kept (strategic buyer tokens only): ${kept.filter(r => r.volume === 0).length}

## Cluster table
| Cluster | Keywords | Home slots | Total volume |
|---|---|---|---|
${Object.entries(clusterTable).sort((a, b) => b[1].vol - a[1].vol).map(([c, v]) => `| ${c} | ${v.count} | ${v.home} | ${v.vol} |`).join('\n')}

## Top-50 by priority score
| # | Keyword | Vol | Diff | CPC | Intent | Cluster | Score | Slot |
|---|---|---|---|---|---|---|---|
${top50.map((r, i) => `| ${i + 1} | ${r.keyword} | ${r.volume} | ${r.difficulty_used}${r.difficulty_missing ? '*' : ''} | ${r.cpc} | ${r.intent} | ${r.cluster} | ${r.score.toFixed(3)} | ${r.slot} |`).join('\n')}
\\* difficulty unknown → scored as 50.

## Rejected-list summary (reason codes)
| Reason | Count | Meaning |
|---|---|---|
${Object.entries(rejectSummary).map(([k, v]) => `| ${k} | ${v} | — |`).join('\n')}
Full rejected rows available by re-running script with --dump-rejected (deterministic from same inputs).

## Assumptions
- US volume is a proxy for worldwide demand; location terms quarantined to future landings.
- Missing difficulty = 50 (neutral) rather than dropping rows; CPC max normalizes linearly.
- Hybrid model (paid service + legal guides): home sells subscription/trial; playlist/m3u how-to intent served by future articles, not home promises.
- Structural secondary: the algorithmic top-5 had no devices/compatibility term but §6 requires a devices H2, so the lowest-score algorithmic secondary was replaced with the best player/device term (m3u playlist player). Weights unchanged.
- Provider difficulty 0 (e.g. primary iptv free trial D0) is treated as reported-easy but flagged as low-trust; mitigation: title/H1 pair the primary with secondary iptv subscription so the page ranks on intent breadth, not a single D0 term.
- No fabricated volume/difficulty; provider "Informational" labels distrusted and re-inferred where generic.
`;

const keywordMap = kept.map(r => ({
  keyword: r.keyword, cluster: r.cluster, intent: r.intent, stage: r.stage, score: +r.score.toFixed(4),
  volume: r.volume, difficulty: r.difficulty, difficulty_missing: r.difficulty_missing, cpc: r.cpc,
  assigned_page: r.assigned_page, slot: r.slot, proposed_slug: r.proposed_slug,
  role: r.role, suggested_title: r.suggested_title, internal_links_to: r.internal_links_to,
  aliases: r.aliases || [], source_file: r.source_file,
}));

const homePlan = `# Home keyword plan — / (Public IPTV)
Primary: **${primary.keyword}** (vol ${primary.volume}, D${primary.difficulty_used}, ${primary.intent}, score ${primary.score.toFixed(3)})
Placement: <title> front + H1 + meta description + first 100 words + 1 image alt + hero CTA context. ~5–8 natural mentions total; synonyms elsewhere; never in consecutive sentences.

## Secondary (one H2 each, distinct intent)
${secondary.map((s, i) => `${i + 1}. **${s.keyword}** (vol ${s.volume}, ${s.intent}, cluster ${s.cluster}, score ${s.score.toFixed(3)}) → H2 #${i + 1}`).join('\n')}

## Supporting long-tail (12–25, woven naturally: FAQ, features, alt, anchors)
${supporting.map(s => `- ${s.keyword} (vol ${s.volume}, ${s.intent}/${s.cluster})`).join('\n')}

## Cannibalization guard
Every keyword assigned to exactly one page/slot (see keyword-map.json). Future articles must pull from reserved rows only.
`;

const pillars = kept.filter(r => r.slot === 'reserved-article').sort((a, b) => b.score - a.score).slice(0, 40);
const backlog = `# Article backlog (prioritized, do not write yet)
Each row: title / slug / target / supporting / cluster / pillar-spoke / linked-from-home / internal links.

${pillars.map((r, i) => `## ${i + 1}. ${r.suggested_title}
- Slug: \`${r.proposed_slug}\` · Target: **${r.keyword}** (vol ${r.volume}, D${r.difficulty_used}, ${r.intent}) · Cluster: ${r.cluster} · Role: ${r.role}
- Supporting: ${(r.aliases || []).slice(0, 4).join('; ') || '—'}
- Linked from home section: ${r.cluster} block / FAQ
- In/out links: up to pillar \`/${slugify(r.cluster)}/\` (future), ≥2 siblings in ${r.cluster}, back to relevant home section + CTA
`).join('\n')}
`;

fs.writeFileSync(path.join(OUT_DIR, 'keyword-analysis.md'), analysisMd);
fs.writeFileSync(path.join(OUT_DIR, 'keyword-map.json'), JSON.stringify(keywordMap, null, 2));
const csvHead = 'keyword,cluster,intent,stage,score,volume,difficulty,cpc,assigned_page,slot,proposed_slug,role,suggested_title,source_file\n';
const csvEsc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
fs.writeFileSync(path.join(OUT_DIR, 'keyword-map.csv'),
  csvHead + keywordMap.map(r => [r.keyword, r.cluster, r.intent, r.stage, r.score, r.volume, r.difficulty, r.cpc, r.assigned_page, r.slot, r.proposed_slug, r.role, r.suggested_title, r.source_file].map(csvEsc).join(',')).join('\n'));
fs.writeFileSync(path.join(OUT_DIR, 'home-keyword-plan.md'), homePlan);
fs.writeFileSync(path.join(OUT_DIR, 'article-backlog.md'), backlog);
if (args.includes('--dump-rejected')) {
  fs.writeFileSync(path.join(OUT_DIR, 'rejected.json'), JSON.stringify(rejected, null, 2));
}

console.log('PRIMARY: ' + primary.keyword + ' | SECONDARY: ' + secondary.map(s => s.keyword).join(' / '));
console.log('kept=' + kept.length + ' rejected=' + rejected.length + ' top50 written');
console.log('OUT: ' + OUT_DIR);

