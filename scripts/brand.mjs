import sharp from 'sharp';
import subsetFont from 'subset-font';
import * as fontkit from 'fontkit';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pub = join(root, 'public');
const ogDir = join(pub, 'og');
mkdirSync(ogDir, { recursive: true });

const INK = '#0b0b0c', PAPER = '#efeeea', MUTE = '#85847f', SIGNAL = '#2b3bff';
const SANS = join(root, 'node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2');
const MONO = join(root, 'node_modules/@fontsource-variable/azeret-mono/files/azeret-mono-latin-wght-normal.woff2');
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()/,.?–-+';

async function font(file, wght) {
  const buf = await subsetFont(readFileSync(file), CHARS, { targetFormat: 'sfnt', variationAxes: { wght } });
  return fontkit.create(buf);
}

const bold = await font(SANS, 700);
const heavy = await font(SANS, 800);
const regular = await font(SANS, 450);
const mono = await font(MONO, 400);
const monoLight = await font(MONO, 200);

function text(f, str, size, x, y, { fill = PAPER, tracking = 0 } = {}) {
  const run = f.layout(str);
  const s = size / f.unitsPerEm;
  let pen = 0, d = '';
  run.glyphs.forEach((g, i) => {
    d += g.path.scale(s, -s).translate(x + pen, y).toSVG();
    pen += run.positions[i].xAdvance * s + tracking * size;
  });
  return { svg: `<path d="${d}" fill="${fill}"/>`, width: pen };
}

function monogram(size, { radius = 0, inset = 1 } = {}) {
  const g = heavy.glyphForCodePoint(89);
  const glyphSize = 22 * inset;
  const s = glyphSize / heavy.unitsPerEm;
  const p = g.path.scale(s, -s);
  const b = p.bbox;
  const sq = 5 * inset;
  const total = b.maxX - b.minX + 1.2 * inset + sq;
  const tx = (32 - total) / 2 - b.minX;
  const ty = (32 - (b.maxY - b.minY)) / 2 - b.minY;
  const body = `<path d="${p.translate(tx, ty).toSVG()}" fill="${PAPER}"/><rect x="${(tx + b.maxX + 1.2 * inset).toFixed(2)}" y="${(ty + b.maxY - sq).toFixed(2)}" width="${sq}" height="${sq}" fill="${SIGNAL}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="${INK}"/>${body}</svg>`;
}

writeFileSync(join(pub, 'favicon.svg'), monogram(32, { radius: 7 }).replace(/ width="32" height="32"/, ''));
await sharp(Buffer.from(monogram(32, { radius: 7 }))).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'));
await sharp(Buffer.from(monogram(180))).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'));
await sharp(Buffer.from(monogram(192, { radius: 7 }))).resize(192, 192).png().toFile(join(pub, 'icon-192.png'));
await sharp(Buffer.from(monogram(512, { radius: 7 }))).resize(512, 512).png().toFile(join(pub, 'icon-512.png'));
await sharp(Buffer.from(monogram(512, { inset: 0.72 }))).resize(512, 512).png().toFile(join(pub, 'icon-maskable-512.png'));

writeFileSync(join(pub, 'manifest.webmanifest'), JSON.stringify({
  name: 'YoWoRingo',
  short_name: 'YoWoRingo',
  description: 'Got any Ringo? The portfolio of YoWoRingo.',
  start_url: '/YoWoRingo/',
  scope: '/YoWoRingo/',
  display: 'standalone',
  background_color: INK,
  theme_color: INK,
  icons: [
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
}, null, 2));

const W = 1200, H = 630;
const frame = inner => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`;

function wordmark(x, y, size) {
  const t = text(bold, 'YoWoRingo', size, x, y, { tracking: -0.04 });
  const sq = size * 0.3;
  return t.svg + `<rect x="${(x + t.width + size * 0.04).toFixed(1)}" y="${(y - sq - size * 0.02).toFixed(1)}" width="${sq.toFixed(1)}" height="${sq.toFixed(1)}" fill="${SIGNAL}"/>`;
}

async function pixelPortrait(w, h) {
  const cols = 30, rows = 40;
  const small = await sharp(join(root, 'public/img/portrait-sample.png')).resize(cols, rows).raw().toBuffer();
  const cw = w / cols, ch = h / rows, gap = 1.2;
  let out = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = (r * cols + c) * 3;
    out += `<rect x="${(c * cw).toFixed(1)}" y="${(r * ch).toFixed(1)}" width="${(cw - gap).toFixed(1)}" height="${(ch - gap).toFixed(1)}" fill="rgb(${small[k]},${small[k + 1]},${small[k + 2]})"/>`;
  }
  return out;
}

async function render(name, svg, images = []) {
  await sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .composite([...images, { input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(join(ogDir, `${name}.jpg`));
  console.log(`og/${name}.jpg`);
}

const label = (str, x, y, fill = MUTE) => text(mono, str, 18, x, y, { fill, tracking: 0.04 }).svg;

await render('home', frame(`
  ${label('(PORTFOLIO) VOL. 2026', 72, 92)}
  ${wordmark(72, 300, 118)}
  ${text(bold, 'Got any Ringo?', 46, 72, 392, { fill: SIGNAL, tracking: -0.03 }).svg}
  ${label('FOUNDER, TWERG / GAME DEVELOPER / STREET PHOTOGRAPHER', 72, 558, PAPER)}
  <g transform="translate(800 84)">${await pixelPortrait(330, 440)}</g>`));

const photoBuf = await sharp(join(pub, 'photos/p21-1280.webp')).resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
await render('photography', frame(`
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${INK}" stop-opacity="0.92"/><stop offset="0.65" stop-color="${INK}" stop-opacity="0.25"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${label('YOWORINGO / WORK 03', 72, 92, PAPER)}
  ${text(heavy, 'FOCAL', 150, 64, 330, { tracking: -0.06 }).svg}
  ${text(heavy, 'LENGTH', 150, 64, 460, { fill: SIGNAL, tracking: -0.06 }).svg}
  ${label('54 FRAMES / 23 TO 439 MM', 72, 558, PAPER)}`), [{ input: photoBuf, top: 0, left: 0 }]);

const dyfi = await sharp(join(pub, 'img/twerg-dyfi-720.webp')).resize(360, 492, { fit: 'contain', background: INK }).toBuffer();
await render('twerg', frame(`
  ${label('YOWORINGO / WORK 01 / FOUNDER', 72, 92)}
  ${text(heavy, 'TWERG', 184, 60, 370, { tracking: -0.07 }).svg}
  ${text(regular, 'Taiwan Earthquake Recording Group', 36, 72, 450, { fill: MUTE, tracking: -0.02 }).svg}
  ${label('2018 / 10,000+ MEMBERS / DYFI', 72, 558, PAPER)}`), [{ input: dyfi, top: 69, left: 780 }]);

const plum = JSON.parse(readFileSync(join(root, 'src/data/plum.json'), 'utf8'));
const COLORS = ['#f4f9ff', '#f2f2ff', '#00aaff', '#0041ff', '#fae696', '#ffe600', '#ff9900', '#ff2800', '#a50021', '#b40068'];
const mapScale = 560 / plum.viewBox[3];
const mapSvg = `<g transform="translate(760 35) scale(${mapScale.toFixed(4)})">${plum.towns.map(t => `<path d="${t.d}" fill="${COLORS[t.v2[0]]}" stroke="${INK}" stroke-width="1"/>`).join('')}<path d="${plum.coast}" fill="none" stroke="${PAPER}" stroke-opacity="0.4" stroke-width="1.5"/></g>`;
await render('plum', frame(`
  ${label('YOWORINGO / WORK 02 / RESEARCH', 72, 92)}
  ${text(heavy, 'Beyond', 128, 64, 300, { tracking: -0.06 }).svg}
  ${text(heavy, 'the Point', 128, 64, 420, { fill: SIGNAL, tracking: -0.06 }).svg}
  ${label('DIRECTIVITY-AWARE INTENSITY ESTIMATION', 72, 558, PAPER)}
  ${mapSvg}`));

await render('galgame', frame(`
  ${label('YOWORINGO / WORK 04 / IN DEVELOPMENT', 72, 92)}
  ${label('DAY', 72, 250)}
  ${text(monoLight, '001', 250, 60, 440, { tracking: -0.08 }).svg}
  ${text(mono, '/ 100', 44, 560, 440, { fill: MUTE }).svg}
  ${text(bold, '100 DAYS', 52, 72, 540, { tracking: -0.04 }).svg}
  ${Array.from({ length: 100 }, (_, i) => `<rect x="${72 + i * 10.56}" y="566" width="8.6" height="18" fill="${i === 0 ? SIGNAL : '#2a2a2d'}"/>`).join('')}`));
