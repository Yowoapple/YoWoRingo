import { audio } from './audio.js';

const BPM = 84;
const STEP = 60 / BPM / 4;
const BARS = 32;
const STEPS = BARS * 16;
const DURATION = STEPS * STEP;
const LOOKAHEAD = 0.14;

const midi = n => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = [
  { root: 45, tones: [57, 60, 64, 67, 71] },
  { root: 41, tones: [57, 60, 64, 65, 69] },
  { root: 48, tones: [55, 59, 60, 64, 67] },
  { root: 43, tones: [55, 59, 62, 64, 66] }
];
const ARP = [0, 2, 4, 1, 3, 2, 4, 3];

let playing = false;
let step = 0;
let nextTime = 0;
let timer = 0;
let fx = null;
const listeners = new Set();

function killSession() {
  if (!fx) return;
  const old = fx;
  fx = null;
  old.out.gain.setTargetAtTime(0, audio.context.currentTime, 0.08);
  setTimeout(() => old.out.disconnect(), 700);
}

function effects(ctx, musicBus) {
  if (fx) return fx;
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 1.4);
  bus.connect(musicBus);
  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.38;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2200;
  delay.connect(tone).connect(feedback).connect(delay);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  tone.connect(wet).connect(bus);
  const padFilter = ctx.createBiquadFilter();
  padFilter.type = 'lowpass';
  padFilter.frequency.value = 900;
  padFilter.Q.value = 0.3;
  padFilter.connect(bus);
  fx = { out: bus, delay, padFilter, fresh: true };
  return fx;
}

function env(ctx, node, when, peak, attack, hold, release) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(peak, when + attack);
  g.gain.setValueAtTime(peak, when + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, when + attack + hold + release);
  node.connect(g);
  return g;
}

function schedule(ctx, musicBus, s, when) {
  const { out: bus, delay, padFilter } = effects(ctx, musicBus);
  const bar = Math.floor(s / 16);
  const inBar = s % 16;
  const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
  const section = bar < 8 ? 0 : bar < 24 ? 1 : 2;

  const chordStep = s % 32;
  if (chordStep === 0 || fx.fresh) {
    fx.fresh = false;
    const len = STEP * (32 - chordStep);
    const edge = Math.min(1.6, len / 3);
    chord.tones.slice(0, 4).forEach((n, i) => {
      [-5, 5].forEach(detune => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = midi(n);
        o.detune.value = detune + i;
        env(ctx, o, when, 0.035, edge, len - edge * 2, edge).connect(padFilter);
        o.start(when);
        o.stop(when + len + 0.1);
      });
    });
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = midi(chord.root - 12);
    env(ctx, sub, when, 0.08, edge / 2, len - edge * 1.5, edge).connect(padFilter);
    sub.start(when);
    sub.stop(when + len + 0.1);
  }

  if (section >= 1 && inBar % 2 === 0) {
    const idx = ARP[(inBar / 2 + bar) % ARP.length];
    const n = chord.tones[idx] + 12;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = midi(n);
    const g = env(ctx, o, when, section === 2 ? 0.05 : 0.035, 0.005, 0.02, 0.5);
    g.connect(bus);
    g.connect(delay);
    o.start(when);
    o.stop(when + 0.6);
  }

  if (section === 2 && (inBar === 0 || inBar === 10)) {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(110, when);
    o.frequency.exponentialRampToValueAtTime(45, when + 0.12);
    env(ctx, o, when, 0.16, 0.003, 0.02, 0.25).connect(bus);
    o.start(when);
    o.stop(when + 0.35);
  }

  if (section === 2 && inBar % 4 === 2) {
    const len = 0.05;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.value = 0.03;
    src.connect(hp).connect(g).connect(bus);
    src.start(when);
  }
}

function pump() {
  const ctx = audio.context;
  const bus = audio.musicBus;
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    schedule(ctx, bus, step, nextTime);
    nextTime += STEP;
    step = (step + 1) % STEPS;
  }
}

function emit() {
  listeners.forEach(fn => fn({ playing, position: music.position, duration: DURATION }));
}

export const music = {
  duration: DURATION,
  get playing() {
    return playing;
  },
  get position() {
    if (!playing) return step * STEP;
    const ctx = audio.context;
    const behind = Math.max(0, nextTime - ctx.currentTime);
    return (((step * STEP - behind) % DURATION) + DURATION) % DURATION;
  },
  onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  async play() {
    if (!audio.enabled) await audio.enable();
    if (playing) return;
    const ctx = audio.context;
    if (!ctx) return;
    playing = true;
    nextTime = ctx.currentTime + 0.05;
    pump();
    timer = setInterval(pump, 25);
    emit();
  },
  pause() {
    if (!playing) return;
    step = Math.floor(this.position / STEP);
    playing = false;
    clearInterval(timer);
    killSession();
    emit();
  },
  toggle() {
    if (playing) this.pause();
    else this.play();
  },
  fadeOut(seconds = 0.25) {
    if (!fx) return;
    fx.out.gain.cancelScheduledValues(audio.context.currentTime);
    fx.out.gain.setTargetAtTime(0.0001, audio.context.currentTime, seconds / 3);
  },
  snapshot() {
    return { playing, pos: this.position };
  },
  seek(fraction) {
    const target = Math.floor(Math.min(0.999, Math.max(0, fraction)) * STEPS);
    step = target;
    if (playing) {
      killSession();
      nextTime = audio.context.currentTime + 0.05;
    }
    emit();
  }
};
