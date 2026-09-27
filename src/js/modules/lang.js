import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLang } from './i18n.js';
import { reducedMotion } from '../utils/device.js';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh-Hant', label: '繁' },
  { code: 'zh-Hans', label: '简' }
];
const IGNORE = '.nav, .island, .lens, .finder, .finder-readout, .toasts, .palette, .tweaks, .lightbox, [data-gate]';
const BLOCKS = 'p, h1, h2, h3, li, figure, dt, dd, blockquote, article, .shot, .w-card, .pg-card, section';

let index = 0;
let btn = null;
let label = null;
let scrollBy = dy => window.scrollBy(0, dy);
let busy = false;

function detect() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && LANGS.some(l => l.code === saved)) return saved;
  } catch {}
  const nav = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  if (nav.startsWith('zh')) return /hans|cn|sg|my/.test(nav) ? 'zh-Hans' : 'zh-Hant';
  return 'en';
}

function paint() {
  const lang = LANGS[index];
  if (label) label.textContent = lang.label;
  btn?.setAttribute('aria-label', `Language: ${lang.code}`);
  document.documentElement.dataset.locale = lang.code;
}

function captureAnchor() {
  const x = window.innerWidth / 2;
  for (const y of [0.35, 0.5, 0.2, 0.65].map(f => window.innerHeight * f)) {
    const hit = document.elementsFromPoint(x, y).find(el => !el.closest(IGNORE) && el !== document.body && el !== document.documentElement);
    const block = hit?.closest(BLOCKS);
    if (block) return { el: block, top: block.getBoundingClientRect().top };
  }
  return null;
}

function restoreAnchor(anchor) {
  if (!anchor || !anchor.el.isConnected) return;
  const dy = anchor.el.getBoundingClientRect().top - anchor.top;
  if (Math.abs(dy) > 0.5) scrollBy(dy);
}

async function apply(save) {
  if (busy) return;
  busy = true;
  const lang = LANGS[index];
  if (save) {
    try {
      localStorage.setItem('lang', lang.code);
    } catch {}
  }
  const anchor = captureAnchor();
  const update = async () => {
    paint();
    await setLang(lang.code);
    await document.fonts.ready;
    ScrollTrigger.refresh();
    restoreAnchor(anchor);
    ScrollTrigger.update();
  };
  const root = document.documentElement;
  if (document.startViewTransition && !reducedMotion()) {
    root.classList.add('is-lang-switch');
    const vt = document.startViewTransition(update);
    await vt.finished.catch(() => {});
    root.classList.remove('is-lang-switch');
  } else {
    await update();
  }
  busy = false;
}

export function initLang(options = {}) {
  if (options.scrollBy) scrollBy = options.scrollBy;
  btn = document.querySelector('button[data-lang]');
  label = btn?.querySelector('[data-lang-label]');
  index = Math.max(0, LANGS.findIndex(l => l.code === detect()));
  paint();
  btn?.addEventListener('click', () => {
    if (busy) return;
    index = (index + 1) % LANGS.length;
    btn.classList.remove('is-spinning');
    void btn.offsetWidth;
    btn.classList.add('is-spinning');
    apply(true);
  });
}

export function applyInitialLang() {
  if (LANGS[index].code === 'en') return Promise.resolve();
  const lang = LANGS[index];
  paint();
  return setLang(lang.code).then(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
}
