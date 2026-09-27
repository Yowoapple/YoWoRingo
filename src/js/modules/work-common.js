import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from '../utils/device.js';

export function initReveals() {
  gsap.utils.toArray('[data-split-lines] > span').forEach(line => {
    gsap.from(line, { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: line, start: 'top 92%' } });
  });
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, { y: 36, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
  });
}

export function initHScroll(viewport) {
  const track = viewport?.querySelector('[data-hscroll-track]');
  if (!track || reducedMotion()) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: viewport.closest('section'),
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true
      }
    });
  });
}

export function initCounters() {
  document.querySelectorAll('[data-count-to]').forEach(el => {
    const to = Number(el.dataset.countTo);
    const suffix = el.textContent.replace(/[\d,]/g, '');
    const state = { v: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(state, {
        v: to,
        duration: 1.8,
        ease: 'expo.out',
        onUpdate: () => (el.textContent = `${Math.round(state.v).toLocaleString('en-US')}${suffix}`)
      })
    });
  });
}
