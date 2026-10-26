import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;

/** Previous and next part of the same series (same name, part - 1 / + 1). */
export function seriesNeighbours(posts: Post[], entry: Post): { prev?: Post; next?: Post } {
  const s = entry.data.series;
  if (!s) return { prev: undefined, next: undefined };
  const find = (part: number) =>
    posts.find((p) => p.data.series?.name === s.name && p.data.series.part === part);
  return { prev: find(s.part - 1), next: find(s.part + 1) };
}
