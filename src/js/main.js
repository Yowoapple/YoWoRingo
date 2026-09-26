import '../css/main.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { audio } from './modules/audio.js';
import { initLang } from './modules/lang.js';
import { reducedMotion } from './utils/device.js';

gsap.registerPlugin(ScrollTrigger);
document.documentElement.classList.add('js');

export const lenis = reducedMotion() ? null : new Lenis({ lerp: 0.1, smoothWheel: true });

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

const soundBtn = document.querySelector('[data-sound]');
soundBtn?.addEventListener('click', () => {
  const on = audio.toggle();
  soundBtn.setAttribute('aria-pressed', String(on));
});

initLang();
