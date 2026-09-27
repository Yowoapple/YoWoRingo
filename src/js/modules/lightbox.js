import { asset } from '../utils/device.js';
import { audio } from './audio.js';
import { t } from './i18n.js';

export function createLightbox(photos, { onOpen, onClose } = {}) {
  const root = document.createElement('div');
  root.className = 'lightbox';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', 'Photo viewer');
  root.setAttribute('data-lenis-prevent', '');
  root.setAttribute('data-no-i18n', '');
  root.innerHTML = `
    <div class="lightbox__bg" data-bg></div>
    <figure class="lightbox__stage" data-stage>
      <picture data-pic><source type="image/avif"><img alt="" decoding="async"></picture>
    </figure>
    <aside class="lightbox__info">
      <span class="label" data-count></span>
      <strong class="lightbox__focal" data-focal></strong>
      <dl class="lightbox__spec" data-spec></dl>
    </aside>
    <button class="lightbox__btn lightbox__btn--close" type="button" data-close aria-label="Close">Close</button>
    <button class="lightbox__btn lightbox__btn--prev" type="button" data-prev aria-label="Previous photo"><span aria-hidden="true"></span></button>
    <button class="lightbox__btn lightbox__btn--next" type="button" data-next aria-label="Next photo"><span aria-hidden="true"></span></button>`;
  document.body.append(root);

  const img = root.querySelector('img');
  const source = root.querySelector('source');
  const bg = root.querySelector('[data-bg]');
  const stage = root.querySelector('[data-stage]');
  let index = 0;
  let lastFocus = null;
  let startX = null;

  const url = (p, w, ext) => asset(`photos/${p.id}-${w}.${ext}`);

  function render(dir = 0) {
    const p = photos[index];
    const set = ext => p.sizes.map(w => `${url(p, w, ext)} ${w}w`).join(', ');
    stage.style.setProperty('--ratio', p.ratio);
    stage.style.backgroundImage = `url(${p.lqip})`;
    img.classList.remove('is-loaded');
    source.srcset = set('avif');
    img.srcset = set('webp');
    img.sizes = '(max-width: 900px) 100vw, 80vw';
    img.src = url(p, p.sizes.at(-1), 'webp');
    img.alt = t('Photograph at {f} mm').replace('{f}', p.focal);
    img.onload = () => img.classList.add('is-loaded');
    bg.style.background = p.color;
    root.querySelector('[data-count]').textContent = `${String(index + 1).padStart(2, '0')} / ${photos.length}`;
    root.querySelector('[data-focal]').textContent = `${p.focal} mm`;
    const rows = [['Aperture', p.aperture], ['Shutter', p.shutter], ['ISO', p.iso], ['Camera', p.camera]];
    if (p.date) rows.push(['Date', p.date.replaceAll('-', '.')]);
    root.querySelector('[data-spec]').innerHTML = rows.map(([k, v]) => `<div><dt class="label">${t(k)}</dt><dd>${v}</dd></div>`).join('');
    if (dir) stage.animate([{ transform: `translateX(${dir * 40}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    [photos[index + 1], photos[index - 1]].forEach(n => {
      if (!n) return;
      const pre = new Image();
      pre.src = url(n, n.sizes[Math.min(1, n.sizes.length - 1)], 'webp');
    });
  }

  function open(i) {
    index = i;
    lastFocus = document.activeElement;
    render();
    root.querySelector('[data-close]').textContent = t('Close');
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('is-open'));
    root.querySelector('[data-close]').focus({ preventScroll: true });
    document.documentElement.classList.add('is-locked');
    audio.shutter();
    onOpen?.();
  }

  function close() {
    if (root.hidden) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => (root.hidden = true), 300);
    lastFocus?.focus?.({ preventScroll: true });
    onClose?.();
  }

  function step(d) {
    index = (index + d + photos.length) % photos.length;
    render(d);
    audio.tick(d > 0 ? 1900 : 1500, 0.04);
  }

  root.querySelector('[data-close]').addEventListener('click', close);
  root.querySelector('[data-prev]').addEventListener('click', () => step(-1));
  root.querySelector('[data-next]').addEventListener('click', () => step(1));
  bg.addEventListener('click', close);
  window.addEventListener('keydown', e => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  });
  stage.addEventListener('pointerdown', e => (startX = e.clientX));
  stage.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });

  return { open, close };
}
