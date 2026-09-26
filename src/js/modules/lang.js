const LANGS = [
  { code: 'en', label: 'EN', html: 'en' },
  { code: 'zh-Hant', label: '繁', html: 'zh-Hant' },
  { code: 'zh-Hans', label: '简', html: 'zh-Hans' }
];

function detect() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved && LANGS.some(l => l.code === saved)) return saved;
  } catch {}
  const nav = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  if (nav.startsWith('zh')) return /hans|cn|sg|my/.test(nav) ? 'zh-Hans' : 'zh-Hant';
  return 'en';
}

export function initLang(onChange) {
  const btn = document.querySelector('[data-lang]');
  if (!btn) return;
  const label = btn.querySelector('[data-lang-label]');
  let index = LANGS.findIndex(l => l.code === detect());

  const apply = () => {
    const lang = LANGS[index];
    label.textContent = lang.label;
    document.documentElement.dataset.lang = lang.code;
    btn.setAttribute('aria-label', `Language: ${lang.code}`);
    try {
      localStorage.setItem('lang', lang.code);
    } catch {}
    onChange?.(lang.code);
  };

  btn.addEventListener('click', () => {
    index = (index + 1) % LANGS.length;
    btn.classList.remove('is-spinning');
    void btn.offsetWidth;
    btn.classList.add('is-spinning');
    apply();
  });
  apply();
}
