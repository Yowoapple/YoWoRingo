import '../main.js';
import { initSite } from '../site.js';
import { reducedMotion } from '../utils/device.js';

const code = document.querySelector('[data-nf-code]');
const chars = '0123456789';
if (code && !reducedMotion()) {
  const target = code.textContent;
  let frame = 0;
  const tick = () => {
    frame++;
    code.textContent = [...target].map((c, i) => (frame > 10 + i * 6 ? c : chars[Math.floor(Math.random() * 10)])).join('');
    if (frame < 10 + target.length * 6) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

initSite();
