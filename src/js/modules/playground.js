import Matter from 'matter-js';
import { audio } from './audio.js';
import { clamp } from '../utils/device.js';

const { Engine, Bodies, Body, Composite, Constraint, Events } = Matter;

export function createPlayground(stage, options = {}) {
  const navigate = href => (options.onNavigate || (u => (location.href = u)))(new URL(href, location.href).href);
  const items = [...stage.querySelectorAll('[data-body]')].filter(el => getComputedStyle(el).display !== 'none');
  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;
  engine.positionIterations = 8;
  engine.velocityIterations = 6;

  let W = 0, H = 0;
  let walls = [];
  let started = false;
  let running = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  const bodies = new Map();
  const wallThickness = 400;

  function measure() {
    const rect = stage.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
  }

  function buildWalls() {
    if (walls.length) Composite.remove(engine.world, walls);
    const opts = { isStatic: true, friction: 0.6, restitution: 0.2 };
    walls = [
      Bodies.rectangle(W / 2, H + wallThickness / 2, W * 3, wallThickness, opts),
      Bodies.rectangle(-wallThickness / 2, -H, wallThickness, H * 5, opts),
      Bodies.rectangle(W + wallThickness / 2, -H, wallThickness, H * 5, opts),
      Bodies.rectangle(W / 2, -H * 3.2, W * 3, wallThickness, opts)
    ];
    Composite.add(engine.world, walls);
  }

  function spawn() {
    items.forEach((el, index) => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const kind = el.dataset.body;
      const x = clamp(W * (0.12 + Math.random() * 0.76), w / 2 + 4, W - w / 2 - 4);
      const y = -h / 2 - 40 - (index / items.length) * H * 1.3 - Math.random() * 60;
      const body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: kind === 'tag' ? Math.min(h / 2, 24) : 2 },
        restitution: kind === 'letter' ? 0.35 : 0.25,
        friction: 0.4,
        frictionAir: 0.012,
        density: kind === 'card' ? 0.0018 : 0.001,
        angle: (Math.random() - 0.5) * 0.8
      });
      bodies.set(el, { body, w, h });
      Composite.add(engine.world, body);
      el.style.visibility = 'visible';
    });
  }

  function rescue(body, w, h) {
    const { x, y } = body.position;
    if (y > H + 200 || y < -H * 3 || x < -200 || x > W + 200) {
      Body.setPosition(body, { x: clamp(W * (0.2 + Math.random() * 0.6), w / 2, W - w / 2), y: -h });
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngularVelocity(body, 0);
    }
  }

  function sync() {
    for (const [el, { body, w, h }] of bodies) {
      rescue(body, w, h);
      el.style.transform = `translate3d(${body.position.x - w / 2}px, ${body.position.y - h / 2}px, 0) rotate(${body.angle}rad)`;
    }
  }

  function loop(now) {
    raf = 0;
    if (!running) return;
    acc += Math.min(50, now - (last || now - 16.667));
    last = now;
    while (acc >= 1000 / 60) {
      Engine.update(engine, 1000 / 60);
      acc -= 1000 / 60;
    }
    sync();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    raf = 0;
  }

  Events.on(engine, 'collisionStart', event => {
    for (const pair of event.pairs) {
      const a = pair.bodyA, b = pair.bodyB;
      const speed = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
      if (speed > 2.2) audio.knock(clamp(speed / 18, 0.1, 1));
    }
  });

  let drag = null;
  const toLocal = e => {
    const rect = stage.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  for (const el of items) {
    el.addEventListener('pointerdown', e => {
      const entry = bodies.get(el);
      if (!entry) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      const { body } = entry;
      Matter.Sleeping.set(body, false);
      const constraint = Constraint.create({
        pointA: p,
        bodyB: body,
        pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
        stiffness: 0.18,
        damping: 0.08,
        length: 0
      });
      Composite.add(engine.world, constraint);
      drag = { el, constraint, start: p, moved: 0, time: performance.now() };
      el.classList.add('is-grabbed');
      audio.tick(1400, 0.05);
    });
    el.addEventListener('pointermove', e => {
      if (!drag || drag.el !== el) return;
      const p = toLocal(e);
      drag.moved = Math.max(drag.moved, Math.hypot(p.x - drag.start.x, p.y - drag.start.y));
      drag.constraint.pointA = p;
    });
    const release = () => {
      if (!drag || drag.el !== el) return;
      Composite.remove(engine.world, drag.constraint);
      el.classList.remove('is-grabbed');
      const tap = drag.moved < 6 && performance.now() - drag.time < 350;
      drag = null;
      if (tap && el.dataset.href) navigate(el.dataset.href);
    };
    el.addEventListener('pointerup', release);
    el.addEventListener('pointercancel', release);
    el.addEventListener('click', e => e.preventDefault());
    el.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && el.dataset.href) navigate(el.dataset.href);
    });
  }

  function onOrientation(e) {
    if (e.gamma == null || e.beta == null) return;
    engine.gravity.x = clamp(Math.sin((e.gamma * Math.PI) / 180) * 1.6, -1, 1);
    engine.gravity.y = clamp(Math.sin((e.beta * Math.PI) / 180) * 1.6, -1, 1);
    for (const { body } of bodies.values()) Matter.Sleeping.set(body, false);
  }

  async function enableTilt() {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return false;
    if (typeof DOE.requestPermission === 'function') {
      const res = await DOE.requestPermission().catch(() => 'denied');
      if (res !== 'granted') return false;
    }
    window.addEventListener('deviceorientation', onOrientation);
    return true;
  }

  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (!started && entry.intersectionRatio > 0.25) {
        started = true;
        spawn();
      }
      if (started) start();
    } else stop();
  }, { threshold: [0, 0.25] });

  const ro = new ResizeObserver(() => {
    const prevW = W;
    measure();
    buildWalls();
    if (prevW && prevW !== W) {
      for (const { body, w } of bodies.values()) {
        Body.setPosition(body, { x: clamp((body.position.x / prevW) * W, w / 2, W - w / 2), y: Math.min(body.position.y, H - 40) });
        Matter.Sleeping.set(body, false);
      }
    }
  });

  measure();
  buildWalls();
  items.forEach(el => (el.style.visibility = 'hidden'));
  io.observe(stage);
  ro.observe(stage);

  return {
    enableTilt,
    setGravity(g) {
      engine.gravity.scale = 0.001 * g;
      for (const { body } of bodies.values()) Matter.Sleeping.set(body, false);
    },
    shake() {
      for (const { body } of bodies.values()) {
        Matter.Sleeping.set(body, false);
        Body.setVelocity(body, { x: (Math.random() - 0.5) * 24, y: -10 - Math.random() * 14 });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.4);
      }
    },
    destroy() {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('deviceorientation', onOrientation);
    }
  };
}
