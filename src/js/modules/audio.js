let ctx = null;
let master = null;
let ambient = null;
let enabled = false;
let lastKnock = 0;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  return ctx;
}

function startAmbient() {
  if (ambient || !ctx) return;
  const out = ctx.createGain();
  out.gain.value = 0.05;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 520;
  filter.Q.value = 0.4;
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.05;
  lfoGain.gain.value = 240;
  lfo.connect(lfoGain).connect(filter.frequency);
  const voices = [55, 82.41, 110.3, 164.8].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i % 2 ? 'triangle' : 'sine';
    o.frequency.value = f;
    o.detune.value = (i - 1.5) * 6;
    const g = ctx.createGain();
    g.gain.value = 0.22 / (i + 1);
    o.connect(g).connect(filter);
    o.start();
    return o;
  });
  filter.connect(out).connect(master);
  lfo.start();
  ambient = { voices, lfo, out };
}

export const audio = {
  get enabled() {
    return enabled;
  },
  async enable() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') await ctx.resume();
    enabled = true;
    startAmbient();
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    document.documentElement.dataset.sound = 'on';
  },
  disable() {
    enabled = false;
    document.documentElement.dataset.sound = 'off';
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  },
  toggle() {
    return enabled ? (this.disable(), false) : (this.enable(), true);
  },
  tick(freq = 1800, level = 0.08) {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.04);
    g.gain.setValueAtTime(level, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.06);
  },
  knock(intensity = 0.5) {
    if (!enabled || !ctx) return;
    const now = performance.now();
    if (now - lastKnock < 28) return;
    lastKnock = now;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    const f = 90 + intensity * 140 + Math.random() * 30;
    o.frequency.setValueAtTime(f * 1.8, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.03);
    g.gain.setValueAtTime(0.25 * intensity, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + 0.2);
  },
  sweep(up = true) {
    if (!enabled || !ctx) return;
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
    g.gain.exponentialRampToValueAtTime(0.12, t + len * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
  }
};
