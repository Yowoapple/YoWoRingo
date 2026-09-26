import { gsap } from 'gsap';
import { coarsePointer, asset } from '../utils/device.js';
import { audio } from './audio.js';

export function initWorksPreview(list, preview) {
  if (coarsePointer()) return;
  const items = Object.fromEntries([...preview.querySelectorAll('[data-preview-item]')].map(el => [el.dataset.previewItem, el]));
  const xTo = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'expo.out' });
  const yTo = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'expo.out' });
  gsap.set(preview, { xPercent: -50, yPercent: -50 });
  let active = null;

  function show(key) {
    if (active === key) return;
    if (active) {
      items[active].classList.remove('is-active');
      items[active].querySelector('video')?.pause();
    }
    active = key;
    const el = items[key];
    el.classList.add('is-active');
    const video = el.querySelector('video');
    if (video) {
      if (!video.src) video.src = asset(video.dataset.src);
      video.play().catch(() => {});
    }
    preview.classList.add('is-visible');
    gsap.fromTo(preview, { scale: 0.85, rotate: -3 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'expo.out' });
    audio.tick(2400, 0.03);
  }

  function hide() {
    if (!active) return;
    items[active].querySelector('video')?.pause();
    items[active].classList.remove('is-active');
    active = null;
    preview.classList.remove('is-visible');
  }

  list.querySelectorAll('[data-preview]').forEach(row => {
    row.addEventListener('pointerenter', () => show(row.dataset.preview));
  });
  list.addEventListener('pointerleave', hide);
  list.addEventListener('pointermove', e => {
    xTo(e.clientX + 170);
    yTo(e.clientY);
  });
}
