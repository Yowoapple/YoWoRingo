import { setLang } from './i18n.js';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'zh-Hant', label: '繁' },
  { code: 'zh-Hans', label: '简' }
];

let index = 0;
let btn = null;
let label = null;

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

async function apply(save) {
  const lang = LANGS[index];
  paint();
  if (save) {
    try {
      localStorage.setItem('lang', lang.code);
    } catch {}
  }
  await setLang(lang.code);
}

export function initLang() {
  btn = document.querySelector('button[data-lang]');
  label = btn?.querySelector('[data-lang-label]');
  index = Math.max(0, LANGS.findIndex(l => l.code === detect()));
  paint();
  btn?.addEventListener('click', () => {
    index = (index + 1) % LANGS.length;
    btn.classList.remove('is-spinning');
    void btn.offsetWidth;
    btn.classList.add('is-spinning');
    apply(true);
  });
}

export function applyInitialLang() {
  if (LANGS[index].code !== 'en') return apply(false);
  return Promise.resolve();
}
