import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { music } from './music.js';
import { audio } from './audio.js';
import { setIslandHandler } from './toast.js';
import { t, onLang } from './i18n.js';

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function initIsland() {
  const island = document.querySelector('[data-island-el]');
  if (!island) return null;
  const views = Object.fromEntries([...island.querySelectorAll('[data-view]')].map(v => [v.dataset.view, v]));
  const label = island.querySelector('[data-island-label]');
  const toggleBtn = island.querySelector('[data-island-toggle]');
  const noticeText = island.querySelector('[data-notice-text]');
  const playBtn = island.querySelector('[data-play]');
  const scrub = island.querySelector('[data-scrub]');
  const time = island.querySelector('[data-time]');
  const volume = island.querySelector('[data-volume]');
  const sfx = island.querySelector('[data-sfx]');
  island.querySelector('[data-duration]').textContent = fmt(music.duration);

  let state = 'compact';
  let current = label.textContent;
  let noticeTimer = 0;
  let raf = 0;
  let scrubbing = false;

  function fit(animate = true) {
    const view = views[state];
    const w = view.offsetWidth;
    const h = view.offsetHeight;
    if (!animate) island.classList.add('is-instant');
    island.style.width = `${w}px`;
    island.style.height = `${h}px`;
    island.style.borderRadius = state === 'player' ? '30px' : `${h / 2}px`;
    if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => island.classList.remove('is-instant')));
  }

  function show(next) {
    if (next === state) return fit();
    views[state].classList.remove('is-active');
    views[state].inert = true;
    state = next;
    views[state].classList.add('is-active');
    views[state].inert = false;
    island.dataset.state = state;
    fit();
  }

  function squish() {
    island.animate([{ scale: '1' }, { scale: '1.08 0.86' }, { scale: '1' }], { duration: 520, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' });
  }

  function set(text) {
    if (text === current) return;
    current = text;
    island.classList.add('is-switching');
    if (state === 'compact') squish();
    setTimeout(() => {
      label.textContent = t(text);
      island.classList.remove('is-switching');
      if (state === 'compact') fit();
    }, 160);
  }

  document.querySelectorAll('[data-island]:not(body)').forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => self.isActive && set(section.dataset.island)
    });
  });

  function notify(message, type = 'info') {
    if (state === 'player') return false;
    clearTimeout(noticeTimer);
    views.notice.classList.toggle('is-success', type === 'success');
    noticeText.textContent = message;
    if (state === 'notice') {
      views.notice.classList.remove('is-active');
      void views.notice.offsetWidth;
      views.notice.classList.add('is-active');
      fit();
    } else show('notice');
    if (type === 'success') audio.chime();
    else audio.tick(1200, 0.04);
    noticeTimer = setTimeout(() => state === 'notice' && show('compact'), 2400);
    return true;
  }

  setIslandHandler(notify);

  const fill = (input, value) => input.style.setProperty('--p', `${value}%`);

  function paint() {
    const pos = music.position;
    if (!scrubbing) {
      scrub.value = String(Math.round((pos / music.duration) * 1000));
      fill(scrub, (pos / music.duration) * 100);
    }
    time.textContent = fmt(pos);
  }

  function loop() {
    paint();
    raf = music.playing && state === 'player' ? requestAnimationFrame(loop) : 0;
  }

  const ring = island.querySelector('[data-ring]');
  let ringTimer = 0;
  let ringLast = 0;

  function paintRing() {
    const p = music.position / music.duration;
    ring.classList.toggle('is-reset', p < ringLast);
    ringLast = p;
    ring.style.strokeDashoffset = String(100 - p * 100);
  }

  function sync() {
    clearInterval(ringTimer);
    paintRing();
    if (music.playing) ringTimer = setInterval(paintRing, 500);
    const was = island.classList.contains('is-playing');
    island.classList.toggle('is-playing', music.playing);
    playBtn.setAttribute('aria-label', music.playing ? 'Pause' : 'Play');
    playBtn.setAttribute('aria-pressed', String(music.playing));
    paint();
    if (!raf) loop();
    if (was !== music.playing && state === 'compact') requestAnimationFrame(() => fit());
  }

  function setOpen(open) {
    clearTimeout(noticeTimer);
    show(open ? 'player' : 'compact');
    toggleBtn.setAttribute('aria-expanded', String(open));
    audio.tick(open ? 1500 : 1100, 0.04);
    if (open) sync();
  }

  toggleBtn.addEventListener('click', () => setOpen(state !== 'player'));
  island.querySelector('[data-island-collapse]').addEventListener('click', () => setOpen(false));
  document.addEventListener('pointerdown', e => {
    if (state === 'player' && !island.contains(e.target)) setOpen(false);
  });
  window.addEventListener('keydown', e => e.key === 'Escape' && state === 'player' && setOpen(false));

  playBtn.addEventListener('click', () => music.toggle());
  scrub.addEventListener('input', () => {
    scrubbing = true;
    fill(scrub, scrub.value / 10);
    time.textContent = fmt((scrub.value / 1000) * music.duration);
  });
  scrub.addEventListener('change', () => {
    music.seek(scrub.value / 1000);
    scrubbing = false;
  });
  volume.addEventListener('input', () => {
    fill(volume, volume.value);
    audio.setMusicVolume((volume.value / 100) ** 2);
  });
  fill(volume, volume.value);
  sfx.addEventListener('change', () => {
    audio.setSfx(sfx.checked);
    if (sfx.checked) audio.tick(1800, 0.05);
  });

  Object.values(views).forEach(v => (v.inert = v !== views[state]));
  label.setAttribute('data-no-i18n', '');
  noticeText.setAttribute('data-no-i18n', '');
  onLang(() => {
    label.textContent = t(current);
    requestAnimationFrame(() => fit());
  });
  music.onChange(sync);
  sync();
  island.dataset.state = state;
  fit(false);
  document.fonts.ready.then(() => fit(false));
  window.addEventListener('resize', () => fit(false));

  return {
    set,
    notify,
    open: () => setOpen(true),
    pulse: squish
  };
}
