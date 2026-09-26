import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const srcDir = join(root, 'Photo');
const outDir = join(root, 'public', 'photos');
const manifest = JSON.parse(readFileSync(join(root, 'src', 'data', 'photos.json'), 'utf8'));
const widths = [640, 1280, 2048];
const force = process.argv.includes('--force');

mkdirSync(outDir, { recursive: true });

async function detectBar(file, width, height) {
  const sampleW = 600;
  const { data, info } = await sharp(file).resize({ width: sampleW }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const h = info.height;
  const scale = height / h;
  let base = 0;
  for (let y = h - 6; y < h - 2; y++) for (let x = 2; x < 12; x++) base += data[y * sampleW + x];
  base /= 40;
  const frac = [];
  for (let y = 0; y < h; y++) {
    let n = 0;
    for (let x = 0; x < sampleW; x++) if (Math.abs(data[y * sampleW + x] - base) <= 6) n++;
    frac.push(n / sampleW);
  }
  const expected = (height > width ? 0.1512 : 0.1152) * width;
  const lo = Math.floor(h - (expected * 1.1) / scale);
  const hi = Math.ceil(h - (expected * 0.9) / scale);
  let edge = -1;
  for (let y = hi; y >= lo; y--) {
    if (frac[y] < 0.9 && frac[y + 1] >= 0.97 && frac[y + 2] >= 0.97) { edge = y + 1; break; }
  }
  const barTop = edge > 0 ? Math.round(edge * scale) : Math.round(height - expected);
  return { barTop, detected: edge > 0 };
}

const out = [];
for (const item of manifest) {
  const file = join(srcDir, item.src);
  const meta = await sharp(file).metadata();
  let crop = { left: 0, top: 0, width: meta.width, height: meta.height };
  let detected = null;
  if (item.mark === 'bar') {
    const bar = await detectBar(file, meta.width, meta.height);
    detected = bar.detected;
    crop.height = bar.barTop - 4;
  }
  const base = sharp(file).extract(crop);
  const sizes = widths.filter(w => w < crop.width).concat(crop.width > widths.at(-1) ? [] : [crop.width]);
  const targets = [...new Set(sizes)].slice(0, 3);
  for (const w of targets) {
    const avif = join(outDir, `${item.id}-${w}.avif`);
    const webp = join(outDir, `${item.id}-${w}.webp`);
    if (force || !existsSync(avif)) await base.clone().resize({ width: w }).avif({ quality: 52, effort: 5 }).toFile(avif);
    if (force || !existsSync(webp)) await base.clone().resize({ width: w }).webp({ quality: 78 }).toFile(webp);
  }
  const stats = await base.clone().resize({ width: 64 }).stats();
  const { r, g, b } = stats.dominant;
  const lqip = await base.clone().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  const { id, src, ...rest } = item;
  out.push({
    id,
    ...rest,
    width: crop.width,
    height: crop.height,
    ratio: +(crop.width / crop.height).toFixed(4),
    sizes: targets,
    color: `rgb(${r} ${g} ${b})`,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`
  });
  console.log(`${id} ${item.mark}${detected === null ? '' : detected ? ' edge' : ' fallback'} ${crop.width}x${crop.height}`);
}

writeFileSync(join(root, 'src', 'data', 'photos.gen.json'), JSON.stringify(out, null, 1));
