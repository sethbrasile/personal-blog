import { getCollection, type CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;
type Video = CollectionEntry<'videos'>;
export type TagBucket = { name: string; posts: Post[]; videos: Video[] };

/** Matches Hugo's urlize for the tag shapes this site uses. */
export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_.]/gu, '');
}

export const postPath = (entry: Pick<Post, 'id'>) => `/posts/${entry.id}/`;
export const videoPath = (entry: Pick<Video, 'id'>) => `/videos/${entry.id}/`;
export const tagPath = (slug: string) => `/tags/${slug}/`;

const newestFirst = <T extends { data: { date: Date } }>(a: T, b: T) =>
  b.data.date.getTime() - a.data.date.getTime();

const published = <T extends { data: { draft: boolean } }>(e: T) =>
  !import.meta.env.PROD || !e.data.draft;

export async function getPublishedPosts(): Promise<Post[]> {
  return (await getCollection('posts', published)).sort(newestFirst);
}
export async function getListedPosts(): Promise<Post[]> {
  return (await getPublishedPosts()).filter((p) => !p.data.unlisted);
}
export async function getPublishedVideos(): Promise<Video[]> {
  return (await getCollection('videos', published)).sort(newestFirst);
}
export async function getListedVideos(): Promise<Video[]> {
  return (await getPublishedVideos()).filter((v) => !v.data.unlisted);
}

/** Pure: group entries by tag slug; display name is the first spelling seen. */
export function buildTagIndex(posts: Post[], videos: Video[]): Map<string, TagBucket> {
  const index = new Map<string, TagBucket>();
  const bucket = (tag: string) => {
    const slug = slugifyTag(tag);
    if (!slug) return undefined;
    let b = index.get(slug);
    if (!b) index.set(slug, (b = { name: tag.trim(), posts: [], videos: [] }));
    return b;
  };
  for (const p of posts) for (const t of p.data.tags) bucket(t)?.posts.push(p);
  for (const v of videos) for (const t of v.data.tags) bucket(t)?.videos.push(v);
  return index;
}

export async function getTagIndex(): Promise<Map<string, TagBucket>> {
  return buildTagIndex(await getListedPosts(), await getListedVideos());
}
