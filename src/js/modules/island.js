import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function initIsland() {
  const island = document.querySelector('[data-island-el]');
  if (!island) return;
  const label = island.querySelector('[data-island-label]');
  let current = label.textContent;

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

  return { set, pulse: () => island.animate([{ transform: 'translateX(-50%) scale(1)' }, { transform: 'translateX(-50%) scale(1.06)' }, { transform: 'translateX(-50%) scale(1)' }], { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }) };
}
