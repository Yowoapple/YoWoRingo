const mq = query => window.matchMedia(query).matches;

export const reducedMotion = () => mq('(prefers-reduced-motion: reduce)');
export const coarsePointer = () => mq('(pointer: coarse)');

export function perfTier() {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const narrow = window.innerWidth < 768;
  if (cores <= 4 || memory <= 2) return 'low';
  if (narrow || coarsePointer()) return 'mid';
  return 'high';
}

export const dpr = () => Math.min(window.devicePixelRatio || 1, 2);

export const asset = path => `${import.meta.env.BASE_URL}${path}`;

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOutExpo = t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
