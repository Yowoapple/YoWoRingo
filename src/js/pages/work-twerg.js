import '../../css/pages/work.css';
import '../main.js';
import { initSite } from '../site.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initReveals, initHScroll, initCounters } from '../modules/work-common.js';

document.querySelectorAll('.w-step, .w-timeline__list li, .w-origin__body, .w-refs').forEach(el => el.setAttribute('data-reveal', ''));

initHScroll(document.querySelector('[data-hscroll]'));
initReveals();
initCounters();

const flow = document.querySelector('.w-flow');
const nodes = [...flow.querySelectorAll('li')];
ScrollTrigger.create({
  trigger: flow,
  start: 'top 80%',
  end: 'top 30%',
  scrub: true,
  onUpdate: self => {
    flow.style.setProperty('--flow', self.progress.toFixed(3));
    nodes.forEach((n, i) => n.classList.toggle('is-on', self.progress >= i / (nodes.length - 1) - 0.001));
  }
});

initSite();
ScrollTrigger.refresh();
