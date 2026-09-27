const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CANVAS', 'svg', 'SVG', 'TEXTAREA', 'CODE', 'KBD']);
const ATTRS = ['aria-label', 'placeholder', 'alt', 'title'];
const loaders = {
  'zh-Hant': () => import('../../i18n/zh-Hant.json'),
  'zh-Hans': () => import('../../i18n/zh-Hans.json')
};

let lang = 'en';
let dict = {};
const originalTitle = document.title;
const textOrigin = new WeakMap();
const htmlOrigin = new WeakMap();
const attrOrigin = new WeakMap();
const listeners = new Set();

const norm = s => s.replace(/\s+/g, ' ').trim();

export function t(str) {
  if (lang === 'en') return str;
  return dict[norm(str)] ?? str;
}

export const currentLang = () => lang;

export function onLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function translateAttrs(el) {
  for (const name of ATTRS) {
    if (!el.hasAttribute(name)) continue;
    let origin = attrOrigin.get(el);
    if (!origin) attrOrigin.set(el, (origin = {}));
    if (!(name in origin)) origin[name] = el.getAttribute(name);
    const src = origin[name];
    el.setAttribute(name, lang === 'en' ? src : dict[norm(src)] ?? src);
  }
}

export function translateTree(root = document.body) {
  if (!root) return;
  const whole = root.matches?.('[data-i18n]') ? [root] : [...root.querySelectorAll('[data-i18n]')];
  whole.forEach(el => {
    if (!htmlOrigin.has(el)) htmlOrigin.set(el, el.innerHTML);
    const src = htmlOrigin.get(el);
    el.innerHTML = lang === 'en' ? src : dict[norm(src)] ?? src;
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === 1) {
        if (SKIP.has(node.nodeName) || node.hasAttribute('data-no-i18n') || node.hasAttribute('data-i18n')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
      return /[A-Za-z]/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  if (root.nodeType === 1 && !root.matches('[data-i18n]')) translateAttrs(root);
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === 1) {
      translateAttrs(node);
      continue;
    }
    if (!textOrigin.has(node)) textOrigin.set(node, node.nodeValue);
    const src = textOrigin.get(node);
    if (lang === 'en') {
      node.nodeValue = src;
      continue;
    }
    const key = norm(src);
    const hit = dict[key];
    if (hit === undefined) continue;
    const lead = src.match(/^\s*/)[0], tail = src.match(/\s*$/)[0];
    node.nodeValue = lead + hit + tail;
  }
}

export async function setLang(next) {
  if (next !== 'en' && loaders[next]) {
    dict = (await loaders[next]()).default;
  } else {
    dict = {};
    next = 'en';
  }
  lang = next;
  document.documentElement.lang = next === 'en' ? 'en' : next;
  translateTree(document.body);
  document.title = t(originalTitle);
  listeners.forEach(fn => fn(lang));
}

export function collectKeys(root = document.body) {
  const keys = new Set();
  root.querySelectorAll('[data-i18n]').forEach(el => keys.add(norm(htmlOrigin.get(el) ?? el.innerHTML)));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (node.nodeType === 1) return SKIP.has(node.nodeName) || node.hasAttribute('data-no-i18n') || node.hasAttribute('data-i18n') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      return /[A-Za-z]/.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === 1) {
      ATTRS.forEach(a => node.hasAttribute(a) && keys.add(norm(attrOrigin.get(node)?.[a] ?? node.getAttribute(a))));
      continue;
    }
    keys.add(norm(textOrigin.get(node) ?? node.nodeValue));
  }
  return [...keys].filter(Boolean);
}
