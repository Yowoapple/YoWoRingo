import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SANS, MONO, font, textPath } from './lib/type.mjs';

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'public', 'readme');
mkdirSync(out, { recursive: true });

const INK = '#0b0b0c', PAPER = '#efeeea', MUTE = '#85847f', SIGNAL = '#2b3bff', PINK = '#ff4fa3';
const W = 1200, H = 420, CELL = 11;

const bold = await font(SANS, 700);
const mono = await font(MONO, 400);

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

async function pixels(d, box) {
  const cols = Math.ceil(box.w / CELL), rows = Math.ceil(box.h / CELL);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols}" height="${rows}" viewBox="${box.x} ${box.y} ${cols * CELL} ${rows * CELL}"><path d="${d}" fill="#fff"/></svg>`;
  const { data } = await sharp(Buffer.from(svg)).resize(cols, rows).flatten({ background: '#000' }).greyscale().raw().toBuffer({ resolveWithObject: true });
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (data[r * cols + c] > 110) cells.push([box.x + c * CELL, box.y + r * CELL]);
  return cells;
}

const label = (str, x, y, fill = MUTE, size = 15) => `<path d="${textPath(mono, str, size, x, y, 0.04).d}" fill="${fill}"/>`;

function frame(inner, css) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><style>${css}@media (prefers-reduced-motion: reduce){*{animation:none!important}}</style><defs><clipPath id="card"><rect width="${W}" height="${H}" rx="18"/></clipPath></defs><g clip-path="url(#card)"><rect width="${W}" height="${H}" fill="${INK}"/>${inner}</g></svg>`;
}

const word = textPath(bold, 'YoWoRingo', 150, 64, 250, -0.045);
const sq = 150 * 0.3;
const sqX = 64 + word.width + 6;
const sqY = 250 - sq - 3;
const cells = await pixels(word.d, { x: 60, y: 120, w: word.width + 10, h: 170 });

const heroCells = cells.map(([x, y]) => {
  const a = rand() * Math.PI * 2, dist = 260 + rand() * 520;
  const dx = Math.cos(a) * dist, dy = Math.sin(a) * dist * 0.6;
  const delay = (rand() * 0.5 + (x - 60) / word.width * 0.5).toFixed(2);
  return `<rect x="${x}" y="${y}" width="${CELL - 1.5}" height="${CELL - 1.5}" style="--x:${dx.toFixed(0)}px;--y:${dy.toFixed(0)}px;animation-delay:${delay}s"/>`;
}).join('');

const tag = textPath(bold, 'Got any Ringo?', 44, 66, 332, -0.03);

const heroCss = `
.px rect{fill:${PAPER};animation:px 9s cubic-bezier(.16,1,.3,1) infinite both}
@keyframes px{0%{transform:translate(var(--x),var(--y));opacity:0}14%{transform:none;opacity:1}24%{opacity:1}30%{opacity:0}88%{opacity:0;transform:none}100%{opacity:0;transform:translate(var(--x),var(--y))}}
.word{animation:word 9s ease infinite both}
@keyframes word{0%,22%{opacity:0}28%,86%{opacity:1}92%,100%{opacity:0}}
.dot{animation:dot 9s cubic-bezier(.34,1.56,.64,1) infinite both;transform-origin:${(sqX + sq / 2).toFixed(1)}px ${(sqY + sq / 2).toFixed(1)}px}
@keyframes dot{0%,24%{transform:scale(0)}30%,86%{transform:scale(1)}92%,100%{transform:scale(0)}}
.tag{animation:tag 9s steps(14) infinite both}
@keyframes tag{0%,32%{transform:scaleX(0)}46%,86%{transform:scaleX(1)}92%,100%{transform:scaleX(0)}}
.caret{animation:caret 9s steps(14) infinite both,blink .8s steps(1) infinite}
@keyframes caret{0%,32%{transform:translateX(0)}46%,86%{transform:translateX(${tag.width.toFixed(1)}px)}92%,100%{transform:translateX(0)}}
@keyframes blink{50%{opacity:0}}
.scan{animation:scan 9s linear infinite}
@keyframes scan{0%{transform:translateX(-10px)}100%{transform:translateX(${W + 10}px)}}
`;

writeFileSync(join(out, 'hero.svg'), frame(`
<defs><clipPath id="tc"><rect class="tag" x="66" y="290" width="${(tag.width + 4).toFixed(1)}" height="56" style="transform-origin:66px 0"/></clipPath></defs>
<rect class="scan" x="0" y="0" width="1" height="${H}" fill="${SIGNAL}" opacity="0.35"/>
${label('(PORTFOLIO) VOL. 2026', 66, 64)}
${label('YOWOAPPLE.GITHUB.IO/YOWORINGO', W - 66 - textPath(mono, 'YOWOAPPLE.GITHUB.IO/YOWORINGO', 15, 0, 0, 0.04).width, 64)}
<g class="px">${heroCells}</g>
<path class="word" d="${word.d}" fill="${PAPER}"/>
<rect class="dot" x="${sqX.toFixed(1)}" y="${sqY.toFixed(1)}" width="${sq}" height="${sq}" fill="${SIGNAL}"/>
<path d="${tag.d}" fill="${SIGNAL}" clip-path="url(#tc)"/>
<rect class="caret" x="68" y="296" width="3" height="44" fill="${SIGNAL}"/>
${label('FOUNDER, TWERG / GAME DEVELOPER / STREET PHOTOGRAPHER', 66, H - 48, PAPER)}
`, heroCss));

const secretCells = cells.map(([x, y]) => {
  const fall = 180 + rand() * 260, drift = (rand() - 0.5) * 160;
  const delay = (rand() * 0.9).toFixed(2);
  return `<rect x="${x}" y="${y - 40}" width="${CELL - 1.5}" height="${CELL - 1.5}" style="--x:${drift.toFixed(0)}px;--y:${fall.toFixed(0)}px;--r:${((rand() - 0.5) * 540).toFixed(0)}deg;animation-delay:${delay}s"/>`;
}).join('');
const secretLine = textPath(bold, 'No Ringo here.', 44, 66, H - 70, -0.03);

const secretCss = `
.fall rect{fill:${PINK};transform-box:fill-box;transform-origin:center;animation:fall 6s cubic-bezier(.55,0,.9,.4) infinite both}
@keyframes fall{0%,30%{transform:none;opacity:1}75%{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}100%{transform:translate(var(--x),var(--y)) rotate(var(--r));opacity:0}}
.line{animation:line 6s ease infinite both}
@keyframes line{0%,45%{opacity:0;transform:translateY(12px)}60%,92%{opacity:1;transform:none}100%{opacity:0}}
`;

writeFileSync(join(out, 'secret.svg'), frame(`
${label('(SECRET) KUROMI MODE', 66, 64, PINK)}
<g class="fall">${secretCells}</g>
<path class="line" d="${secretLine.d}" fill="${PAPER}"/>
`, secretCss));

console.log(`readme/hero.svg ${cells.length} cells`);
console.log('readme/secret.svg');
