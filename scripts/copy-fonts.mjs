// Copies self-hosted font files (Latin subsets only) into public/fonts
// so preloads resolve. Run before `astro build`.
// Usage: node scripts/copy-fonts.mjs
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destDir = join(root, 'public', 'fonts');
mkdirSync(destDir, { recursive: true });

const files = [
  ['@fontsource-variable', 'plus-jakarta-sans', 'files', 'plus-jakarta-sans-latin-wght-normal.woff2'],
  ['@fontsource-variable', 'inter', 'files', 'inter-latin-wght-normal.woff2'],
  ['@fontsource', 'sometype-mono', 'files', 'sometype-mono-latin-400-normal.woff2'],
  ['@fontsource', 'sometype-mono', 'files', 'sometype-mono-latin-500-normal.woff2'],
];
for (const parts of files) {
  const src = join(root, 'node_modules', ...parts);
  if (!existsSync(src)) {
    console.error('missing font source: ' + src);
    process.exit(1);
  }
  copyFileSync(src, join(destDir, parts[parts.length - 1]));
  console.log('copied ' + parts[parts.length - 1]);
}
