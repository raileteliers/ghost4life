// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// El sitio se publica por defecto en GitHub Pages de proyecto
// (https://rleteliers.github.io/okey/). Si algún día se sirve desde el dominio
// propio, basta con exportar SITE_URL=https://ghost4life.cl y BASE_PATH=/
// antes de correr `npm run build`; no hay que tocar ningún enlace.
const site = process.env.SITE_URL ?? 'https://rleteliers.github.io';
const base = process.env.BASE_PATH ?? '/okey';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
