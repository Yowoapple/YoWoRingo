import { audio } from './audio.js';

let stack = null;

const CHECK = '<svg class="check" viewBox="0 0 24 24" aria-hidden="true"><circle class="check__ring" cx="12" cy="12" r="10"/><path class="check__mark" d="M7 12.5l3.2 3.2L17 9"/></svg>';
const DOT = '<span class="toast__dot" aria-hidden="true"></span>';

export function toast(message, { type = 'info', duration = 2600 } = {}) {
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toasts';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.append(stack);
  }
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `${type === 'success' ? CHECK : DOT}<span class="toast__text"></span>`;
  el.querySelector('.toast__text').textContent = message;
  stack.append(el);
  if (type === 'success') audio.chime();
  else audio.tick(1200, 0.04);
  requestAnimationFrame(() => el.classList.add('is-in'));
  setTimeout(() => {
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), 500);
  }, duration);
}
