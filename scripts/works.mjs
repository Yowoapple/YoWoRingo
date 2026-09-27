import sharp from 'sharp';
import { mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const img = join(root, 'public', 'img');
const video = join(root, 'public', 'video');
mkdirSync(img, { recursive: true });
mkdirSync(video, { recursive: true });

const images = [
  ['dyfi-115051.png', 'twerg-dyfi'],
  ['rain-map.png', 'twerg-rain'],
  ['typhoon-map.jpg', 'twerg-typhoon'],
  ['site-home.jpg', 'twerg-site-home'],
  ['site-reports.jpg', 'twerg-site-reports']
];

for (const [file, name] of images) {
  const src = join(root, 'twerg', file);
  const meta = await sharp(src).metadata();
  for (const w of [720, 1400]) {
    const width = Math.min(w, meta.width);
    await sharp(src).resize({ width }).webp({ quality: 82 }).toFile(join(img, `${name}-${w}.webp`));
    await sharp(src).resize({ width }).avif({ quality: 55, effort: 5 }).toFile(join(img, `${name}-${w}.avif`));
  }
  console.log(`${name} ${meta.width}x${meta.height}`);
}

const logoSrc = join(root, 'twerg', 'twerg-logo-dark.png');
const { data: logoPx, info: logoInfo } = await sharp(logoSrc).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const at = (x, y) => (y * logoInfo.width + x) * 3;
const bgK = at(4, 4);
const background = { r: logoPx[bgK], g: logoPx[bgK + 1], b: logoPx[bgK + 2] };
const ink = (x, y) => {
  const k = at(x, y);
  return Math.abs(logoPx[k] - background.r) + Math.abs(logoPx[k + 1] - background.g) + Math.abs(logoPx[k + 2] - background.b) > 40;
};
const rowInk = y => Array.from({ length: logoInfo.width }, (_, x) => x).some(x => ink(x, y));
let top = 0;
while (!rowInk(top)) top++;
let bottom = top;
while (rowInk(bottom + 1)) bottom++;
let left = logoInfo.width, right = 0;
for (let y = top; y <= bottom; y++) for (let x = 0; x < logoInfo.width; x++) if (ink(x, y)) {
  left = Math.min(left, x);
  right = Math.max(right, x);
}
const icon = await sharp(logoSrc).removeAlpha().extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).toBuffer();

async function logoCard(name, w, h, iconH, web = true) {
  const scaled = await sharp(icon).resize({ height: iconH }).toBuffer();
  const meta = await sharp(scaled).metadata();
  const card = sharp({ create: { width: w, height: h, channels: 3, background } })
    .composite([{ input: scaled, left: Math.round((w - meta.width) / 2), top: Math.round((h - meta.height) / 2) }]);
  const buf = await card.png().toBuffer();
  if (web) {
    await sharp(buf).webp({ quality: 88 }).toFile(join(img, `${name}.webp`));
    await sharp(buf).avif({ quality: 60, effort: 5 }).toFile(join(img, `${name}.avif`));
  }
  await sharp(buf).png().toFile(join(root, 'twerg', `${name}.png`));
  console.log(`${name} ${w}x${h}`);
}

await logoCard('twerg-logo-card', 600, 450, 300);
await logoCard('twerg-logo-square', 720, 720, 454, false);

copyFileSync(join(root, 'PLUM', 'Produce_36.mp4'), join(video, 'plum.mp4'));
console.log(`plum.mp4 ${(statSync(join(video, 'plum.mp4')).size / 1048576).toFixed(1)} MB`);
