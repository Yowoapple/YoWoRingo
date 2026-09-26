import { lenis } from '../main.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createPixelHero } from '../modules/pixel-hero.js';
import { createPlayground } from '../modules/playground.js';
import { initIsland } from '../modules/island.js';
import { initGate } from '../modules/gate.js';
import { initTweaks } from '../modules/tweaks.js';
import { initPalette } from '../modules/palette.js';
import { initTabs } from '../modules/tabs.js';
import { initStory } from '../modules/story.js';
import { initWorksPreview } from '../modules/works-preview.js';
import { toast } from '../modules/toast.js';
import { audio } from '../modules/audio.js';
import { music } from '../modules/music.js';
import { perfTier, reducedMotion, coarsePointer, asset } from '../utils/device.js';

const env = import.meta.env;
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

const withSound = await initGate(heroReady);
const hero = await heroReady;

document.documentElement.classList.remove('is-gated');
lenis?.start();
hero.play();
if (withSound) {
  music.play();
  audio.sweep(true);
}

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
    scrollTrigger: { trigger: line, start: 'top 90%' }
  });
});

gsap.from('.name__term, .name__op', {
  y: 40,
  opacity: 0,
  duration: 1,
  ease: 'expo.out',
  stagger: 0.09,
  scrollTrigger: { trigger: '[data-name-eq]', start: 'top 80%' }
});

gsap.utils.toArray('.chapter__body, .chapter__tags, .chapter__link, .note, .work').forEach(el => {
  gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
});

initStory(document.querySelector('.story'));
initWorksPreview(document.querySelector('[data-works]'), document.querySelector('[data-works-preview]'));
document.querySelectorAll('[data-tabs]').forEach(initTabs);

async function copyEmail() {
  const email = env.VITE_EMAIL;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const t = document.createElement('textarea');
    t.value = email;
    t.setAttribute('readonly', '');
    t.style.position = 'fixed';
    t.style.opacity = '0';
    document.body.append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  toast(`${email} copied`, { type: 'success' });
  const hint = document.querySelector('.contact__email-hint');
  if (hint) {
    hint.textContent = 'Copied';
    setTimeout(() => (hint.textContent = 'Click to copy'), 2400);
  }
}

document.querySelector('[data-copy]')?.addEventListener('click', copyEmail);
document.querySelector('[data-resume]')?.addEventListener('click', () => toast('Resume is on its way. Email me for now.'));

const go = target => {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else window.scrollTo({ top: typeof target === 'number' ? target : document.querySelector(target).getBoundingClientRect().top + window.scrollY });
};
document.querySelector('[data-top]')?.addEventListener('click', e => {
  e.preventDefault();
  go(0);
});

function kuromi() {
  const root = document.documentElement;
  const on = root.dataset.mode !== 'kuromi';
  if (on) root.dataset.mode = 'kuromi';
  else delete root.dataset.mode;
  toast(on ? 'Kuromi mode. You found it.' : 'Back to ultramarine.', { type: on ? 'success' : 'info' });
}

island = initIsland();

initPalette(() => [
  { group: 'Navigate', title: 'Top', hint: '01', run: () => go(0) },
  { group: 'Navigate', title: 'Playground', hint: '02', run: () => go('#playground') },
  { group: 'Navigate', title: 'The Name', hint: '03', keywords: 'about yowo ringo apple', run: () => go('#about') },
  { group: 'Navigate', title: 'Story', hint: '04', keywords: 'minecraft scratch twerg vrchat galgame', run: () => go('#story') },
  { group: 'Navigate', title: 'Works', hint: '05', keywords: 'projects education', run: () => go('#works') },
  { group: 'Navigate', title: 'Off the Record', hint: '06', run: () => go('#off-the-record') },
  { group: 'Navigate', title: 'Contact', hint: '07', keywords: 'email hire', run: () => go('#contact') },
  { group: 'Pages', title: 'Focal Length', hint: 'Photography', run: () => (location.href = asset('photography/')) },
  { group: 'Pages', title: 'TWERG', hint: 'Work 01', run: () => (location.href = asset('works/twerg/')) },
  { group: 'Pages', title: 'Beyond the Point', hint: 'Work 02', keywords: 'plum intensity earthquake', run: () => (location.href = asset('works/plum/')) },
  { group: 'Pages', title: '100 Days', hint: 'Work 04', keywords: 'galgame unity', run: () => (location.href = asset('works/galgame/')) },
  { group: 'Actions', title: 'Copy email', hint: env.VITE_EMAIL, run: copyEmail },
  { group: 'Actions', title: music.playing ? 'Pause music' : 'Play music', hint: 'Player', run: () => music.toggle() },
  { group: 'Actions', title: audio.enabled ? 'Mute everything' : 'Turn sound on', hint: 'Sound', run: () => document.querySelector('[data-sound]').click() },
  { group: 'Actions', title: 'Switch language', hint: 'EN / 繁 / 简', run: () => document.querySelector('[data-lang]').click() },
  { group: 'Actions', title: 'Shake the playground', hint: 'Physics', run: () => { go('#playground'); setTimeout(() => playground.shake(), 1200); } },
  { group: 'Elsewhere', title: 'Instagram', hint: '@yowoapple', run: () => window.open(env.VITE_INSTAGRAM, '_blank', 'noopener') },
  { group: 'Elsewhere', title: 'X', hint: '@AppleJackOAO', run: () => window.open(env.VITE_X, '_blank', 'noopener') },
  { group: 'Elsewhere', title: 'GitHub', hint: 'Yowoapple', run: () => window.open(env.VITE_GITHUB, '_blank', 'noopener') },
  { group: 'Secret', title: 'Kuromi', hint: 'You found it', hidden: true, secret: 'kuromi', run: kuromi }
], { onOpen: () => lenis?.stop(), onClose: () => lenis?.start() });

ScrollTrigger.refresh();

initTweaks([
  { label: 'Pixel density', value: density, options: [{ label: 'Coarse', value: 40 }, { label: 'Normal', value: 56 }, { label: 'Fine', value: 72 }, { label: 'Ultra', value: 96 }], onChange: v => hero.setDensity(v) },
  { label: 'Pixel gap', value: true, options: [{ label: 'On', value: true }, { label: 'Off', value: false }], onChange: v => hero.setGap(v) },
  { label: 'Gravity', value: 1, options: [{ label: 'Moon', value: 0.35 }, { label: 'Earth', value: 1 }, { label: 'Heavy', value: 1.8 }], onChange: v => playground.setGravity(v) },
  { label: 'Playground', momentary: true, value: null, options: [{ label: 'Shake', value: 1 }], onChange: () => playground.shake() }
]);
