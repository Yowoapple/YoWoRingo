import '../../css/pages/work.css';
import '../../css/pages/plum.css';
import '../main.js';
import { initSite } from '../site.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initReveals } from '../modules/work-common.js';
import { audio } from '../modules/audio.js';
import { asset } from '../utils/device.js';
import { t as tr, onLang } from '../modules/i18n.js';

const COLORS = ['#f4f9ff', '#f2f2ff', '#00aaff', '#0041ff', '#fae696', '#ffe600', '#ff9900', '#ff2800', '#a50021', '#b40068'];
const LABELS = ['0', '1', '2', '3', '4', '5−', '5+', '6−', '6+', '7'];
const DATA_AT = 11;
const LOCK_AT = 30;
const VS = 3.5;
const NS = 'http://www.w3.org/2000/svg';

initReveals();

const data = (await import('../../data/plum.json')).default;
const stage = document.querySelector('[data-stage]');
const [, , VW, VH] = data.viewBox;

function layer(cls) {
  return `<g class="${cls}">${data.towns.map((t, i) => `<path d="${t.d}" data-i="${i}"/>`).join('')}</g>`;
}

stage.innerHTML = `
  <svg class="p-svg" viewBox="${data.viewBox.join(' ')}" role="img" aria-label="Map of Taiwan colored by estimated intensity">
    <defs><clipPath id="v2clip"><rect data-clip x="${VW / 2}" y="0" width="${VW / 2}" height="${VH}"/></clipPath></defs>
    ${layer('p-towns p-towns--v1')}
    <g clip-path="url(#v2clip)">${layer('p-towns p-towns--v2')}</g>
    <path class="p-borders" d="${data.borders}"/>
    <path class="p-coast" d="${data.coast}"/>
    <circle class="p-wave" data-wave r="0"/>
    <line class="p-arrow" data-arrow/>
    <g data-cities></g>
    <g class="p-epi" data-epi><circle r="14" class="p-epi__ring"/><circle r="5.5"/></g>
    <line class="p-divider" data-divider x1="${VW / 2}" x2="${VW / 2}" y1="0" y2="${VH}"/>
  </svg>`;

const v1Paths = [...stage.querySelectorAll('.p-towns--v1 path')];
const v2Paths = [...stage.querySelectorAll('.p-towns--v2 path')];
const clip = stage.querySelector('[data-clip]');
const divider = stage.querySelector('[data-divider]');
const wave = stage.querySelector('[data-wave]');
const arrow = stage.querySelector('[data-arrow]');
const epi = stage.querySelector('[data-epi]');
const citiesG = stage.querySelector('[data-cities]');
const handle = document.querySelector('[data-handle]');
const timeInput = document.querySelector('[data-demo-time]');
const clock = document.querySelector('[data-demo-clock]');
const phase = document.querySelector('[data-phase]');
const playBtn = document.querySelector('[data-demo-play]');
const chart = document.querySelector('[data-chart]');
const stat = document.querySelector('[data-stat]');

document.querySelector('[data-legend]').innerHTML = LABELS.slice(1).map((l, i) => `<span><i style="background:${COLORS[i + 1]}"></i>${l}</span>`).join('');

let ev = 0;
let t = 0;
let split = 0.5;
let playing = false;
let raf = 0;
let lastFrac = -1;

const frac = s => Math.min(1, Math.max(0, (s - DATA_AT) / (LOCK_AT - DATA_AT)));
const v2At = (i, f) => {
  const tw = data.towns[i];
  return tw.v1[ev] + Math.round((tw.v2[ev] - tw.v1[ev]) * f);
};

function paintV1() {
  v1Paths.forEach((p, i) => p.setAttribute('fill', COLORS[data.towns[i].v1[ev]]));
}

function paintV2(f) {
  v2Paths.forEach((p, i) => p.setAttribute('fill', COLORS[v2At(i, f)]));
}

function chartHTML(e, f) {
  const H = 9;
  const bar = (v, cls) => `<span class="p-bar ${cls}" style="--h:${v / H}"><em>${LABELS[v]}</em></span>`;
  return `
    <div class="p-chart__head"><span class="label">${tr('Key cities')}</span><span class="p-chart__keys"><i class="k-obs"></i>${tr('Observed')}<i class="k-v1"></i>${tr('Point')}<i class="k-v2"></i>${tr('Direction')}</span></div>
    <div class="p-chart__grid">${e.cities.map(c => {
      const v2 = c.v1 + Math.round((c.v2 - c.v1) * f);
      return `<div class="p-chart__col"><div class="p-chart__bars">${bar(c.obs, 'is-obs')}${bar(c.v1, 'is-v1')}${bar(v2, 'is-v2')}</div><span class="p-chart__name">${tr(c.name)}</span></div>`;
    }).join('')}</div>`;
}

function render() {
  const e = data.events[ev];
  const f = frac(t);
  if (f !== lastFrac) {
    paintV2(f);
    chart.innerHTML = chartHTML(e, f);
    if (lastFrac < 1 && f === 1) audio.chime();
    lastFrac = f;
  }
  wave.setAttribute('r', (t * VS * e.kmPx).toFixed(1));
  arrow.style.opacity = f;
  clock.textContent = `T + ${t.toFixed(1)} s`;
  timeInput.value = String(Math.round(t * 10));
  timeInput.style.setProperty('--p', `${(t / 60) * 100}%`);
  phase.textContent = t < DATA_AT
    ? tr('First warning is out. Only the point source is known.')
    : f < 1
      ? tr('Station data arriving. The direction is being estimated.')
      : tr('Direction locked at {deg}°. Intensity ahead of the rupture is raised.').replace('{deg}', e.forwardAz);
  phase.classList.toggle('is-locked', f === 1);
}

function selectEvent(i) {
  ev = i;
  const e = data.events[ev];
  lastFrac = -1;
  paintV1();
  epi.setAttribute('transform', `translate(${e.epi[0]} ${e.epi[1]})`);
  wave.setAttribute('cx', e.epi[0]);
  wave.setAttribute('cy', e.epi[1]);
  arrow.setAttribute('x1', e.epi[0]);
  arrow.setAttribute('y1', e.epi[1]);
  arrow.setAttribute('x2', e.arrow[0]);
  arrow.setAttribute('y2', e.arrow[1]);
  citiesG.innerHTML = e.cities.map(c => {
    const east = c.x > VW * 0.72;
    return `<g transform="translate(${c.x} ${c.y})"><circle r="3.5"/><text x="${east ? -8 : 8}" y="4" text-anchor="${east ? 'end' : 'start'}">${tr(c.name)}</text></g>`;
  }).join('');
  document.querySelector('[data-event-info]').innerHTML = `
    <span class="label">${e.date}</span>
    <strong>${tr(e.label)} M${e.mag.toFixed(1)}</strong>
    <span class="p-event__meta">${tr('First warning estimate: M{mag}, {depth} km deep').replace('{mag}', e.eewMag.toFixed(1)).replace('{depth}', e.depth)}</span>`;
  const s1 = e.stats.v1, s2 = e.stats.v2;
  stat.textContent = tr('Retrospective, {n} key cities. Strong-shaking misses {a} to {b}. Mean error {c} to {d} intensity levels.')
    .replace('{n}', e.cities.length)
    .replace('{a}', `${s1.missed}/${s1.strong}`)
    .replace('{b}', `${s2.missed}/${s2.strong}`)
    .replace('{c}', s1.mae.toFixed(2))
    .replace('{d}', s2.mae.toFixed(2));
  render();
}

const tablist = document.querySelector('[data-events] [role="tablist"]');
const tabLabels = () => tablist.querySelectorAll('[data-ev]').forEach(b => (b.firstChild.nodeValue = tr(data.events[Number(b.dataset.ev)].label)));
tablist.innerHTML = data.events.map((e, i) => `<button class="tabs__tab" role="tab" type="button" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-ev="${i}">${e.label}<small>${e.date.slice(0, 4)}</small></button>`).join('');
onLang(() => {
  tabLabels();
  selectEvent(ev);
});
tablist.addEventListener('click', e => {
  const b = e.target.closest('[data-ev]');
  if (!b) return;
  tablist.querySelectorAll('[role="tab"]').forEach(x => {
    x.setAttribute('aria-selected', String(x === b));
    x.tabIndex = x === b ? 0 : -1;
  });
  selectEvent(Number(b.dataset.ev));
  audio.tick(1700, 0.04);
});

function setSplit(s) {
  split = Math.min(0.95, Math.max(0.05, s));
  const x = VW * split;
  clip.setAttribute('x', x);
  clip.setAttribute('width', VW - x);
  divider.setAttribute('x1', x);
  divider.setAttribute('x2', x);
  handle.style.left = `${split * 100}%`;
}

let dragging = false;
const toSplit = e => {
  const r = stage.getBoundingClientRect();
  return (e.clientX - r.left) / r.width;
};
handle.addEventListener('pointerdown', e => {
  dragging = true;
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove', e => dragging && setSplit(toSplit(e)));
handle.addEventListener('pointerup', () => (dragging = false));
handle.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') setSplit(split - 0.05);
  if (e.key === 'ArrowRight') setSplit(split + 0.05);
});
stage.addEventListener('click', e => setSplit(toSplit(e)));

function loop(now) {
  if (!playing) return;
  const dt = Math.min(0.1, (now - (loop.last || now)) / 1000);
  loop.last = now;
  t = Math.min(60, t + dt * 4);
  render();
  if (t >= 60) return stop();
  raf = requestAnimationFrame(loop);
}

function play() {
  if (t >= 60) t = 0;
  playing = true;
  loop.last = 0;
  playBtn.setAttribute('aria-pressed', 'true');
  raf = requestAnimationFrame(loop);
}

function stop() {
  playing = false;
  cancelAnimationFrame(raf);
  playBtn.setAttribute('aria-pressed', 'false');
}

playBtn.addEventListener('click', () => (playing ? stop() : play()));
timeInput.addEventListener('input', () => {
  stop();
  t = Number(timeInput.value) / 10;
  render();
});

ScrollTrigger.create({
  trigger: '.p-demo',
  start: 'top 40%',
  once: true,
  onEnter: () => !playing && t === 0 && play()
});

const video = document.querySelector('[data-video]');
document.querySelector('[data-video-cover]').addEventListener('click', e => {
  video.src = asset('video/plum.mp4');
  video.play().catch(() => {});
  e.currentTarget.remove();
});

setSplit(0.5);
selectEvent(0);
initSite();
ScrollTrigger.refresh();
