import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { filter } from './src/lib/sitemap.mjs';

export default defineConfig({
  site: 'https://bytemycache.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter })],
  vite: { plugins: [tailwindcss()] },
});
