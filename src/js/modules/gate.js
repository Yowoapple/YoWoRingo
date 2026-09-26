import { audio } from './audio.js';

export function initGate(ready) {
  const gate = document.querySelector('[data-gate]');
  const count = gate.querySelector('[data-gate-count]');
  const actions = gate.querySelector('[data-gate-actions]');
  let value = 0;
  let done = false;
  let doneAt = 0;
  let doneFrom = 0;
  let raf = 0;
  const start = performance.now();

  const tick = now => {
    if (!done) value = 88 * (1 - Math.exp(-(now - start) / 900));
    else value = Math.min(100, doneFrom + (100 - doneFrom) * Math.min(1, (now - doneAt) / 450));
    count.textContent = String(Math.floor(value)).padStart(3, '0');
    if (value < 100) raf = requestAnimationFrame(tick);
    else {
      gate.classList.add('is-ready');
      actions.hidden = false;
      actions.querySelector('button').focus({ preventScroll: true });
    }
  };
  raf = requestAnimationFrame(tick);
  const finish = () => {
    done = true;
    doneAt = performance.now();
    doneFrom = value;
  };
  ready.then(finish, finish);

  return new Promise(resolve => {
    actions.addEventListener('click', async e => {
      const btn = e.target.closest('[data-enter]');
      if (!btn) return;
      cancelAnimationFrame(raf);
      if (btn.dataset.enter === 'sound') await audio.enable();
      else audio.disable();
      gate.classList.add('is-leaving');
      setTimeout(() => gate.remove(), 900);
      resolve();
    });
  });
}
