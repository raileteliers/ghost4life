// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// El sitio se publica por defecto en GitHub Pages de proyecto
// (https://raileteliers.github.io/ghost4life/). Si algún día se sirve desde el dominio
// propio, basta con exportar SITE_URL=https://ghost4life.cl y BASE_PATH=/
// antes de correr `npm run build`; no hay que tocar ningún enlace.
const site = process.env.SITE_URL ?? 'https://raileteliers.github.io';
const base = process.env.BASE_PATH ?? '/ghost4life';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
