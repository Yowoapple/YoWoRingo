import subsetFont from 'subset-font';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const fontDir = join(root, 'fonts');
const outDir = join(root, 'public', 'fonts');
const exts = new Set(['.html', '.js', '.css']);
const PUNCT = '，。、：；！？「」『』（）《》〈〉…—';
const isCJK = c => (c >= 0x3000 && c <= 0x9fff) || (c >= 0xf900 && c <= 0xfaff) || (c >= 0xff00 && c <= 0xffef);

function walk(dir, list) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, list);
    else if (exts.has(extname(p))) list.push(p);
  }
  return list;
}

function cjkSet(text) {
  const s = new Set();
  for (const ch of text) if (isCJK(ch.codePointAt(0))) s.add(ch);
  return s;
}

function unicodeRange(chars) {
  const cps = [...chars].map(c => c.codePointAt(0)).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < cps.length; i++) {
    let j = i;
    while (j + 1 < cps.length && cps[j + 1] === cps[j] + 1) j++;
    const hex = n => n.toString(16).toUpperCase();
    out.push(i === j ? `U+${hex(cps[i])}` : `U+${hex(cps[i])}-${hex(cps[j])}`);
    i = j;
  }
  return out.join(', ');
}

const sources = [...['src', 'photography', 'works'].flatMap(d => walk(join(root, d), [])), join(root, 'index.html'), join(root, '404.html')]
  .filter(f => !f.includes(`${join('src', 'i18n')}`));
const core = cjkSet(sources.map(f => readFileSync(f, 'utf8')).join('') + PUNCT);
const hantText = Object.values(JSON.parse(readFileSync(join(root, 'src/i18n/zh-Hant.json'), 'utf8'))).join('');
const hansText = Object.values(JSON.parse(readFileSync(join(root, 'src/i18n/zh-Hans.json'), 'utf8'))).join('');
const hantFull = new Set([...cjkSet(hantText + PUNCT)].filter(c => !core.has(c)));
const hansAll = new Set([...cjkSet(hansText + PUNCT), ...core]);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const faces = [];
const kb = b => `${(b.length / 1024).toFixed(1)} KB`;

async function face(family, file, chars, weight, out) {
  const buf = await subsetFont(readFileSync(join(fontDir, file)), [...chars].join(''), { targetFormat: 'woff2' });
  writeFileSync(join(outDir, out), buf);
  faces.push(`@font-face {\n  font-family: '${family}';\n  src: url('/fonts/${out}') format('woff2');\n  font-weight: ${weight};\n  font-display: swap;\n  unicode-range: ${unicodeRange(chars)};\n}`);
  console.log(`${out} ${kb(buf)} (${chars.size} glyphs)`);
}

const TC = { 300: 'Light', 400: 'Regular', 700: 'Bold' };
for (const [w, name] of Object.entries(TC)) await face('HarmonyOS Sans TC', `HarmonyOS_SansTC_${name}.ttf`, core, w, `hos-tc-core-${w}.woff2`);
if (hantFull.size) for (const w of [400, 700]) await face('HarmonyOS Sans TC', `HarmonyOS_SansTC_${TC[w]}.ttf`, hantFull, w === 700 ? '600 900' : '300 500', `hos-tc-${w}.woff2`);
await face('HarmonyOS Sans SC', 'HarmonyOS_Sans_SC.ttf', hansAll, '100 900', 'hos-sc.woff2');

writeFileSync(join(root, 'src', 'css', 'fonts.css'), faces.join('\n\n') + '\n');
console.log(`core ${core.size}, zh-Hant extra ${hantFull.size}, zh-Hans ${hansAll.size}`);
