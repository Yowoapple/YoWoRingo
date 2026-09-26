import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const root = import.meta.dirname;

export default defineConfig({
  base: '/YoWoRingo/',
  build: {
    target: 'es2020',
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
});
