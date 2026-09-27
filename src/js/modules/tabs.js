import { audio } from './audio.js';
import { onLang } from './i18n.js';

export function initTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const ink = root.querySelector('.tabs__ink');

  function moveInk(tab) {
    ink.style.setProperty('--x', `${tab.offsetLeft}px`);
    ink.style.setProperty('--w', `${tab.offsetWidth}px`);
  }

  function select(tab, focus = false) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    moveInk(tab);
    if (focus) tab.focus();
    audio.tick(1700, 0.04);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

  const current = () => tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  new ResizeObserver(() => moveInk(current())).observe(root);
  document.fonts.ready.then(() => moveInk(current()));
  onLang(() => requestAnimationFrame(() => moveInk(current())));
}
