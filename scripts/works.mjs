import sharp from 'sharp';
import { mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const img = join(root, 'public', 'img');
const video = join(root, 'public', 'video');
mkdirSync(img, { recursive: true });
mkdirSync(video, { recursive: true });

const map = join(root, 'twerg', 'dyfi-115051.png');
for (const w of [720, 1400]) {
  await sharp(map).resize({ width: w }).webp({ quality: 82 }).toFile(join(img, `twerg-dyfi-${w}.webp`));
  await sharp(map).resize({ width: w }).avif({ quality: 55, effort: 5 }).toFile(join(img, `twerg-dyfi-${w}.avif`));
}

copyFileSync(join(root, 'PLUM', 'Produce_36.mp4'), join(video, 'plum.mp4'));
console.log(`plum.mp4 ${(statSync(join(video, 'plum.mp4')).size / 1048576).toFixed(1)} MB`);
