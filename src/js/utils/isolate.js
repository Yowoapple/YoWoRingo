export function isolate(dialog) {
  const locked = [...document.body.children].filter(el => el !== dialog && !el.contains(dialog) && !el.inert);
  locked.forEach(el => (el.inert = true));
  return () => locked.forEach(el => (el.inert = false));
}
