export function initTweaks(controls) {
  const panel = document.createElement('aside');
  panel.className = 'tweaks';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Tweaks');
  panel.innerHTML = `<header class="tweaks__head"><strong>Tweaks</strong><button class="tweaks__close" type="button" aria-label="Close">Esc</button></header>`;
  for (const control of controls) {
    const row = document.createElement('div');
    row.className = 'tweaks__row';
    const name = document.createElement('span');
    name.className = 'label';
    name.textContent = control.label;
    row.append(name);
    const group = document.createElement('div');
    group.className = 'tweaks__group';
    control.options.forEach(opt => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = opt.label;
      b.setAttribute('aria-pressed', String(opt.value === control.value));
      b.addEventListener('click', () => {
        if (control.momentary) return control.onChange(opt.value);
        group.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        control.onChange(opt.value);
      });
      group.append(b);
    });
    row.append(group);
    panel.append(row);
  }
  document.body.append(panel);
  const toggle = force => (panel.hidden = force ?? !panel.hidden);
  panel.querySelector('.tweaks__close').addEventListener('click', () => toggle(true));
  window.addEventListener('keydown', e => {
    if (e.key === 'T' && e.shiftKey && !e.target.closest('input, textarea')) toggle();
    if (e.key === 'Escape') toggle(true);
  });
  if (new URLSearchParams(location.search).has('tweaks')) toggle(false);
}
