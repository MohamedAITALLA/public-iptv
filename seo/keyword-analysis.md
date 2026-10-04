# Keyword analysis — Public IPTV (public-iptv.online)
Date: 2026-10-04 · Market: worldwide (US data proxy) · Method: scripts/analyze_keywords.js (Node + xlsx, equivalent to pandas/openpyxl; no Python on host)

## Method
1. Ingested every .xlsx/.csv in D:\TOOLS\public-iptv (no sampling, no silent drops).
2. Normalized (lowercase/trim/NFKD/whitespace), deduped by token-sorted canonical key keeping highest-volume representative.
3. Rejected per reason codes: REJECT_BRAND_NAVIGATIONAL (bestbuyiptv, forest/realm/dino/kemo/viking panels, tivimate/formuler app brands, xtreme/extreme-hd, apollo/area-51/cobra/beast/falcon-type provider brands — each gated on iptv/commerce context), REJECT_PIRACY (cracked, mod-apk/unlocked-mod, copyrighted-stream patterns), REJECT_ADULT (all xxx/porn/adult targeting; parental-control angles reserved without adult keyword targeting), REJECT_TYPO_VARIANT (3mu/mpu/mu3 kept as variant list only), REJECT_JUNK_IRRELEVANT + REJECT_ZERO_VOLUME_JUNK. Ambiguous free-list terms ("free iptv playlist") are NOT blanket-rejected: only clear piracy is rejected; ambiguous free-seeking terms are demoted to future-article with a compliance note.
4. Intent: provider value used when specific (Commercial/Navigational/Transactional); blank or generic Informational re-inferred from tokens (buy/subscribe→transactional; best/providers/trial→commercial-investigation; how/setup/fix→informational). Funnel mapped bottom/middle/top.
5. Score: `priority = 0.35·ln-norm(volume) + 0.30·((100−difficulty)/100) + 0.25·intent_fit + 0.10·(cpc/maxCpc)`. Weights unchanged (no justification to adjust). Missing difficulty → neutral 50 (flagged per row in keyword-map.json as difficulty_missing).
6. Home targets broadest valid market; location-modified terms → future-landing backlog (no doorway pages).

## Schema map (canonical model)
`keyword, volume, difficulty, cpc, intent (raw→mapped), trend (absent in all files), country/state/location (absent; file-level US proxy), SERP features (present), source_file`
Trend/location columns do not exist in any sheet — flagged, not computed.

### Source schemas
- iptv_all-keywords_us_2026-10-03 (1).xlsx / iptv: rows=2153, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03 (2).xlsx / iptv: rows=1824, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03 (3).xlsx / iptv: rows=1801, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03 (4).xlsx / iptv: rows=1391, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03 (5).xlsx / iptv: rows=1060, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03 (6).xlsx / iptv: rows=2541, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03.csv / (csv): rows=5423, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]
- iptv_all-keywords_us_2026-10-03.xlsx / iptv: rows=2225, cols=["Keyword","Intent","Volume","Keyword Difficulty","CPC (USD)","SERP Features"]

## Cleaning stats
- Ingested records: 18418
- Unique after dedupe: 8059 (dupes collapsed: 1988)
- Rejected: 8371 {"REJECT_JUNK_IRRELEVANT":38,"REJECT_PIRACY":99,"REJECT_BRAND_NAVIGATIONAL":319,"REJECT_ZERO_VOLUME_JUNK":7723,"REJECT_ADULT":178,"REJECT_TYPO_VARIANT":14}
- Typo/variant list size: 14 (kept separately as natural-variant suggestions only)
- Volume>0 kept: 2653; zero-volume kept (strategic buyer tokens only): 5406

## Cluster table
| Cluster | Keywords | Home slots | Total volume |
|---|---|---|---|
| playlists-m3u-guides | 662 | 1 | 39050 |
| providers-comparison | 2084 | 7 | 38470 |
| subscription-plans | 1786 | 12 | 21750 |
| trial-evaluation | 1081 | 4 | 11700 |
| quality-4k-premium | 1474 | 1 | 11260 |
| reseller-panels | 621 | 0 | 6430 |
| sports-viewing | 334 | 1 | 6120 |
| general-iptv-info | 12 | 0 | 140 |
| legal-safety | 3 | 0 | 10 |
| devices-apps-setup | 2 | 0 | 0 |

## Top-50 by priority score
| # | Keyword | Vol | Diff | CPC | Intent | Cluster | Score | Slot |
|---|---|---|---|---|---|---|---|
| 1 | iptv free trial | 3600 | 0 | 0 | commercial-investigation | trial-evaluation | 0.805 | primary |
| 2 | iptv subscription | 5400 | 37 | 1.32 | transactional | subscription-plans | 0.770 | secondary |
| 3 | iptv providers | 5400 | 21 | 1.21 | commercial-investigation | providers-comparison | 0.767 | secondary |
| 4 | ip tv subscription | 720 | 18 | 1.32 | transactional | subscription-plans | 0.752 | supporting |
| 5 | iptv subscription usa | 320 | 7 | 0 | transactional | subscription-plans | 0.744 | reserved-article |
| 6 | iptv smarters pro subscription | 1300 | 25 | 0 | transactional | subscription-plans | 0.742 | supporting |
| 7 | iptv trial | 590 | 0 | 0 | commercial-investigation | trial-evaluation | 0.738 | supporting |
| 8 | iptv smarters pro subscription price | 140 | 0 | 0 | transactional | subscription-plans | 0.734 | supporting |
| 9 | iptv subscription service | 590 | 18 | 0 | transactional | subscription-plans | 0.734 | supporting |
| 10 | iptv service providers | 1900 | 16 | 0 | commercial-investigation | providers-comparison | 0.733 | supporting |
| 11 | buy iptv subscription | 390 | 14 | 0 | transactional | subscription-plans | 0.730 | supporting |
| 12 | iptv uk subscription | 260 | 9 | 0 | transactional | subscription-plans | 0.730 | reserved-article |
| 13 | iptv free trial 2026 | 720 | 5 | 0 | commercial-investigation | trial-evaluation | 0.730 | supporting |
| 14 | smart iptv trial | 480 | 0 | 0 | commercial-investigation | trial-evaluation | 0.730 | supporting |
| 15 | best iptv providers | 1300 | 18 | 0 | commercial-investigation | providers-comparison | 0.713 | supporting |
| 16 | iptv provider | 4400 | 37 | 1.21 | commercial-investigation | providers-comparison | 0.712 | supporting |
| 17 | iptv lifetime subscription | 140 | 8 | 0 | transactional | subscription-plans | 0.710 | supporting |
| 18 | iptv subscriptions | 590 | 13 | 1.32 | commercial-investigation | subscription-plans | 0.710 | supporting |
| 19 | best 4k iptv subscription | 110 | 6 | 0 | transactional | subscription-plans | 0.707 | supporting |
| 20 | iptv subscription pro | 110 | 10 | 1.32 | transactional | subscription-plans | 0.706 | supporting |
| 21 | best iptv subscription 2026 | 170 | 12 | 0 | transactional | subscription-plans | 0.705 | supporting |
| 22 | iptv premium | 1000 | 20 | 0.91 | commercial-investigation | quality-4k-premium | 0.705 | secondary |
| 23 | us iptv providers | 390 | 6 | 0 | commercial-investigation | providers-comparison | 0.704 | reserved-article |
| 24 | best iptv provider | 1600 | 24 | 0 | commercial-investigation | providers-comparison | 0.703 | supporting |
| 25 | iptv provider subscription | 90 | 9 | 1.32 | transactional | providers-comparison | 0.702 | supporting |
| 26 | subscription for iptv | 170 | 17 | 1.32 | transactional | subscription-plans | 0.702 | supporting |
| 27 | iptv service provider | 1900 | 27 | 0 | commercial-investigation | providers-comparison | 0.700 | supporting |
| 28 | iptv subscription reddit | 720 | 32 | 0 | transactional | subscription-plans | 0.699 | reserved-article |
| 29 | iptv smarters subscription | 170 | 15 | 0 | transactional | subscription-plans | 0.696 | reserved-article |
| 30 | iptv trends iptv provider | 50 | 0 | 0 | transactional | providers-comparison | 0.696 | reserved-article |
| 31 | ip tv provider | 590 | 19 | 1.77 | commercial-investigation | providers-comparison | 0.696 | reserved-article |
| 32 | affordable iptv subscription | 110 | 11 | 0 | transactional | subscription-plans | 0.692 | reserved-article |
| 33 | premium iptv subscription | 140 | 15 | 0 | transactional | subscription-plans | 0.689 | reserved-article |
| 34 | iptv 72 hour free trial | 260 | 6 | 0 | commercial-investigation | trial-evaluation | 0.689 | reserved-article |
| 35 | internet protocol television providers | 720 | 24 | 1.77 | commercial-investigation | providers-comparison | 0.688 | reserved-article |
| 36 | 12 month iptv subscription | 50 | 3 | 0 | transactional | subscription-plans | 0.687 | reserved-article |
| 37 | iptv subscription free trial | 70 | 8 | 0 | transactional | trial-evaluation | 0.685 | reserved-article |
| 38 | iptv subscription 12 months | 50 | 4 | 0 | transactional | subscription-plans | 0.684 | reserved-article |
| 39 | smart iptv subscription | 50 | 4 | 0 | transactional | subscription-plans | 0.684 | reserved-article |
| 40 | iptv provider reddit | 480 | 32 | 0 | transactional | providers-comparison | 0.684 | reserved-article |
| 41 | iptv reseller | 880 | 23 | 0 | commercial-investigation | reseller-panels | 0.683 | reserved-article |
| 42 | iptv subscription for smart iptv | 40 | 2 | 0 | transactional | subscription-plans | 0.682 | reserved-article |
| 43 | iptv subscription packages | 70 | 9 | 0 | transactional | subscription-plans | 0.682 | reserved-article |
| 44 | iptv subscription services | 70 | 9 | 0 | transactional | subscription-plans | 0.682 | reserved-article |
| 45 | iptv with free trial | 260 | 9 | 0 | commercial-investigation | trial-evaluation | 0.680 | reserved-article |
| 46 | iptv subscription indian channel | 170 | 22 | 0 | transactional | subscription-plans | 0.675 | reserved-article |
| 47 | iptv free trial 72h | 110 | 0 | 0 | commercial-investigation | trial-evaluation | 0.675 | reserved-article |
| 48 | iptv providers with free trials | 110 | 0 | 0 | commercial-investigation | trial-evaluation | 0.675 | reserved-article |
| 49 | iptv 24 hour free trial channel list | 210 | 8 | 0 | commercial-investigation | trial-evaluation | 0.675 | reserved-article |
| 50 | buy iptv subscription usa | 40 | 5 | 0 | transactional | subscription-plans | 0.673 | reserved-article |
\* difficulty unknown → scored as 50.

## Rejected-list summary (reason codes)
| Reason | Count | Meaning |
|---|---|---|
| REJECT_JUNK_IRRELEVANT | 38 | — |
| REJECT_PIRACY | 99 | — |
| REJECT_BRAND_NAVIGATIONAL | 319 | — |
| REJECT_ZERO_VOLUME_JUNK | 7723 | — |
| REJECT_ADULT | 178 | — |
| REJECT_TYPO_VARIANT | 14 | — |
Full rejected rows available by re-running script with --dump-rejected (deterministic from same inputs).

## Assumptions
- US volume is a proxy for worldwide demand; location terms quarantined to future landings.
- Missing difficulty = 50 (neutral) rather than dropping rows; CPC max normalizes linearly.
- Hybrid model (paid service + legal guides): home sells subscription/trial; playlist/m3u how-to intent served by future articles, not home promises.
- Structural secondary: the algorithmic top-5 had no devices/compatibility term but §6 requires a devices H2, so the lowest-score algorithmic secondary was replaced with the best player/device term (m3u playlist player). Weights unchanged.
- Provider difficulty 0 (e.g. primary iptv free trial D0) is treated as reported-easy but flagged as low-trust; mitigation: title/H1 pair the primary with secondary iptv subscription so the page ranks on intent breadth, not a single D0 term.
- No fabricated volume/difficulty; provider "Informational" labels distrusted and re-inferred where generic.
