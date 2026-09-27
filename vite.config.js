import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

const PAGES = {
  '/index.html': { path: '', og: 'home', type: 'profile' },
  '/photography/index.html': { path: 'photography/', og: 'photography' },
  '/works/twerg/index.html': { path: 'works/twerg/', og: 'twerg' },
  '/works/plum/index.html': { path: 'works/plum/', og: 'plum' },
  '/works/galgame/index.html': { path: 'works/galgame/', og: 'galgame' }
};

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

function seo(env) {
  const site = env.VITE_SITE_URL;
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: env.VITE_LEGAL_NAME,
    alternateName: ['YoWoRingo', 'yowoapple', 'Ringo', '曾博文', '有無蘋果'],
    url: site,
    image: `${site}img/portrait-960.webp`,
    jobTitle: 'Founder, TWERG',
    homeLocation: { '@type': 'Place', name: 'New Taipei, Taiwan' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Taipei City University of Science and Technology' },
    affiliation: { '@type': 'CollegeOrUniversity', name: 'National Formosa University' },
    founder: { '@type': 'Organization', name: 'Taiwan Earthquake Recording Group (TWERG)', alternateName: '地牛記錄小組', url: 'https://www.twerg.org/', foundingDate: '2018-12-02' },
    knowsAbout: ['Seismology', 'Earthquake early warning', 'Web development', 'Game development', 'Street photography'],
    sameAs: [env.VITE_INSTAGRAM, env.VITE_X, env.VITE_GITHUB, 'https://www.twerg.org/']
  };

  return {
    name: 'yoworingo-seo',
    transformIndexHtml: { order: 'post', handler: (html, ctx) => {
      const page = PAGES[ctx.path];
      if (!page) return html;
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'YoWoRingo';
      const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      const url = site + page.path;
      const image = `${site}og/${page.og}.jpg`;
      const tags = [
        `<link rel="canonical" href="${url}">`,
        `<meta property="og:type" content="${page.type ?? 'website'}">`,
        `<meta property="og:site_name" content="YoWoRingo">`,
        `<meta property="og:title" content="${esc(title)}">`,
        `<meta property="og:description" content="${esc(desc)}">`,
        `<meta property="og:url" content="${url}">`,
        `<meta property="og:image" content="${image}">`,
        `<meta property="og:image:width" content="1200">`,
        `<meta property="og:image:height" content="630">`,
        `<meta property="og:locale" content="en_US">`,
        `<meta property="og:locale:alternate" content="zh_TW">`,
        `<meta property="og:locale:alternate" content="zh_CN">`,
        `<meta name="twitter:card" content="summary_large_image">`,
        `<meta name="twitter:site" content="@AppleJackOAO">`,
        `<meta name="twitter:title" content="${esc(title)}">`,
        `<meta name="twitter:description" content="${esc(desc)}">`,
        `<meta name="twitter:image" content="${image}">`
      ];
      if (ctx.path === '/index.html') tags.push(`<script type="application/ld+json">${JSON.stringify(person)}</script>`);
      return html.replace('</head>', `  ${tags.join('\n  ')}\n</head>`);
    } }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, 'VITE_');
  return {
    base: '/YoWoRingo/',
    plugins: [seo(env)],
    build: {
      target: 'es2022',
      rollupOptions: {
        input: {
          main: resolve(root, 'index.html'),
          photography: resolve(root, 'photography/index.html'),
          twerg: resolve(root, 'works/twerg/index.html'),
          plum: resolve(root, 'works/plum/index.html'),
          galgame: resolve(root, 'works/galgame/index.html'),
          notFound: resolve(root, '404.html')
        }
      }
    }
  };
});
