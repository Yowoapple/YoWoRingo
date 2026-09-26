let ctx = null;
let master = null;
let sfxBus = null;
let musicBus = null;
let enabled = false;
let sfxOn = true;
let lastKnock = 0;
const listeners = new Set();

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  sfxBus = ctx.createGain();
  sfxBus.connect(master);
  musicBus = ctx.createGain();
  musicBus.gain.value = 0.7;
  musicBus.connect(master);
  return ctx;
}

const emit = () => listeners.forEach(fn => fn(enabled));

function voice(type, freq, level, attack, decay, when, bus = sfxBus) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(level, when + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  o.connect(g).connect(bus);
  o.start(when);
  o.stop(when + attack + decay + 0.05);
  return o;
}

export const audio = {
  get enabled() {
    return enabled;
  },
  get context() {
    return ensure();
  },
  get musicBus() {
    ensure();
    return musicBus;
  },
  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  async enable() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') await ctx.resume();
    enabled = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.3);
    document.documentElement.dataset.sound = 'on';
    emit();
  },
  disable() {
    enabled = false;
    document.documentElement.dataset.sound = 'off';
    if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    }
    emit();
  },
  toggle() {
    const next = !enabled;
    if (next) this.enable();
    else this.disable();
    return next;
  },
  setMusicVolume(v) {
    ensure();
    musicBus.gain.setTargetAtTime(v, ctx.currentTime, 0.05);
  },
  setSfx(on) {
    sfxOn = on;
  },
  get sfx() {
    return sfxOn;
  },
  tick(freq = 1800, level = 0.06) {
    if (!enabled || !sfxOn || !ctx) return;
    const t = ctx.currentTime;
    const o = voice('square', freq, level, 0.002, 0.045, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.04);
  },
  chime() {
    if (!enabled || !sfxOn || !ctx) return;
    const t = ctx.currentTime;
    voice('sine', 1318.5, 0.08, 0.004, 0.35, t);
    voice('sine', 1975.5, 0.06, 0.004, 0.5, t + 0.07);
  },
  knock(intensity = 0.5) {
    if (!enabled || !sfxOn || !ctx) return;
    const now = performance.now();
    if (now - lastKnock < 28) return;
    lastKnock = now;
    const t = ctx.currentTime;
    const f = 90 + intensity * 140 + Math.random() * 30;
    const o = voice('sine', f * 1.8, 0.25 * intensity, 0.002, 0.18, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
  },
  sweep(up = true) {
    if (!enabled || !sfxOn || !ctx) return;
    const t = ctx.currentTime;
    const len = 0.6;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 6;
    bp.frequency.setValueAtTime(up ? 300 : 2400, t);
    bp.frequency.exponentialRampToValueAtTime(up ? 2400 : 300, t + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + len * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(bp).connect(g).connect(sfxBus);
    src.start(t);
  }
};
