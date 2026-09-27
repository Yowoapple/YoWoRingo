import { audio } from './audio.js';
import { store } from '../utils/store.js';

export async function initGate(ready) {
  const gate = document.querySelector('[data-gate]');
  if (store.get('entered')) {
    gate.remove();
    await ready.catch(() => {});
    return { skipped: true, sound: store.get('sound') === 'on' };
  }
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
      const sound = btn.dataset.enter === 'sound';
      if (sound) await audio.enable();
      else audio.disable();
      store.set('entered', '1');
      gate.classList.add('is-leaving');
      setTimeout(() => gate.remove(), 900);
      resolve({ skipped: false, sound });
    });
  });
}
