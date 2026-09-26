import subsetFont from 'subset-font';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fontDir = join(root, 'fonts');
const outDir = join(root, 'public', 'fonts');
const weights = { 300: 'Light', 400: 'Regular', 500: 'Medium', 700: 'Bold' };
const scanDirs = ['src', 'photography', 'works'].map(d => join(root, d));
const scanFiles = ['index.html', '404.html'].map(f => join(root, f));
const exts = new Set(['.html', '.js', '.json', '.css']);

function walk(dir, list) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, list);
    else if (exts.has(extname(p))) list.push(p);
  }
  return list;
}

const files = scanDirs.flatMap(d => walk(d, [])).concat(scanFiles);
const chars = new Set();
for (const f of files) {
  for (const ch of readFileSync(f, 'utf8')) {
    const c = ch.codePointAt(0);
    if ((c >= 0x3000 && c <= 0x9fff) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xff00 && c <= 0xffef)) chars.add(ch);
  }
}
const text = '，。、：；！？「」『』（）《》〈〉…' + [...chars].join('');

mkdirSync(outDir, { recursive: true });
for (const [w, name] of Object.entries(weights)) {
  const buf = readFileSync(join(fontDir, `HarmonyOS_SansTC_${name}.ttf`));
  const out = await subsetFont(buf, text, { targetFormat: 'woff2' });
  writeFileSync(join(outDir, `harmonyos-sans-tc-${w}.woff2`), out);
  console.log(`${w} ${(out.length / 1024).toFixed(1)} KB`);
}
console.log(`${chars.size} CJK glyphs`);
