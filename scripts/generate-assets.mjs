// Generates raster SEO assets: ink-on-white icon set + 1200x630 OG card
// in the productivity-dialect design system (no copyrighted imagery).
// Usage: node scripts/generate-assets.mjs  (requires: npm i sharp)
// Output: public/favicon.ico, icon-192.png, icon-512.png, apple-touch-icon.png, og-image.png
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
mkdirSync(pub, { recursive: true });

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#202020"/><path d="M25 20v24l20-12L25 20z" fill="#ffffff"/><path d="M15 44a20 20 0 0 1 0-24" stroke="#0091ff" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;

// --- icons ---
const png32 = await sharp(Buffer.from(ICON_SVG)).resize(32, 32).png().toBuffer();
const png16 = await sharp(Buffer.from(ICON_SVG)).resize(16, 16).png().toBuffer();

// Minimal ICO container (PNG payloads — valid for all modern browsers).
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + 16 * pngs.length;
  const dirs = pngs.map((p) => {
    const d = Buffer.alloc(16);
    const size = p.width >= 256 ? 0 : p.width;
    d[0] = size;
    d[1] = size;
    d[2] = 0;
    d[3] = 0;
    d.writeUInt16LE(1, 4);
    d.writeUInt16LE(32, 6);
    d.writeUInt32LE(p.buf.length, 8);
    d.writeUInt32LE(offset, 12);
    offset += p.buf.length;
    return d;
  });
  return Buffer.concat([header, ...dirs, ...pngs.map((p) => p.buf)]);
}
writeFileSync(join(pub, 'favicon.ico'), ico([{ width: 16, buf: png16 }, { width: 32, buf: png32 }]));

await sharp(Buffer.from(ICON_SVG)).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
await sharp(Buffer.from(ICON_SVG)).resize(192, 192).png().toFile(join(pub, 'icon-192.png'));
await sharp(Buffer.from(ICON_SVG)).resize(512, 512).png().toFile(join(pub, 'icon-512.png'));

// --- OG image 1200x630: onyx headline on white + violet pill + blue checks ---
const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#ffffff"/>
<rect x="0" y="0" width="1200" height="8" fill="#6647f0"/>
<rect x="100" y="140" width="260" height="44" rx="22" fill="#eeeeee"/>
<text x="130" y="169" font-family="monospace" font-size="20" letter-spacing="2" fill="#6647f0">FREE TRIAL INCLUDED</text>
<text x="96" y="290" font-family="sans-serif" font-size="84" font-weight="800" fill="#090c1d">IPTV Free Trial</text>
<text x="96" y="384" font-family="sans-serif" font-size="84" font-weight="800" fill="#090c1d">&amp; Subscription Plans</text>
<text x="100" y="440" font-family="sans-serif" font-size="30" fill="#646464">Premium 4K quality on every screen — Public IPTV</text>
<rect x="100" y="470" width="300" height="64" rx="32" fill="#202020"/>
<text x="140" y="511" font-family="sans-serif" font-size="26" font-weight="700" fill="#ffffff">Start free trial</text>
<rect x="1020" y="120" width="80" height="80" rx="20" fill="#202020"/>
<path d="M1048 140v40l33-20-33-20z" fill="#ffffff"/>
</svg>`;
await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og-image.png'));
console.log('assets written: favicon.ico, apple-touch-icon.png, icon-192/512.png, og-image.png');
