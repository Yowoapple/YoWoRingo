import '../../css/pages/work.css';
import '../../css/pages/galgame.css';
import '../main.js';
import { initSite } from '../site.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initReveals } from '../modules/work-common.js';
import { audio } from '../modules/audio.js';
import { reducedMotion } from '../utils/device.js';

const hero = document.querySelector('[data-g-hero]');
const dayEl = document.querySelector('[data-day]');
const ticksEl = document.querySelector('[data-ticks]');
ticksEl.innerHTML = '<i></i>'.repeat(100);
const ticks = [...ticksEl.children];
let day = 0;

function setDay(d) {
  if (d === day) return;
  day = d;
  dayEl.textContent = String(d).padStart(3, '0');
  ticks.forEach((t, i) => {
    t.classList.toggle('is-past', i < d - 1);
    t.classList.toggle('is-today', i === d - 1);
  });
  hero.style.setProperty('--dark', ((d - 1) / 99).toFixed(3));
  if (d % 10 === 0) audio.tick(400 + d * 4, 0.03);
}

setDay(1);

if (!reducedMotion()) {
  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=200%',
    pin: true,
    scrub: true,
    onUpdate: self => setDay(1 + Math.round(self.progress * 99))
  });
} else {
  setDay(100);
}

initReveals();
initSite();
ScrollTrigger.refresh();
