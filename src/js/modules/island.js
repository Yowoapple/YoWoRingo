import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { music } from './music.js';
import { audio } from './audio.js';

const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export function initIsland() {
  const island = document.querySelector('[data-island-el]');
  if (!island) return null;
  const label = island.querySelector('[data-island-label]');
  const toggleBtn = island.querySelector('[data-island-toggle]');
  const panel = island.querySelector('[data-island-panel]');
  const playBtn = island.querySelector('[data-play]');
  const scrub = island.querySelector('[data-scrub]');
  const time = island.querySelector('[data-time]');
  const volume = island.querySelector('[data-volume]');
  const sfx = island.querySelector('[data-sfx]');
  island.querySelector('[data-duration]').textContent = fmt(music.duration);
  let current = label.textContent;
  let raf = 0;
  let scrubbing = false;

  function set(text) {
    if (text === current) return;
    current = text;
    island.classList.add('is-switching');
    setTimeout(() => {
      label.textContent = text;
      island.classList.remove('is-switching');
    }, 180);
  }

  document.querySelectorAll('[data-island]').forEach(section => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: self => self.isActive && set(section.dataset.island)
    });
  });

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
    raf = music.playing && island.classList.contains('is-open') ? requestAnimationFrame(loop) : 0;
  }

  function sync() {
    island.classList.toggle('is-playing', music.playing);
    playBtn.setAttribute('aria-label', music.playing ? 'Pause' : 'Play');
    playBtn.setAttribute('aria-pressed', String(music.playing));
    paint();
    if (!raf) loop();
  }

  function setOpen(open) {
    island.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    audio.tick(open ? 1500 : 1100, 0.04);
    if (open) sync();
  }

  toggleBtn.addEventListener('click', () => setOpen(!island.classList.contains('is-open')));
  document.addEventListener('pointerdown', e => {
    if (island.classList.contains('is-open') && !island.contains(e.target)) setOpen(false);
  });
  window.addEventListener('keydown', e => e.key === 'Escape' && island.classList.contains('is-open') && setOpen(false));

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

  music.onChange(sync);

  return {
    set,
    open: () => setOpen(true),
    pulse: () => island.animate([{ scale: 1 }, { scale: 1.06 }, { scale: 1 }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' })
  };
}
