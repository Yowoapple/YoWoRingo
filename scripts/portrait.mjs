import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const src = join(root, 'YoWoRingo.png');
const outDir = join(root, 'public', 'img');
mkdirSync(outDir, { recursive: true });

const meta = await sharp(src).metadata();
for (const w of [480, 960, meta.width]) {
  await sharp(src).resize({ width: w }).avif({ quality: 55, effort: 5 }).toFile(join(outDir, `portrait-${w}.avif`));
  await sharp(src).resize({ width: w }).webp({ quality: 82 }).toFile(join(outDir, `portrait-${w}.webp`));
}
await sharp(src).resize({ width: 180 }).png({ palette: false }).toFile(join(outDir, 'portrait-sample.png'));
console.log(`portrait ${meta.width}x${meta.height}`);
