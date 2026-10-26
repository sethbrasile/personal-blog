import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@/lib/site';
import { getListedPosts, getListedVideos, postPath, videoPath } from '@/lib/content';

export async function GET(context: APIContext) {
  const [posts, videos] = await Promise.all([getListedPosts(), getListedVideos()]);
  const entries = [
    ...posts.map((entry) => ({ entry, link: postPath(entry) })),
    ...videos.map((entry) => ({ entry, link: videoPath(entry) })),
  ].sort((a, b) => b.entry.data.date.getTime() - a.entry.data.date.getTime());

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    customData: '<language>en-us</language>',
    items: entries.map(({ entry, link }) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description ?? undefined,
      link,
    })),
  });
}
