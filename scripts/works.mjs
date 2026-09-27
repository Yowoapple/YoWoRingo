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

copyFileSync(join(root, 'PLUM', 'Produce_36.mp4'), join(video, 'plum.mp4'));
console.log(`plum.mp4 ${(statSync(join(video, 'plum.mp4')).size / 1048576).toFixed(1)} MB`);
