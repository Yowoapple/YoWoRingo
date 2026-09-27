import { lenis } from './main.js';
import { initIsland } from './modules/island.js';
import { initPalette } from './modules/palette.js';
import { toast } from './modules/toast.js';
import { audio } from './modules/audio.js';
import { music } from './modules/music.js';
import { asset } from './utils/device.js';

const env = import.meta.env;

export async function copyEmail() {
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

export function go(target) {
  if (lenis) return lenis.scrollTo(target, { duration: 1.6 });
  const top = typeof target === 'number' ? target : document.querySelector(target).getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top });
}

function kuromi() {
  const root = document.documentElement;
  const on = root.dataset.mode !== 'kuromi';
  if (on) root.dataset.mode = 'kuromi';
  else delete root.dataset.mode;
  try {
    sessionStorage.setItem('mode', on ? 'kuromi' : '');
  } catch {}
  toast(on ? 'Kuromi mode. You found it.' : 'Back to ultramarine.', { type: on ? 'success' : 'info' });
}

function restorePreferences() {
  try {
    if (sessionStorage.getItem('mode') === 'kuromi') document.documentElement.dataset.mode = 'kuromi';
    if (sessionStorage.getItem('sound') === 'on') {
      const resume = () => {
        audio.enable();
        window.removeEventListener('pointerdown', resume);
        window.removeEventListener('keydown', resume);
      };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    }
  } catch {}
}

export function initSite({ home = false, commands = [] } = {}) {
  restorePreferences();
  const island = initIsland();
  const nav = hash => (home ? go(hash || 0) : (location.href = asset('') + (hash || '')));
  const page = path => () => (location.href = asset(path));

  document.querySelectorAll('[data-top]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    go(0);
  }));
  document.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', copyEmail));

  initPalette(() => [
    ...commands,
    { group: 'Home', title: 'Top', hint: '01', run: () => nav('') },
    { group: 'Home', title: 'Playground', hint: '02', run: () => nav('#playground') },
    { group: 'Home', title: 'The Name', hint: '03', keywords: 'about yowo ringo apple', run: () => nav('#about') },
    { group: 'Home', title: 'Story', hint: '04', keywords: 'minecraft scratch twerg vrchat galgame', run: () => nav('#story') },
    { group: 'Home', title: 'Works', hint: '05', keywords: 'projects education', run: () => nav('#works') },
    { group: 'Home', title: 'Off the Record', hint: '06', run: () => nav('#off-the-record') },
    { group: 'Home', title: 'Contact', hint: '07', keywords: 'email hire', run: () => nav('#contact') },
    { group: 'Pages', title: 'Focal Length', hint: 'Photography', run: page('photography/') },
    { group: 'Pages', title: 'TWERG', hint: 'Work 01', keywords: 'earthquake dyfi rain typhoon', run: page('works/twerg/') },
    { group: 'Pages', title: 'Beyond the Point', hint: 'Work 02', keywords: 'plum intensity earthquake directivity', run: page('works/plum/') },
    { group: 'Pages', title: '100 Days', hint: 'Work 04', keywords: 'galgame unity', run: page('works/galgame/') },
    { group: 'Actions', title: 'Copy email', hint: env.VITE_EMAIL, run: copyEmail },
    { group: 'Actions', title: music.playing ? 'Pause music' : 'Play music', hint: 'Player', run: () => music.toggle() },
    { group: 'Actions', title: audio.enabled ? 'Mute everything' : 'Turn sound on', hint: 'Sound', run: () => document.querySelector('[data-sound]').click() },
    { group: 'Actions', title: 'Switch language', hint: 'EN / 繁 / 简', run: () => document.querySelector('[data-lang]').click() },
    { group: 'Elsewhere', title: 'Instagram', hint: '@yowoapple', run: () => window.open(env.VITE_INSTAGRAM, '_blank', 'noopener') },
    { group: 'Elsewhere', title: 'X', hint: '@AppleJackOAO', run: () => window.open(env.VITE_X, '_blank', 'noopener') },
    { group: 'Elsewhere', title: 'GitHub', hint: 'Yowoapple', run: () => window.open(env.VITE_GITHUB, '_blank', 'noopener') },
    { group: 'Secret', title: 'Kuromi', hint: 'You found it', hidden: true, secret: 'kuromi', run: kuromi }
  ], { onOpen: () => lenis?.stop(), onClose: () => lenis?.start() });

  return { island };
}
