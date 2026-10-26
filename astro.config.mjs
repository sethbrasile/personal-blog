import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import { filter } from './src/lib/sitemap.mjs';
import { stripHtmlComments } from './src/lib/mdast-strip-comments.mjs';

export default defineConfig({
  site: 'https://bytemycache.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap({ filter })],
  markdown: {
    processor: satteri({ mdastPlugins: [stripHtmlComments] }),
    shikiConfig: {
      theme: 'github-dark',
      // github-dark comments (#6a737d) are 2.9:1 on the ink code ground; lift to 6.4:1.
      colorReplacements: { '#6a737d': '#9fb3bf' },
      // Hugo's highlighter was case-insensitive; two migrated posts rely on it.
      langAlias: { basH: 'bash', Powershell: 'powershell' },
    },
  },
  vite: { plugins: [tailwindcss()] },
});
