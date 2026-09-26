import { dpr, clamp, lerp, easeOutExpo, easeInOutCubic } from '../utils/device.js';

const INK = 'rgb(11 11 12)';
const PAPER = [239, 238, 234];
const SIGNAL = [43, 59, 255];
const STEPS = 12;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function createPixelHero(canvas, options) {
  const { sampleUrl, photoUrl, word, fontFamily, reduced = false } = options;
  let cols = options.cols;
  let gap = options.gap ?? true;
  const ctx = canvas.getContext('2d', { alpha: false });
  const [sample, photo] = await Promise.all([loadImage(sampleUrl), loadImage(photoUrl)]);
  await document.fonts.load(`700 120px "${fontFamily}"`);

  const sc = document.createElement('canvas');
  sc.width = sample.width;
  sc.height = sample.height;
  const sctx = sc.getContext('2d', { willReadFrequently: true });
  sctx.drawImage(sample, 0, 0);
  const sdata = sctx.getImageData(0, 0, sc.width, sc.height).data;
  const aspect = sample.height / sample.width;

  let W = 0, H = 0, ratio = 1, cell = 1, textCell = 1, rows = 0, n = 0;
  let box = { x: 0, y: 0, w: 0, h: 0 };
  let homeX, homeY, sx, sy, tx, ty, ox, oy, vx, vy, delayIn, delayOut, colors, byX;
  let introStart = null;
  let introSettled = false;
  let progress = 0;
  let lastProgress = -1;
  let dirty = true;
  let raf = 0;
  let visible = true;
  const pointer = { x: 0, y: 0, active: false };

  function build() {
    rows = Math.round(cols * aspect);
    n = cols * rows;
    homeX = new Float32Array(n);
    homeY = new Float32Array(n);
    sx = new Float32Array(n);
    sy = new Float32Array(n);
    tx = new Float32Array(n);
    ty = new Float32Array(n);
    ox = new Float32Array(n);
    oy = new Float32Array(n);
    vx = new Float32Array(n);
    vy = new Float32Array(n);
    delayIn = new Float32Array(n);
    delayOut = new Float32Array(n);
    colors = Array.from({ length: STEPS + 1 }, () => new Array(n));
    const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
    const maxD = Math.hypot(cx, cy);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const px = Math.min(sc.width - 1, Math.floor(((c + 0.5) / cols) * sc.width));
        const py = Math.min(sc.height - 1, Math.floor(((r + 0.5) / rows) * sc.height));
        const k = (py * sc.width + px) * 4;
        const rgb = [sdata[k], sdata[k + 1], sdata[k + 2]];
        const target = Math.random() < 0.06 ? SIGNAL : PAPER;
        for (let s = 0; s <= STEPS; s++) {
          const t = s / STEPS;
          colors[s][i] = `rgb(${Math.round(lerp(rgb[0], target[0], t))} ${Math.round(lerp(rgb[1], target[1], t))} ${Math.round(lerp(rgb[2], target[2], t))})`;
        }
        delayIn[i] = (Math.hypot(c - cx, r - cy) / maxD) * 0.45 + Math.random() * 0.12;
        delayOut[i] = Math.random() * 0.3 + (c / cols) * 0.15;
      }
    }
  }

  function computeText() {
    const tc = document.createElement('canvas');
    tc.width = Math.max(1, Math.ceil(W));
    tc.height = Math.max(1, Math.ceil(H));
    const t = tc.getContext('2d', { willReadFrequently: true });
    let size = 100;
    t.font = `700 ${size}px "${fontFamily}"`;
    if ('letterSpacing' in t) t.letterSpacing = `${-size * 0.04}px`;
    const m = t.measureText(word).width;
    size = Math.min((size * W * 0.94) / m, H * 0.5);
    t.font = `700 ${size}px "${fontFamily}"`;
    if ('letterSpacing' in t) t.letterSpacing = `${-size * 0.04}px`;
    t.textAlign = 'center';
    t.textBaseline = 'middle';
    t.fillStyle = '#fff';
    t.fillText(word, W / 2, H / 2);
    const data = t.getImageData(0, 0, tc.width, tc.height).data;
    let step = Math.max(2, size / 24);
    let points = [];
    for (let tries = 0; tries < 5; tries++) {
      points = [];
      for (let y = step / 2; y < tc.height; y += step) {
        for (let x = step / 2; x < tc.width; x += step) {
          if (data[(Math.floor(y) * tc.width + Math.floor(x)) * 4 + 3] > 128) points.push([x - step / 2, y - step / 2]);
        }
      }
      if (points.length > n * 1.05) step *= 1.12;
      else if (points.length < n * 0.55) step *= 0.86;
      else break;
    }
    textCell = step;
    points.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const P = points.length;
    for (let k = 0; k < n; k++) {
      const i = byX[k];
      const p = points[Math.min(P - 1, Math.floor((k * P) / n))];
      tx[i] = p[0];
      ty[i] = p[1];
    }
  }

  function layout() {
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    ratio = dpr();
    canvas.width = Math.round(W * ratio);
    canvas.height = Math.round(H * ratio);
    const narrow = W < 768;
    let bh = H * (narrow ? 0.6 : 0.74);
    let bw = bh / aspect;
    if (bw > W * 0.86) {
      bw = W * 0.86;
      bh = bw * aspect;
    }
    box = { x: (W - bw) / 2, y: (H - bh) / 2, w: bw, h: bh };
    cell = bw / cols;
    const R = Math.max(W, H);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        homeX[i] = box.x + c * cell;
        homeY[i] = box.y + r * cell;
        const a = Math.random() * Math.PI * 2;
        const d = R * (0.55 + Math.random() * 0.5);
        sx[i] = W / 2 + Math.cos(a) * d;
        sy[i] = H / 2 + Math.sin(a) * d;
      }
    }
    byX = Array.from({ length: n }, (_, i) => i).sort((a, b) => homeX[a] - homeX[b] || homeY[a] - homeY[b]);
    computeText();
    dirty = true;
  }

  function step() {
    const R = Math.max(64, cell * 9);
    const R2 = R * R;
    const strength = cell * 2.4;
    const push = pointer.active && progress < 0.01;
    let moving = false;
    for (let i = 0; i < n; i++) {
      let fx = 0, fy = 0;
      if (push) {
        const dx = homeX[i] + cell / 2 - pointer.x;
        const dy = homeY[i] + cell / 2 - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const k = 1 - d / R;
          const f = k * strength * 0.4 + 0.7;
          fx = (dx / d) * f;
          fy = (dy / d) * f;
        }
      }
      vx[i] = (vx[i] + (fx - ox[i]) * 0.12) * 0.78;
      vy[i] = (vy[i] + (fy - oy[i]) * 0.12) * 0.78;
      ox[i] += vx[i];
      oy[i] += vy[i];
      if (!moving && (Math.abs(vx[i]) > 0.02 || Math.abs(vy[i]) > 0.02 || Math.abs(ox[i]) > 0.3 || Math.abs(oy[i]) > 0.3)) moving = true;
    }
    return moving;
  }

  function draw(now) {
    const t = introStart === null ? 0 : (now - introStart) / 2200;
    const g = gap ? Math.max(1, cell * 0.14) : 0;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, W, H);
    if (introStart === null) return;

    if (progress <= 0) {
      const photoAlpha = clamp((t - 1.05) / 0.4, 0, 1);
      if (photoAlpha < 1) {
        for (let i = 0; i < n; i++) {
          const q = easeOutExpo(clamp((t - delayIn[i]) / 0.55, 0, 1));
          if (q <= 0) continue;
          ctx.fillStyle = colors[Math.round((1 - q) * STEPS * 0.7)][i];
          const s = lerp(cell * 0.4, cell - g, q);
          ctx.fillRect(lerp(sx[i], homeX[i], q) + ox[i], lerp(sy[i], homeY[i], q) + oy[i], s, s);
        }
      }
      if (photoAlpha > 0) {
        ctx.globalAlpha = photoAlpha;
        ctx.drawImage(photo, box.x, box.y, box.w, box.h);
        ctx.globalAlpha = 1;
        if (photoAlpha >= 1) {
          const moved = [];
          ctx.fillStyle = INK;
          for (let i = 0; i < n; i++) {
            if (Math.abs(ox[i]) + Math.abs(oy[i]) > 0.6) {
              moved.push(i);
              ctx.fillRect(homeX[i], homeY[i], cell, cell);
            }
          }
          for (const i of moved) {
            const d = Math.min(1, (Math.abs(ox[i]) + Math.abs(oy[i])) / (cell * 1.2));
            ctx.fillStyle = colors[Math.round(d * d * 4)][i];
            const s = cell - Math.max(1, cell * 0.16) - d * cell * 0.22;
            ctx.fillRect(homeX[i] + ox[i] + (cell - s) / 2, homeY[i] + oy[i] + (cell - s) / 2, s, s);
          }
        }
      }
      return;
    }

    const pa = 1 - clamp(progress * 6, 0, 1);
    if (pa > 0) {
      ctx.globalAlpha = pa;
      ctx.drawImage(photo, box.x, box.y, box.w, box.h);
      ctx.globalAlpha = 1;
      ctx.fillStyle = INK;
      for (let i = 0; i < n; i++) {
        if (progress - delayOut[i] > 0) ctx.fillRect(homeX[i], homeY[i], cell, cell);
      }
    }
    const tg = Math.max(0.6, textCell * 0.12);
    for (let i = 0; i < n; i++) {
      const q = easeInOutCubic(clamp((progress - delayOut[i]) / 0.55, 0, 1));
      if (q <= 0 && pa > 0.9) continue;
      ctx.fillStyle = colors[Math.round(q * STEPS)][i];
      const s = lerp(cell - g, textCell - tg, q);
      const lift = Math.sin(q * Math.PI) * (H * 0.08) * ((i % 7) / 7 - 0.5);
      ctx.fillRect(lerp(homeX[i] + ox[i], tx[i], q), lerp(homeY[i] + oy[i], ty[i], q) + lift, s, s);
    }
  }

  function frame(now) {
    raf = 0;
    if (!visible) return;
    const introRunning = introStart !== null && now - introStart < 2200 * 1.6;
    const moving = step();
    if (introStart !== null && !introRunning && !introSettled) {
      introSettled = true;
      dirty = true;
    }
    if (dirty || introRunning || moving || progress !== lastProgress) {
      draw(now);
      lastProgress = progress;
      dirty = false;
    }
    if (introRunning || moving || pointer.active || dirty) raf = requestAnimationFrame(frame);
  }

  function wake() {
    if (!raf && visible) raf = requestAnimationFrame(frame);
  }

  const ro = new ResizeObserver(() => {
    layout();
    wake();
  });
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) {
      dirty = true;
      wake();
    }
  });

  build();
  layout();
  ro.observe(canvas);
  io.observe(canvas);
  draw(performance.now());

  return {
    play() {
      introStart = reduced ? performance.now() - 2200 * 2 : performance.now();
      dirty = true;
      wake();
    },
    setProgress(p) {
      progress = p < 0.003 ? 0 : clamp(p, 0, 1);
      wake();
    },
    setPointer(x, y, active) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = x - rect.left;
      pointer.y = y - rect.top;
      pointer.active = active;
      wake();
    },
    setDensity(c) {
      cols = c;
      build();
      layout();
      wake();
    },
    setGap(v) {
      gap = v;
      dirty = true;
      wake();
    },
    destroy() {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(raf);
    }
  };
}
