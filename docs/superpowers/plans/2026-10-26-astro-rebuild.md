# bytemycache.com Astro Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Hugo/PaperMod site with an Astro site that serves the same content at the same URLs, deployed from the existing Cloudflare Pages project.

**Architecture:** Astro static output with three content collections (`posts`, `videos`, `pages`) under `src/content/`, a single base layout implementing the chosen "Maker Zine" design (tokens in one CSS file, light default plus dark mode), and no server code except the PostHog ingest Pages Function. A one-shot migration script converts the Hugo content tree, is run once, and is then deleted. A URL inventory test proves every URL from the live Hugo sitemap is either built or redirected.

**Tech Stack:** Astro 7.4, TypeScript strict, Tailwind CSS 4 via `@tailwindcss/vite`, `@tailwindcss/typography`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/check`, Vitest, Cloudflare Pages (git integration, Pages Functions), PostHog, Husky + lint-staged + Prettier.

**Spec:** `docs/superpowers/specs/2026-10-26-astro-rebuild-design.md`

## Global Constraints

- Node 22.12+ (machine has v24). Astro `^7.4.2`, Tailwind `^4.3.3`, `@tailwindcss/typography` `^0.5.20`, `@astrojs/mdx` `^8.1.1`, `@astrojs/rss` `^4.0.19`, `@astrojs/sitemap` `^3.7.4`, `@astrojs/check` `^0.9.12`.
- Every URL in `tests/fixtures/hugo-urls.txt` must resolve on the built site or match a rule in `public/_redirects`. Nothing public may 404.
- Post and page bodies migrate verbatim. No new human-facing prose is written by any task; where chrome text is unavoidable (nav labels, 404 body, home intro, footer) it is the exact text given in this plan, and anything beyond that goes through `page-authoring`.
- `draft: true` entries never appear in a production build, in listings, in tags, in RSS, or in the sitemap.
- `unlisted: true` entries are built but excluded from listings, tags, RSS, sitemap, and carry `<meta name="robots" content="noindex, nofollow">`.
- RSS stays at `/index.xml`. Tag URLs stay `/tags/<slug>/` with Hugo's slug rule (lowercase, spaces to hyphens).
- No secrets in the repo. The PostHog key is a public token and is committed on purpose.
- `CLOUDFLARE_ACCOUNT_ID=fd15b6bd9ab1cec50b0832c91d7cf53a` (Setherd14) is pinned in any wrangler script in `package.json`. Never exported globally.
- Banned: litellm. New dependencies pass `npm audit --audit-level=high`.
- Hosting is Cloudflare Pages, existing project `personal-blog`. No Workers config, no `wrangler.jsonc` with `main`.
- Visual design: the spec's "Visual design" section and the four reference artboards in `docs/superpowers/design/`. Copy exact values from them (sizes, colours, spacing, weights); never round to a framework default. Fonts: Bricolage Grotesque (500, 800), IBM Plex Sans (400, 500, 600), IBM Plex Mono (400, 500) from Google Fonts, one `<link>` in the base layout.
- No edits under `archive/hugo` after Task 1.

## Review Focus

1. A post with no `description` (16 of 17 posts) renders, has no empty `<meta name="description">`, and its RSS item uses the title only. Test in Task 4.
2. Tags that differ only by case or contain spaces ("Cloudflare R2", "DIY" vs "diy") merge into one `/tags/<slug>/` page. Test in Task 3.
3. A draft post is absent from `dist/` in a production build, including from `/tags/` pages whose only member is that draft. Test in Task 8.
4. A video with no `extras`, `products`, `mentioned`, or `chapters` renders without empty headings or a stray disclosure sentence. Test in Task 5.
5. A request to `/ingest//evil.example.com/x` returns 400 and is never proxied. Test in Task 7.

---

### Task 1: Archive the Hugo site and scaffold Astro

**Files:**
- Create: `package.json` (replace), `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `src/styles/global.css`, `src/env.d.ts`, `.gitignore` (replace), `.nvmrc`
- Delete: `hugo.yaml`, `archetypes/`, `assets/`, `layouts/`, `scripts/`, `themes/`, `.gitmodules`, `.hugo_build.lock`, `static/cv/`, `package-lock.json`, `public/` (Hugo build output)
- Keep untouched for Task 2: `content/`, `static/*.png`, `static/*.svg`, `static/*.ico`, `static/site.webmanifest`, `docs/`, `CLAUDE.md`

**Interfaces:**
- Produces: a branch `astro-rebuild` where `npm run build` emits `dist/` and `npm test` runs Vitest. Path alias `@/*` to `src/*`.

- [ ] **Step 1: Archive**

```bash
git tag hugo-final main
git branch archive/hugo main
git push origin hugo-final archive/hugo
git switch -c astro-rebuild
```

Expected: `git ls-remote --heads origin archive/hugo` prints one line.

- [ ] **Step 2: Remove the Hugo tree**

```bash
git rm -r -q hugo.yaml archetypes assets layouts scripts .gitmodules package.json package-lock.json static/cv
git rm -r -q --cached themes || true; rm -rf themes public .hugo_build.lock
```

Expected: `ls` shows `content docs static CLAUDE.md .gitignore .git`.

- [ ] **Step 3: Scaffold**

Write `package.json` with name `bytemycache`, `"type": "module"`, scripts: `dev: astro dev`, `build: astro check && astro build`, `preview: astro preview`, `test: vitest run`, `typecheck: astro check`, `format: prettier --write .`. Dependencies: `astro`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@tailwindcss/vite`, `tailwindcss`, `@tailwindcss/typography`. Dev: `@astrojs/check`, `typescript`, `vitest`, `prettier`, `prettier-plugin-astro`. Then `npm install`.

`astro.config.mjs`: `site: 'https://bytemycache.com'`, `trailingSlash: 'always'`, `integrations: [mdx(), sitemap({ filter })]` where `filter` is imported from `./src/lib/sitemap.mjs` (Task 6 writes it; stub it now as `export const filter = () => true`), `vite: { plugins: [tailwindcss()] }`.

`tsconfig.json`: extends `astro/tsconfigs/strict`, paths `@/*` to `src/*`, `include: ["src", "functions", "tests"]`.

`vitest.config.ts`: `getViteConfig` from `astro/config`, test include `['src/**/*.test.ts', 'functions/**/*.test.ts', 'tests/**/*.test.ts']`.

`src/styles/global.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
@theme {
  --color-ground: #f2f4f5;   --color-ground-dark: #0f1f2a;
  --color-ink: #172f3e;      --color-ink-dark: #f2f4f5;
  --color-muted: #46606f;    --color-muted-dark: #9fb3bf;
  --color-secondary: #2d4555; --color-secondary-dark: #c3ccd2;
  --color-rule: #c7ced3;     --color-rule-dark: #2b4557;
  --color-link: #c9431f;     --color-link-hover: #a2341a;
  --color-link-dark: #ff8a6b; --color-link-hover-dark: #ffa78f;
  --color-accent: #ff8a6b;
  --font-display: "Bricolage Grotesque", system-ui, sans-serif;
  --font-sans: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --radius-*: initial;
}
```

Values are the spec's; `--radius-*: initial` removes Tailwind's radius scale because the design has no rounded corners except the circular logo.

`.gitignore`: `node_modules/`, `dist/`, `.astro/`, `.wrangler/`, `.dev.vars`, `.DS_Store`. `.nvmrc`: `22`.

- [ ] **Step 4: Smoke page and verify**

Write `src/pages/index.astro` containing only `<html><body><h1>byteMyCache</h1></body></html>` (Task 4 replaces it).

Run: `npm run build && ls dist/index.html && npm test`
Expected: build succeeds, `dist/index.html` exists, Vitest reports "No test files found" exit 0 (add `passWithNoTests: true` to the Vitest config).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: archive Hugo site, scaffold Astro 7"
```

---

### Task 2: Migrate content

**Files:**
- Create (temporary): `scripts/migrate-hugo.mjs`, `scripts/migrate-hugo.test.ts`
- Create: `src/content/posts/**`, `src/content/videos/*.md`, `src/content/pages/*.{md,mdx}`, `src/components/BookMe.astro`
- Move: `static/{*.png,*.svg,*.ico,site.webmanifest}` to `public/`
- Delete at the end: `content/`, `static/`, `scripts/`

**Interfaces:**
- Produces: content files whose frontmatter matches the schemas in Task 3 exactly:
  - posts: `title, description?, date, updated?, draft, author, tags[], series?: {name, part}, cover?: {image, alt}, unlisted, youtubeIds?[]`
  - videos: `title, description, date, youtubeId, extras?: [{label, youtubeId}], series?, tags[], products?: [{label, url}], mentioned?: [{label, url}], chapters?: [{time, label}], relatedPosts?[], draft, unlisted`
  - pages: `title, description?, unlisted, noindex`

- [ ] **Step 1: Write the failing tests**

`scripts/migrate-hugo.test.ts`, importing `convertFrontmatter(raw: string, kind: 'post' | 'video' | 'page'): { data: Record<string, unknown>; body: string }` from `./migrate-hugo.mjs`:

```ts
test('toml frontmatter converts and drops hugo-only keys', () => {
  const { data } = convertFrontmatter(`+++\ntitle = 'About'\ndraft = false\ncomments = false\nsearchHidden = true\n+++\n\nbody`, 'page');
  expect(data).toEqual({ title: 'About', unlisted: false, noindex: false });
});
test('author array becomes string, categories merge into tags', () => {
  const { data } = convertFrontmatter(`---\ntitle: X\ndate: 2023-02-03T12:09:50-06:00\nauthor: ["Seth Brasile"]\ntags: ["powershell", "IT"]\ncategories: ["Powershell"]\nshowToc: true\n---\n`, 'post');
  expect(data.author).toBe('Seth Brasile');
  expect(data.tags).toEqual(['powershell', 'IT']);           // duplicate by slug dropped
  expect(data).not.toHaveProperty('categories');
  expect(data).not.toHaveProperty('showToc');
  expect(data.draft).toBe(false);
});
test('cover image path is rewritten to a co-located relative path', () => {
  const { data } = convertFrontmatter(`---\ntitle: X\ndate: 2023-07-12T12:57:56-05:00\ncover:\n  image: "posts/images/homepod.webp"\n---\n`, 'post');
  expect(data.cover).toEqual({ image: './images/homepod.webp', alt: 'X' });
});
test('video ids split into youtubeId and extras', () => {
  const { data } = convertFrontmatter(`---\ntitle: V\ndate: 2024-07-07T15:50:47-05:00\nids: ['a', 'b', 'c']\ndescription: d\n---\n`, 'video');
  expect(data.youtubeId).toBe('a');
  expect(data.extras).toEqual([{ label: 'Part 2', youtubeId: 'b' }, { label: 'Part 3', youtubeId: 'c' }]);
});
test('body image references are rewritten', () => {
  const { body } = convertFrontmatter(`---\ntitle: X\ndate: 2014-01-01\n---\n![a](/posts/images/x.gif) ![b](wan-rule.png)`, 'post');
  expect(body).toBe(`![a](./images/x.gif) ![b](./images/wan-rule.png)`);
});
```

Author's call on the extras labels: the spec says take them from YouTube oEmbed. oEmbed is a network call in a one-shot script; use `Part 2`/`Part 3` here and let Step 4 overwrite the labels with the oEmbed titles.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run scripts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `scripts/migrate-hugo.mjs`**

Exports `convertFrontmatter` and a `main()` that runs when invoked directly. Use `js-yaml` for YAML and `@iarna/toml` (or `smol-toml`) for TOML; both as devDependencies, removed with the script. Mapping rules:

- TOML (`+++`) and YAML (`---`) both accepted.
- Drop: `comments, searchHidden, showToc, showCodeCopyButtons, categories, keywords, ids`.
- `author`: array to first element; default `Seth Brasile`.
- `tags`: original tags plus categories, deduplicated by `slugifyTag` (lowercase, trim, spaces to `-`); keep the first spelling seen.
- `draft`: default `false`. `unlisted`: default `false`. pages: `noindex` default `false`.
- `cover.image` string to `{ image: './images/<basename>', alt: <title> }`.
- video: `ids[0]` to `youtubeId`, rest to `extras`.
- body: `](/posts/images/<f>)` and `](<bare>.png|jpg|jpeg|gif|webp)` to `](./images/<f>)`.
- Placement: single-file posts become `src/content/posts/<slug>/index.md` with their referenced images copied into `src/content/posts/<slug>/images/`; bundles move as-is. Videos to `src/content/videos/<slug>.md`. Pages `about, privacy, terms, cookies, examples-of-my-documentation` to `src/content/pages/<slug>.md`; `contact` to `src/content/pages/contact.mdx` with the `{{< book-me >}}` line replaced by `<BookMe />` and an `import BookMe from '@/components/BookMe.astro';` line after the frontmatter. Skip `hire, cv, coming-soon, my-candida-treatment-plan, search`.
- Date: keep the ISO string; Zod coerces.
- Fail loudly on any image reference whose file does not exist.

`src/components/BookMe.astro`: the exact iframe + script from `layouts/shortcodes/book-me.html` (read it from `archive/hugo` with `git show archive/hugo:layouts/shortcodes/book-me.html`).

- [ ] **Step 4: Run the migration and apply oEmbed labels**

Run: `node scripts/migrate-hugo.mjs && ls src/content/posts | wc -l && ls src/content/videos src/content/pages`
Expected: 17 post dirs, 1 video, 6 pages.

For each extra in the video file run `curl -s "https://www.youtube.com/oembed?url=https://youtu.be/<id>&format=json"` and set `label` to the returned `title`. If oEmbed fails, keep `Part N` and note it in the commit message.

Move `static/{android-chrome-192x192.png,android-chrome-512x512.png,apple-touch-icon.png,bytemycachelogo.png,bytemycachelogo.svg,bytemycachelogo_0.5x.png,favicon-16x16.png,favicon-32x32.png,favicon.ico,site.webmanifest}` to `public/`.

- [ ] **Step 5: Run tests, then delete the script**

Run: `npx vitest run scripts`
Expected: PASS (5 tests).

Then `git rm -r content static scripts`, remove `js-yaml` and the TOML package from `package.json`, `npm install`. Record the mapping rules in the commit body (they are the only lasting record of the migration).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "content: migrate Hugo posts, video, and pages to Astro collections"
```

---

### Task 3: Content collections and query helpers

**Files:**
- Create: `src/content.config.ts`, `src/lib/content.ts`, `src/lib/content.test.ts`, `src/lib/site.ts`

**Interfaces:**
- Produces:
  - `slugifyTag(tag: string): string`
  - `getPublishedPosts(): Promise<CollectionEntry<'posts'>[]>` (no drafts in prod, newest first)
  - `getListedPosts()`, `getListedVideos()`, `getPublishedVideos()` (same, also no `unlisted`)
  - `getTagIndex(): Promise<Map<string, { name: string; posts: CollectionEntry<'posts'>[]; videos: CollectionEntry<'videos'>[] }>>` keyed by slug, listed entries only
  - `postPath(entry): string` returns `/posts/<id>/`, `videoPath(entry)` returns `/videos/<id>/`, `tagPath(slug)` returns `/tags/<slug>/`
  - `SITE = { name: 'byteMyCache', url: 'https://bytemycache.com', description: 'Web, Infrastructure, Devops, Automation, Homelab', youtube: 'https://youtube.com/@byteMyCache', store: 'https://store.bytemycache.com', github: 'https://github.com/sethbrasile', coffee: 'https://www.buymeacoffee.com/sethbrasile', rss: '/index.xml' }`

- [ ] **Step 1: Write the failing tests**

`src/lib/content.test.ts`:

```ts
test('slugifyTag matches hugo urlize', () => {
  expect(slugifyTag('Cloudflare R2')).toBe('cloudflare-r2');
  expect(slugifyTag('DIY')).toBe('diy');
  expect(slugifyTag('old content rescued with the wayback machine')).toBe('old-content-rescued-with-the-wayback-machine');
  expect(slugifyTag('  IT ')).toBe('it');
});
test('postPath and videoPath use trailing slashes', () => {
  expect(postPath({ id: 'email-is-stupid' } as any)).toBe('/posts/email-is-stupid/');
  expect(videoPath({ id: 'x' } as any)).toBe('/videos/x/');
  expect(tagPath('diy')).toBe('/tags/diy/');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement `src/content.config.ts`**

Three `defineCollection`s with `glob` loaders: posts `pattern: '**/index.md', base: './src/content/posts', generateId: ({ entry }) => entry.replace(/\/index\.md$/, '')`; videos `pattern: '*.md', base: './src/content/videos'`; pages `pattern: '*.{md,mdx}', base: './src/content/pages'`. Schemas exactly as the Task 2 Interfaces block, `date: z.coerce.date()`, `cover: z.object({ image: image(), alt: z.string() }).optional()`, `series: z.object({ name: z.string(), part: z.number().int() }).optional()`, `chapters: z.array(z.object({ time: z.string(), label: z.string() })).optional()`.

- [ ] **Step 4: Implement `src/lib/content.ts` and `src/lib/site.ts`**

Drafts are excluded when `import.meta.env.PROD`. `getTagIndex` builds from listed posts and videos, name = first spelling seen.

- [ ] **Step 5: Verify**

Run: `npx vitest run src/lib && npx astro sync && npx astro check`
Expected: tests PASS; `astro sync` reports 17 posts, 1 video, 6 pages with no schema errors; `astro check` 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/content.config.ts src/lib
git commit -m "feat: content collections, schemas, and query helpers"
```

---

### Task 4: Layout, home, posts, pages, 404

**Files:**
- Create: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeToggle.astro`, `src/components/PostCard.astro`, `src/components/TagList.astro`, `src/pages/index.astro` (replace), `src/pages/posts/index.astro`, `src/pages/posts/[...id].astro`, `src/pages/[slug].astro`, `src/pages/404.astro`
- Test: `tests/pages.test.ts` (builds once in `beforeAll`, reads `dist/`)

**Interfaces:**
- Consumes: Task 3 helpers and `SITE`.
- Produces: `BaseLayout` props `{ title: string; description?: string; canonical?: string; noindex?: boolean; ogImage?: string }`. Renders `<meta name="description">` only when `description` is a non-empty string. `<slot name="head">` for extra head tags. `Header.astro` has two variants via prop `variant: 'masthead' | 'compact'` (home uses the masthead with the 56px logo and 48px wordmark; every other page the compact 40px/28px header).

Chrome text, exact: header links `Videos`, `Posts`, `About`, `Store`. Masthead tagline `Web · Infrastructure · DevOps · Automation · Homelab`. Footer links `YouTube`, `GitHub`, `Buy Me a Coffee`, `RSS`, `Contact`, `Privacy`, `Terms`, `Cookies`, and `© <year> byteMyCache`. Home: kicker `Latest video`, section `Latest posts` with link `All posts`, store band heading `Kits, cases and parts from the videos` and button `Visit the store`, hero buttons `Watch` and `Show notes and parts`. Post page kicker `Post · <date> · <author>`, aside `On this page`, section `More posts`. 404 body: heading `Page not found`, text `That page doesn't exist. Try the videos or posts.` with those two words linked.

Design reference: `docs/superpowers/design/OptionB.dc.html` (home, light), `HomeBDark.dc.html` (home, dark), `PostB.dc.html` (post). Port the markup structure and every inline value into Tailwind utilities or the token file; the artboards are the source of truth for sizes and colours. The home hero shows the latest listed video with its YouTube thumbnail and the coral offset shadow; the store band lists the products of the latest video (`products` field) with `[PRICE]` omitted (no prices on the site).

- [ ] **Step 1: Write the failing tests**

`tests/pages.test.ts` uses `execSync('npx astro build')` in `beforeAll` (timeout 180s) and `fs.readFileSync` on `dist/`:

```ts
test('post without description has no empty meta description', () => {
  const html = read('dist/posts/email-is-stupid/index.html');
  expect(html).not.toMatch(/<meta name="description" content="">/);
  expect(html).not.toMatch(/<meta name="description"/);
});
test('page bundle images are optimised and served', () => {
  const html = read('dist/posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1/index.html');
  expect(html).toMatch(/<img[^>]+src="\/_astro\/wan-rule\.[A-Za-z0-9_-]+\.(png|webp)"/);
});
test('home lists newest post first and links the store', () => {
  const html = read('dist/index.html');
  expect(html.indexOf('/posts/some-great-mac-apps-to-check-out/')).toBeLessThan(html.indexOf('/posts/fix-a-homepod-mini-that-wont-turn-on/'));
  expect(html).toContain('href="https://store.bytemycache.com"');
});
test('404 page exists and is noindex', () => {
  expect(read('dist/404.html')).toContain('noindex');
});
test('design tokens and fonts are in place, light is default', () => {
  const html = read('dist/index.html');
  expect(html).toMatch(/fonts\.googleapis\.com\/css2\?family=Bricolage\+Grotesque/);
  expect(html).toContain('Web · Infrastructure · DevOps · Automation · Homelab');
  expect(html).toContain('Kits, cases and parts from the videos');
  expect(html).not.toMatch(/<html[^>]*data-theme="dark"/);
});
test('mdx page renders the booking component', () => {
  expect(read('dist/contact/index.html')).toContain('link.tenorcreative.com/widget/booking/');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/pages.test.ts`
Expected: FAIL (routes missing, files not found).

- [ ] **Step 3: Implement layout and components**

`BaseLayout.astro` loads `@/styles/global.css`, the Google Fonts `<link>` (families and weights from Global Constraints, `display=swap`), favicons from `public/`, `<link rel="alternate" type="application/rss+xml" href="/index.xml">`, Open Graph title/description/url, `Analytics` slot left as a comment for Task 7. Theme: `data-theme` is set by an inline script from `localStorage.theme`, else `prefers-color-scheme`; light is the default when neither applies. `Header.astro` renders the logo (`/bytemycachelogo.svg`, alt `byteMyCache`) and the four links; `Footer.astro` the eight links. `ThemeToggle.astro` toggles `data-theme` and writes `localStorage.theme`. `PostCard.astro` props `{ entry: CollectionEntry<'posts'> }`: title link, date (`toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })`), description if present, `TagList`. `TagList.astro` props `{ tags: string[] }` linking via `tagPath(slugifyTag(t))`.

- [ ] **Step 4: Implement pages**

`posts/[...id].astro`: `getStaticPaths` from `getPublishedPosts()`, `render(entry)` for `Content` and `headings`; article with `prose dark:prose-invert` class, cover image via `<Image>` when present, series prev/next links when `series` is set (same `series.name`, `part ± 1`), tag list. `[slug].astro`: `getStaticPaths` from `getCollection('pages')`, passes `noindex: entry.data.noindex || entry.data.unlisted`. `posts/index.astro`: all listed posts. `index.astro`: 5 latest videos (Task 5 component; until then render titles as links) and 5 latest posts.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/pages.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src tests
git commit -m "feat: base layout, home, posts, static pages, 404"
```

---

### Task 5: Video pages

**Files:**
- Create: `src/components/YouTubeEmbed.astro`, `src/components/VideoExtras.astro`, `src/components/LinkList.astro`, `src/components/VideoCard.astro`, `src/pages/videos/index.astro`, `src/pages/videos/[id].astro`
- Modify: `src/pages/index.astro` (use `VideoCard`)
- Test: `tests/videos.test.ts`

**Interfaces:**
- Consumes: `getListedVideos`, `getPublishedVideos`, `videoPath`, `BaseLayout`.
- Produces: `YouTubeEmbed` props `{ id: string; title: string }` rendering a click-to-load facade (thumbnail `https://i.ytimg.com/vi/<id>/hqdefault.jpg`, a play button, swaps in `https://www.youtube-nocookie.com/embed/<id>?autoplay=1` on click; `<noscript>` fallback to a plain iframe). `LinkList` props `{ heading: string; items: { label: string; url: string }[]; disclosure?: string }` renders nothing when `items` is empty.

Disclosure text, exact (from the spec): `Note: the following are Amazon affiliate links. If you use these links to purchase, I get a small commission. It doesn't cost you anything extra, but it helps me out a lot. Thanks!` Headings, exact: `Products in my store`, `Products mentioned`, `Extras`, `Chapters`, `Related posts`.

- [ ] **Step 1: Write the failing tests**

`tests/videos.test.ts` (same `beforeAll` build pattern; share it via `tests/build.ts` exporting `ensureBuilt()` and `read()`):

```ts
test('video page embeds the main video and lists extras', () => {
  const html = read('dist/videos/your-kids-can-use-magic-wands-to-control-your-home/index.html');
  expect(html).toContain('i.ytimg.com/vi/6ElDx8rN_Po/');
  expect(html).toContain('Extras');
  expect(html).toContain('R90adjnIfpQ');
  expect(html).toContain('pUkgUDp6Cys');
});
test('store and affiliate blocks render with the disclosure once', () => {
  const html = read('dist/videos/your-kids-can-use-magic-wands-to-control-your-home/index.html');
  expect(html).toContain('store.bytemycache.com/products/esp8266-case-ir');
  expect(html.match(/Amazon affiliate links/g)?.length).toBe(1);
});
test('a video with no optional sections renders none of their headings', async () => {
  // fixture written by the test into src/content/videos/_fixture-min.md? No: glob pattern '*.md' would include it.
  // Instead render the component directly:
  const { experimental_AstroContainer: C } = await import('astro/container');
  const c = await C.create();
  const html = await c.renderToString((await import('@/components/LinkList.astro')).default, { props: { heading: 'Products mentioned', items: [], disclosure: 'x' } });
  expect(html.trim()).toBe('');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/videos.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement components and pages**

`videos/[id].astro` follows `docs/superpowers/design/VideoB.dc.html`: `getStaticPaths` from `getPublishedVideos()`; kicker `Video · <date>`, 64px headline, full-width `YouTubeEmbed` with the 16px coral offset shadow, then a two-column grid: article (description at 20px, `Content` show notes, `Chapters` as a plain list, `Extras` as thumbnail cards each a `YouTubeEmbed` facade with its label, `Related posts`, tag chips) and an aside (`LinkList` for `products` styled as the coral box with heading `Products in my store` and the `Visit the store` button; `LinkList` for `mentioned` with heading `Products mentioned` and the disclosure). `VideoCard.astro` props `{ entry }` shows the thumbnail, title, date. `videos/index.astro` lists all listed videos as cards.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests`
Expected: PASS (all tests so far).

- [ ] **Step 5: Commit**

```bash
git add src tests
git commit -m "feat: video pages with extras, store and affiliate blocks"
```

---

### Task 6: Tags, RSS, sitemap, redirects, headers

**Files:**
- Create: `src/pages/tags/index.astro`, `src/pages/tags/[tag].astro`, `src/pages/index.xml.ts`, `src/lib/sitemap.mjs` (replace stub), `src/lib/sitemap.test.ts`, `public/_redirects`, `public/_headers`, `public/robots.txt`
- Test: `tests/feeds.test.ts`

**Interfaces:**
- Consumes: `getTagIndex`, `getListedPosts`, `getListedVideos`.
- Produces: `filter(page: string): boolean` in `src/lib/sitemap.mjs` returning `false` for `https://bytemycache.com/404/` and for any URL in the exported `UNLISTED_PATHS: string[]` (populated at build by `getStaticPaths` writing nothing; keep it a module-level list the pages collection does not need today, so `filter` only excludes `/404/`).

Author's call: because `astro.config.mjs` cannot query collections, unlisted pages are kept out of the sitemap by rendering them with `noindex` and by the fact that no unlisted entry exists at launch. Task 8's inventory test asserts the sitemap contains no `unlisted` entry so the gap is caught the day one is added.

- [ ] **Step 1: Write the failing tests**

`src/lib/sitemap.test.ts`:
```ts
test('sitemap filter drops the 404 page', () => {
  expect(filter('https://bytemycache.com/404/')).toBe(false);
  expect(filter('https://bytemycache.com/posts/email-is-stupid/')).toBe(true);
});
```

`tests/feeds.test.ts`:
```ts
test('rss lives at /index.xml and contains posts and videos newest first', () => {
  const xml = read('dist/index.xml');
  expect(xml).toContain('<link>https://bytemycache.com/posts/some-great-mac-apps-to-check-out/</link>');
  expect(xml).toContain('<link>https://bytemycache.com/videos/your-kids-can-use-magic-wands-to-control-your-home/</link>');
  expect(xml).toContain('<language>en-us</language>');
  expect(xml).not.toContain('avoiding-escape-hell-in-powershell');
});
test('tag pages merge categories and use hugo slugs', () => {
  expect(exists('dist/tags/cloudflare-r2/index.html')).toBe(true);
  expect(exists('dist/tags/web-services/index.html')).toBe(true);   // was a Hugo category
  expect(exists('dist/tags/diy/index.html')).toBe(true);
  expect(read('dist/tags/index.html')).toContain('/tags/powershell/');
});
test('redirects file carries every rule from the spec', () => {
  const r = read('dist/_redirects');
  for (const rule of ['/cv/* https://sethbrasile.com/ 301', '/hire/ https://sethbrasile.com/ 301', '/search/ /posts/ 301', '/authors/* /about/ 301', '/categories/* /tags/:splat 301', '/coming-soon/ / 301', '/my-candida-treatment-plan/ / 301']) expect(r).toContain(rule);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/sitemap.test.ts tests/feeds.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

`tags/[tag].astro`: `getStaticPaths` from `getTagIndex()`; page lists posts then videos. `tags/index.astro`: every tag with its count. `index.xml.ts`: `GET` using `@astrojs/rss`, `title: SITE.name`, `description: SITE.description`, items = listed posts and videos merged and sorted by date desc, `customData: '<language>en-us</language>'`, each item `{ title, pubDate: date, description: description ?? undefined, link }`.

`public/_redirects` (exact):
```
/cv/            https://sethbrasile.com/  301
/cv/*           https://sethbrasile.com/  301
/hire/          https://sethbrasile.com/  301
/search/        /posts/                   301
/authors/*      /about/                   301
/categories/*   /tags/:splat              301
/coming-soon/   /                         301
/my-candida-treatment-plan/   /           301
/tags/candida/      /tags/  301
/tags/overgrowth/   /tags/  301
/tags/health/       /tags/  301
/tags/supplements/  /tags/  301
```
(The last four are tags whose only member was the removed page; Task 8 confirms the list.)

`public/_headers`: the salon `_headers` with the CSP adjusted: `script-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: https://i.ytimg.com; frame-src https://www.youtube-nocookie.com https://link.tenorcreative.com; style-src 'self' 'unsafe-inline'`, plus the `/_astro/*` immutable cache rule. Add `https://link.tenorcreative.com` to `script-src` for the booking widget on `/contact/`.

`public/robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://bytemycache.com/sitemap-index.xml`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src public tests
git commit -m "feat: tags, RSS at /index.xml, sitemap, redirects, headers"
```

---

### Task 7: PostHog analytics and ingest proxy

**Files:**
- Create: `src/data/analytics.ts`, `src/components/Analytics.astro`, `functions/ingest/[[path]].ts`, `functions/ingest/resolveUpstream.test.ts`
- Modify: `src/layouts/BaseLayout.astro` (render `<Analytics />` in `<head>`)

**Interfaces:**
- Consumes: nothing new.
- Produces: `POSTHOG_KEY` (empty string until Seth supplies the new project's token), `POSTHOG_PROD_HOST = 'bytemycache.com'`, `POSTHOG_API_PATH = '/ingest'`; `resolveUpstream(requestUrl: string): URL | null`.

- [ ] **Step 1: Write the failing test**

`functions/ingest/resolveUpstream.test.ts`:
```ts
test('static goes to assets host, capture to api host', () => {
  expect(resolveUpstream('https://bytemycache.com/ingest/static/array.js')?.href).toBe('https://us-assets.i.posthog.com/static/array.js');
  expect(resolveUpstream('https://bytemycache.com/ingest/e/?ip=1')?.href).toBe('https://us.i.posthog.com/e/?ip=1');
});
test('doubled separators are rejected', () => {
  expect(resolveUpstream('https://bytemycache.com/ingest//evil.example.com/x')).toBeNull();
  expect(resolveUpstream('https://bytemycache.com/ingest/a//b')).toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run functions`
Expected: FAIL.

- [ ] **Step 3: Copy the three files from lisa-may-salon**

`cp ~/dev/ppmc-client-sites/lisa-may-salon/functions/ingest/'[[path]].ts' functions/ingest/`, and the two analytics files, then edit: `POSTHOG_KEY = ''` with a comment `// Set to the byteMyCache project token once Seth creates the project (PPMC Clients org).`, `POSTHOG_PROD_HOST = 'bytemycache.com'`, header comment updated to this site. Keep the `outbound_click` capture (store and affiliate clicks are the goal). Drop the `contact_click` branch's `/book/` case; keep `tel/sms/mailto`.

- [ ] **Step 4: Run tests and verify the snippet is gated**

Run: `npx vitest run && npx astro build && grep -c posthog dist/index.html`
Expected: tests PASS; grep prints `0` because the key is empty (the component renders nothing).

- [ ] **Step 5: Commit**

```bash
git add src functions
git commit -m "feat: PostHog analytics (gated on key) and same-origin ingest proxy"
```

---

### Task 8: URL inventory test

**Files:**
- Create: `tests/fixtures/hugo-urls.txt`, `tests/url-inventory.test.ts`, `tests/redirects.ts`

**Interfaces:**
- Produces: `matchRedirect(rules: string, path: string): string | null` in `tests/redirects.ts` implementing Cloudflare Pages `_redirects` matching for exact paths, `*` suffix with `:splat`, and placeholder-free rules.

- [ ] **Step 1: Capture the inventory**

Run: `curl -s https://bytemycache.com/sitemap.xml | grep -oE '<loc>[^<]+' | sed 's/<loc>//' | sort > tests/fixtures/hugo-urls.txt && wc -l tests/fixtures/hugo-urls.txt`
Expected: 83 lines (the count captured on 2026-10-26). Commit the fixture; it is the contract.

- [ ] **Step 2: Write the failing tests**

```ts
const urls = read('tests/fixtures/hugo-urls.txt').trim().split('\n').map(u => new URL(u).pathname);
const rules = read('public/_redirects');
test.each(urls)('%s is built or redirected', (path) => {
  const built = exists(`dist${path}index.html`);
  const target = matchRedirect(rules, path);
  expect(built || target !== null).toBe(true);
  if (target && target.startsWith('/')) expect(exists(`dist${target}index.html`)).toBe(true);
});
test('drafts are not built', () => {
  for (const d of ['avoiding-escape-hell-in-powershell', 'perplexity-solves-one-of-mankinds-worst-problems', 'powershell-code-delivery', 'the-hidden-goldmine-for-laid-off-developers-or-becoming-your-towns-webmaster-2.0', 'protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-4'])
    expect(exists(`dist/posts/${d}/index.html`)).toBe(false);
});
test('sitemap has no 404 and no unlisted entry', () => {
  const sm = read('dist/sitemap-0.xml');
  expect(sm).not.toContain('/404/');
  // every <loc> must be a listed route: posts, videos, tags, pages, lists
  for (const loc of sm.match(/<loc>[^<]+/g)!.map(s => s.slice(5)))
    expect(loc).toMatch(/^https:\/\/bytemycache\.com\/(posts|videos|tags|about|contact|privacy|terms|cookies|examples-of-my-documentation)?\/?.*\/$/);
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/url-inventory.test.ts`
Expected: at least the `matchRedirect` import fails; after writing it, expect failures that name the exact Hugo URLs still unhandled.

- [ ] **Step 4: Implement `tests/redirects.ts` and close every gap**

For each failing URL either confirm the page should exist (fix the route) or add a redirect rule to `public/_redirects`. Expected gaps from the inventory: `/authors/`, `/categories/`, `/tags/<removed>/` (covered by rules), `/videos/your-kids-can-use-magic-wands-to-control-your-home/` (must be built, same id).

- [ ] **Step 5: Run the whole suite**

Run: `npm run build && npm test`
Expected: all PASS, zero unhandled URLs.

- [ ] **Step 6: Commit**

```bash
git add tests public/_redirects
git commit -m "test: every Hugo URL is built or redirected"
```

---

### Task 9: CI, pre-commit, docs

**Files:**
- Create: `.github/workflows/ci.yml`, `.husky/pre-commit`, `.lintstagedrc`, `.prettierrc`, `.prettierignore`, `README.md`
- Modify: `CLAUDE.md` (rewrite), `package.json`

- [ ] **Step 1: CI**

`.github/workflows/ci.yml`: on `push` and `pull_request`; `actions/checkout@v4`, `actions/setup-node@v4` with `node-version-file: .nvmrc` and npm cache, `npm ci`, `npm audit --audit-level=high`, `npm run build`, `npm test`. No deploy step (Pages git integration deploys).

- [ ] **Step 2: Pre-commit**

Invoke the `setup-pre-commit` skill. Resulting `.husky/pre-commit`: `npx lint-staged`, `npm run typecheck`, `npm test`. `.prettierignore`: `dist`, `.astro`, `src/content/**/*.md` (migrated bodies stay byte-identical).

- [ ] **Step 3: Verify hooks and CI config**

Run: `npm run build && npm test && git commit --allow-empty -m "chore: verify pre-commit" && git reset --soft HEAD~1`
Expected: the hook runs lint-staged, typecheck, and tests and the empty commit succeeds.

- [ ] **Step 4: Rewrite `CLAUDE.md`**

Sections: what this is (content hub for the ByteMyCache channel, Astro, Pages project `personal-blog` in the Setherd14 account `fd15b6bd9ab1cec50b0832c91d7cf53a`); commands; content model (the three collections with their frontmatter, `draft` vs `unlisted`, how to add a post, a video, an extra); where redirects live and the inventory test; analytics (key location, hostname gate, proxy); deferred aims copied from the spec's non-goals; the design pass is next; `## Tech debt` with `description` missing on 16 posts (meta descriptions absent until Seth writes them through `page-authoring`). Link the spec and this plan. `README.md`: three lines, pointing at `CLAUDE.md`.

- [ ] **Step 5: Commit and push the branch**

```bash
git add -A
git commit -m "chore: CI, pre-commit hooks, project docs"
git push -u origin astro-rebuild
```

---

### Task 10: Cutover

Steps marked **(Seth)** are dashboard actions only Seth can do; the executor stops and asks at each one.

- [ ] **Step 1 (Seth): Switch Pages build settings**

In the Setherd14 Cloudflare account, Pages project `personal-blog`: framework preset Astro, build command `npm run build`, output directory `dist`, Node version `22` (env var `NODE_VERSION=22`). Production branch stays `main`.

- [ ] **Step 2: Preview**

Open a PR `astro-rebuild` to `main`. Pages builds a preview at `https://<hash>.personal-blog-4u8.pages.dev`.

Run against the preview: `for p in $(sed 's#https://bytemycache.com##' tests/fixtures/hugo-urls.txt); do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "https://<preview>$p")" "$p"; done | grep -v '^\(200\|301\)'`
Expected: empty output.

- [ ] **Step 3 (Seth): PostHog project**

Create project "byteMyCache" in the PPMC Clients org, paste the `phc_` token into `src/data/analytics.ts`, commit on the branch. Then create the dashboard per the PPMC analytics pattern (visitors, top pages, sources, outbound clicks by host).

- [ ] **Step 4: Merge**

Merge the PR. Pages deploys `main` to bytemycache.com.

- [ ] **Step 5: Verify live**

Run the Step 2 loop against `https://bytemycache.com`; open home, a post with images, the video page, a tag page, `/cv/` (expect 301 to sethbrasile.com), `/index.xml`; confirm a pageview arrives in PostHog from a real browser. Record the results in the PR.

- [ ] **Step 6 (Seth, after one clean day): Rename the repo**

GitHub: rename `personal-blog` to `bytemycache`. Then `git remote set-url origin https://github.com/sethbrasile/bytemycache.git`, move the checkout to `~/dev/bytemycache`, update `ppmc-claude-routines-and-schedules/scripts/repos.json` if it lists the repo, confirm the Pages GitHub connection still builds on push (reconnect if not).

- [ ] **Step 7: Close out**

Note in `CLAUDE.md` the live date. Next units of work, from the spec's deferred aims: subscribers and comments identity layer, store migration.
