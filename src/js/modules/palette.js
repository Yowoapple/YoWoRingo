import { audio } from './audio.js';

export function initPalette(getCommands) {
  const root = document.createElement('div');
  root.className = 'palette';
  root.hidden = true;
  root.innerHTML = `
    <div class="palette__scrim" data-close></div>
    <div class="palette__panel" role="dialog" aria-modal="true" aria-label="Command palette">
      <div class="palette__field">
        <span class="label">Go</span>
        <input class="palette__input" type="text" placeholder="Type a command or search" autocomplete="off" spellcheck="false" aria-controls="palette-list">
        <kbd class="palette__kbd">Esc</kbd>
      </div>
      <ul class="palette__list" id="palette-list" role="listbox"></ul>
    </div>`;
  document.body.append(root);
  const input = root.querySelector('input');
  const list = root.querySelector('ul');
  let items = [];
  let active = 0;
  let lastFocus = null;

  function score(cmd, q) {
    if (!q) return 1;
    const hay = `${cmd.title} ${cmd.group} ${cmd.keywords || ''}`.toLowerCase();
    if (hay.includes(q)) return 2 - hay.indexOf(q) / 100;
    let i = 0;
    for (const ch of hay) if (ch === q[i]) i++;
    return i === q.length ? 0.5 : 0;
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    items = getCommands().filter(c => !c.hidden || (c.secret && q === c.secret)).map(c => ({ c, s: c.secret ? (q === c.secret ? 3 : 0) : score(c, q) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).map(x => x.c);
    active = Math.min(active, Math.max(0, items.length - 1));
    list.innerHTML = '';
    let group = '';
    items.forEach((cmd, i) => {
      if (!q && cmd.group !== group) {
        group = cmd.group;
        const h = document.createElement('li');
        h.className = 'palette__group label';
        h.textContent = group;
        h.setAttribute('role', 'presentation');
        list.append(h);
      }
      const li = document.createElement('li');
      li.className = 'palette__item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.dataset.index = i;
      li.innerHTML = `<span class="palette__title"></span><span class="palette__hint label"></span>`;
      li.querySelector('.palette__title').textContent = cmd.title;
      li.querySelector('.palette__hint').textContent = cmd.hint || '';
      list.append(li);
    });
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'palette__empty label';
      li.textContent = 'No Ringo here';
      list.append(li);
    }
  }

  function setActive(i) {
    active = (i + items.length) % items.length;
    list.querySelectorAll('.palette__item').forEach(el => {
      const on = Number(el.dataset.index) === active;
      el.setAttribute('aria-selected', String(on));
      if (on) {
        const top = el.offsetTop, bottom = top + el.offsetHeight;
        if (top < list.scrollTop) list.scrollTop = top;
        else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
      }
    });
    audio.tick(2200, 0.02);
  }

  function run(i) {
    const cmd = items[i];
    if (!cmd) return;
    close();
    cmd.run();
  }

  function open() {
    if (!root.hidden) return;
    lastFocus = document.activeElement;
    root.hidden = false;
    input.value = '';
    active = 0;
    render();
    requestAnimationFrame(() => {
      root.classList.add('is-open');
      input.focus();
    });
    document.documentElement.classList.add('is-locked');
    audio.tick(1600, 0.05);
  }

  function close() {
    if (root.hidden) return;
    root.classList.remove('is-open');
    document.documentElement.classList.remove('is-locked');
    setTimeout(() => (root.hidden = true), 220);
    lastFocus?.focus?.({ preventScroll: true });
  }

  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(active - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(active);
    }
  });
  list.addEventListener('click', e => {
    const li = e.target.closest('.palette__item');
    if (li) run(Number(li.dataset.index));
  });
  list.addEventListener('pointermove', e => {
    const li = e.target.closest('.palette__item');
    if (li && Number(li.dataset.index) !== active) setActive(Number(li.dataset.index));
  });
  root.addEventListener('click', e => e.target.closest('[data-close]') && close());
  window.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      root.hidden ? open() : close();
    } else if (e.key === 'Escape') close();
  });
  document.querySelectorAll('[data-palette-open]').forEach(b => b.addEventListener('click', open));

  return { open, close };
}
