import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), url: z.string() });
const series = z.object({ name: z.string(), part: z.number().int() });

const posts = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/posts',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      author: z.string().default('Seth Brasile'),
      tags: z.array(z.string()).default([]),
      series: series.optional(),
      cover: z.object({ image: image(), alt: z.string() }).optional(),
      unlisted: z.boolean().default(false),
      youtubeIds: z.array(z.string()).optional(),
      note: z.string().optional(),
    }),
});

const videos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    youtubeId: z.string(),
    extras: z.array(z.object({ label: z.string(), youtubeId: z.string() })).optional(),
    series: series.optional(),
    tags: z.array(z.string()).default([]),
    products: z.array(link).optional(),
    mentioned: z.array(link).optional(),
    chapters: z.array(z.object({ time: z.string(), label: z.string() })).optional(),
    relatedPosts: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
    unlisted: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    unlisted: z.boolean().default(false),
    noindex: z.boolean().default(false),
  }),
});

export const collections = { posts, videos, pages };
