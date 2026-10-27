/** Pages kept out of the sitemap. Unlisted entries are noindex and none exist at launch (Task 8 asserts this). */
export const UNLISTED_PATHS = [];

const EXCLUDED = new Set(['https://bytemycache.com/404/', ...UNLISTED_PATHS]);

/** Tag lists are thin (most hold one post), so they are noindex, follow and stay out of the sitemap. */
const TAGS = 'https://bytemycache.com/tags/';

export const filter = (page) => !EXCLUDED.has(page) && !page.startsWith(TAGS);
