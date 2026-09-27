import subsetFont from 'subset-font';
import * as fontkit from 'fontkit';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..', '..');
export const SANS = join(root, 'node_modules/@fontsource-variable/schibsted-grotesk/files/schibsted-grotesk-latin-wght-normal.woff2');
export const MONO = join(root, 'node_modules/@fontsource-variable/azeret-mono/files/azeret-mono-latin-wght-normal.woff2');
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()/,.?–-+';

export async function font(file, wght) {
  const buf = await subsetFont(readFileSync(file), CHARS, { targetFormat: 'sfnt', variationAxes: { wght } });
  return fontkit.create(buf);
}

export function textPath(f, str, size, x, y, tracking = 0) {
  const run = f.layout(str);
  const s = size / f.unitsPerEm;
  let pen = 0, d = '';
  run.glyphs.forEach((g, i) => {
    d += g.path.scale(s, -s).translate(x + pen, y).toSVG();
    pen += run.positions[i].xAdvance * s + tracking * size;
  });
  return { d, width: pen };
}
