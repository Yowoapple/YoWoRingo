import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { audio } from './audio.js';

export function initStory(section) {
  const index = section.querySelector('[data-story-index]');
  const bar = section.querySelector('[data-story-bar]');
  const chapters = [...section.querySelectorAll('[data-chapter]')];

  chapters.forEach(chapter => {
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: self => {
        if (!self.isActive || index.textContent === chapter.dataset.chapter) return;
        index.textContent = chapter.dataset.chapter;
        index.classList.remove('is-rolling');
        void index.offsetWidth;
        index.classList.add('is-rolling');
        audio.tick(900, 0.035);
      }
    });
  });

  ScrollTrigger.create({
    trigger: section.querySelector('.story__list'),
    start: 'top 60%',
    end: 'bottom 60%',
    onUpdate: self => (bar.style.transform = `scaleX(${self.progress})`)
  });
}
