import '../../css/pages/photography.css';
import { lenis } from '../main.js';
import { initSite, go } from '../site.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import photosData from '../../data/photos.gen.json';
import { createLightbox } from '../modules/lightbox.js';
import { audio } from '../modules/audio.js';
import { asset } from '../utils/device.js';

const fov = f => (2 * Math.atan(43.27 / (2 * f)) * 180) / Math.PI;
const NATIVE = new Set([23, 75, 120]);
const focals = [...new Set(photosData.map(p => p.focal))].sort((a, b) => a - b);
const byDate = (a, b) => (a.date || '9').localeCompare(b.date || '9') || a.id.localeCompare(b.id);
const photos = focals.flatMap(f => photosData.filter(p => p.focal === f).sort(byDate));
const logPos = f => (Math.log(f) - Math.log(focals[0])) / (Math.log(focals.at(-1)) - Math.log(focals[0]));

const url = (p, w, ext) => asset(`photos/${p.id}-${w}.${ext}`);
const srcset = (p, ext) => p.sizes.map(w => `${url(p, w, ext)} ${w}w`).join(', ');

function shotHTML(p, index, sizes) {
  const orient = p.ratio < 0.95 ? 'portrait' : p.ratio > 1.05 ? 'landscape' : 'square';
  const caption = `${p.focal}mm &nbsp; ${p.aperture} &nbsp; ${p.shutter} &nbsp; ISO${p.iso}`;
  return `
    <figure class="shot shot--${orient}" data-shot="${index}">
      <button class="shot__btn" type="button" aria-label="Open photo ${index + 1} of ${photos.length}, ${p.focal} mm">
        <span class="shot__frame" style="aspect-ratio:${p.width}/${p.height};background-color:${p.color};background-image:url(${p.lqip})">
          <picture>
            <source type="image/avif" srcset="${srcset(p, 'avif')}" sizes="${sizes}">
            <img src="${url(p, p.sizes[Math.min(1, p.sizes.length - 1)], 'webp')}" srcset="${srcset(p, 'webp')}" sizes="${sizes}" alt="Photograph at ${p.focal} mm" loading="lazy" decoding="async" width="${p.width}" height="${p.height}">
          </picture>
        </span>
      </button>
      <figcaption class="label shot__cap">${caption}</figcaption>
    </figure>`;
}

function groupHTML(f) {
  const list = photos.filter(p => p.focal === f);
  const solo = list.length === 1;
  const sizes = solo ? '(max-width: 900px) 100vw, 70vw' : '(max-width: 700px) 90vw, 45vw';
  return `
    <section class="fl-group${solo ? ' fl-group--solo' : ''}" id="mm-${f}" data-focal="${f}" data-island="${f} mm">
      <header class="fl-head">
        <p class="fl-head__num" data-num="${f}"><span>${f}</span><small>mm</small></p>
        <dl class="fl-head__meta">
          <div><dt class="label">Field of view</dt><dd>${fov(f).toFixed(1)}&deg;</dd></div>
          <div><dt class="label">Frames</dt><dd>${String(list.length).padStart(2, '0')}</dd></div>
          <div><dt class="label">Optics</dt><dd>${NATIVE.has(f) ? 'Native lens' : 'Sensor crop'}</dd></div>
        </dl>
      </header>
      <div class="fl-grid">${list.map(p => shotHTML(p, photos.indexOf(p), sizes)).join('')}</div>
    </section>`;
}

document.querySelector('[data-groups]').innerHTML = focals.map(groupHTML).join('');
document.querySelector('[data-stats]').innerHTML = [
  ['Frames', photos.length],
  ['Focal lengths', focals.length],
  ['Range', `${focals[0]}–${focals.at(-1)} mm`],
  ['Field of view', `${fov(focals[0]).toFixed(0)}° → ${fov(focals.at(-1)).toFixed(1)}°`]
].map(([k, v]) => `<div><dt class="label">${k}</dt><dd>${v}</dd></div>`).join('');

const lens = document.querySelector('[data-lens]');
lens.insertAdjacentHTML('beforeend', focals.map(f => `<button class="lens__tick" type="button" style="--pos:${logPos(f)}" data-go="${f}" aria-label="${f} mm"><span>${f}</span></button>`).join(''));
const needle = document.querySelector('[data-lens-needle]');
const readout = document.querySelector('[data-readout]');
const root = document.documentElement;
let current = null;

function setFocal(f) {
  if (f === current) return;
  current = f;
  const deg = fov(f);
  needle.style.setProperty('--pos', f ? logPos(f) : 0);
  root.style.setProperty('--finder', f ? `${(1 - deg / fov(focals[0])) * 16 + 2}vmin` : '2vmin');
  lens.querySelectorAll('.lens__tick').forEach(t => t.classList.toggle('is-active', Number(t.dataset.go) === f));
  readout.textContent = f ? `${f} mm / ${deg.toFixed(1)}° / ${photos.filter(p => p.focal === f).length} frames` : '';
  root.classList.toggle('has-focal', Boolean(f));
  if (f) audio.tick(700 + f * 2, 0.03);
}

lens.addEventListener('click', e => {
  const b = e.target.closest('[data-go]');
  if (b) go(`#mm-${b.dataset.go}`);
});

document.querySelectorAll('.fl-group').forEach(section => {
  const f = Number(section.dataset.focal);
  ScrollTrigger.create({
    trigger: section,
    start: 'top 55%',
    end: 'bottom 55%',
    onToggle: self => self.isActive && setFocal(f),
    onLeaveBack: () => f === focals[0] && setFocal(null)
  });
  const num = section.querySelector('.fl-head__num');
  gsap.from(num, { yPercent: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: section, start: 'top 80%' } });
});

gsap.set('.shot', { opacity: 0 });
ScrollTrigger.batch('.shot', {
  start: 'top 92%',
  once: true,
  onEnter: batch => gsap.fromTo(batch, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
});

document.querySelectorAll('.shot img').forEach(img => {
  if (img.complete) img.classList.add('is-loaded');
  else img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
});

gsap.utils.toArray('[data-split-lines] > span').forEach(line => {
  gsap.from(line, { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 92%' } });
});

const lightbox = createLightbox(photos, { onOpen: () => lenis?.stop(), onClose: () => lenis?.start() });
document.querySelector('[data-groups]').addEventListener('click', e => {
  const shot = e.target.closest('[data-shot]');
  if (shot) lightbox.open(Number(shot.dataset.shot));
});

initSite({
  commands: focals.map(f => ({ group: 'This page', title: `${f} mm`, hint: `${fov(f).toFixed(1)}°`, keywords: 'focal lens zoom', run: () => go(`#mm-${f}`) }))
});
ScrollTrigger.refresh();
