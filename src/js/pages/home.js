import { lenis } from '../main.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createPixelHero } from '../modules/pixel-hero.js';
import { createPlayground } from '../modules/playground.js';
import { initIsland } from '../modules/island.js';
import { initGate } from '../modules/gate.js';
import { initTweaks } from '../modules/tweaks.js';
import { audio } from '../modules/audio.js';
import { perfTier, reducedMotion, coarsePointer, asset } from '../utils/device.js';

const tier = perfTier();
const reduced = reducedMotion();
const density = { low: 40, mid: 56, high: 72 }[tier];

window.scrollTo(0, 0);
lenis?.stop();
document.documentElement.classList.add('is-gated');

const heroCanvas = document.querySelector('[data-hero-canvas]');
const heroReady = createPixelHero(heroCanvas, {
  sampleUrl: asset('img/portrait-sample.png'),
  photoUrl: asset('img/portrait-960.webp'),
  word: 'YoWoRingo',
  fontFamily: 'Schibsted Grotesk Variable',
  cols: density,
  reduced
});

const hero = await initGate(heroReady).then(() => heroReady);

document.documentElement.classList.remove('is-gated');
lenis?.start();
hero.play();
audio.sweep(true);

gsap.from('[data-hero-reveal]', { opacity: 0, y: 16, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 1.1 });

let swept = false;
let island = null;
const heroMeta = document.querySelector('.hero__meta');
ScrollTrigger.create({
  trigger: '.hero',
  start: 'top top',
  end: '+=150%',
  pin: true,
  scrub: reduced ? true : 0.6,
  onUpdate: self => {
    hero.setProgress(self.progress * 1.12);
    const fade = Math.min(1, self.progress * 4);
    heroMeta.style.opacity = String(1 - fade);
    heroMeta.style.transform = `translateY(${-24 * fade}px)`;
    if (!swept && self.progress > 0.04) {
      swept = true;
      audio.sweep(false);
      island?.pulse();
    }
    if (self.progress < 0.01) swept = false;
  }
});

island = initIsland();
ScrollTrigger.refresh();

window.addEventListener('pointermove', e => {
  if (window.scrollY > window.innerHeight * 0.2) return;
  hero.setPointer(e.clientX, e.clientY, true);
}, { passive: true });
document.documentElement.addEventListener('pointerleave', () => hero.setPointer(0, 0, false));
window.addEventListener('blur', () => hero.setPointer(0, 0, false));

const playground = createPlayground(document.querySelector('[data-stage]'));

const tiltBtn = document.querySelector('[data-tilt]');
if (tiltBtn && coarsePointer() && 'DeviceOrientationEvent' in window) {
  tiltBtn.hidden = false;
  tiltBtn.addEventListener('click', async () => {
    const ok = await playground.enableTilt();
    tiltBtn.textContent = ok ? 'Tilt on' : 'Tilt unavailable';
    tiltBtn.disabled = true;
  });
}
document.querySelector('[data-shake]')?.addEventListener('click', () => {
  playground.shake();
  audio.tick(900, 0.06);
});

gsap.utils.toArray('[data-split-lines] > span').forEach(line => {
  gsap.from(line, {
    yPercent: 110,
    duration: 1.1,
    ease: 'expo.out',
    scrollTrigger: { trigger: line, start: 'top 88%' }
  });
});

initTweaks([
  { label: 'Pixel density', value: density, options: [{ label: 'Coarse', value: 40 }, { label: 'Normal', value: 56 }, { label: 'Fine', value: 72 }, { label: 'Ultra', value: 96 }], onChange: v => hero.setDensity(v) },
  { label: 'Pixel gap', value: true, options: [{ label: 'On', value: true }, { label: 'Off', value: false }], onChange: v => hero.setGap(v) },
  { label: 'Gravity', value: 1, options: [{ label: 'Moon', value: 0.35 }, { label: 'Earth', value: 1 }, { label: 'Heavy', value: 1.8 }], onChange: v => playground.setGravity(v) },
  { label: 'Playground', momentary: true, value: null, options: [{ label: 'Shake', value: 1 }], onChange: () => playground.shake() }
]);
