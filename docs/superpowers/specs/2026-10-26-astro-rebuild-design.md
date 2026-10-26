# bytemycache.com rebuild: Hugo to Astro

Date: 2026-10-26
Status: reviewed (builder check done), open questions answered 2026-10-26, pending Seth's approval of the full document
Repo: `sethbrasile/personal-blog` (GitHub), local `~/dev/personal-blog`

## Intent

bytemycache.com becomes the content hub for the ByteMyCache YouTube channel.
It is its own brand, separate from Prickly Pear Marketing Co and from
sethbrasile.com. The channel has stalled because Seth has been tied up
elsewhere; the site should make it cheap to publish around each video and to
send viewers somewhere Seth owns.

The site has two jobs, in priority order:

1. Give every video a home on a domain Seth owns, with a tech blog around it
   on the same topics (web, infrastructure, devops, automation, homelab,
   smart home, DIY electronics).
2. Send people to the store (store.bytemycache.com, currently Fourthwall).

Only the content matters. The Hugo templates, the PaperMod theme, the custom
layouts and the CV build chain are not carried forward. The current repo
state is archived and the Astro site starts from a clean tree.

## Goals

- Migrate all existing posts and the video page to Astro, content verbatim.
- Every existing public URL keeps working (same path or a 301).
- A content model the video production pipeline can write into later
  without template changes: one markdown file per video, one per post.
- Up to current PPMC standards: Astro, Tailwind, Cloudflare Pages,
  PostHog analytics, pinned account id, pre-commit hooks, dependency
  audit.
- Deliberately plain, readable styling. The visual design is a separate
  later pass (the `/design` skill) that replaces looks without touching the
  content model.
- Simple enough that Seth can publish a post or a video page by adding one
  markdown file and pushing.

## Non-goals (documented aims, nothing built today)

These are recorded so the content model leaves room for them. None are in
scope for this build.

- **Store migration and expansion.** The store moves off Fourthwall and
  grows to many related products. Today the site only links to
  store.bytemycache.com and to specific product URLs from video pages.
- **Subscribers and mailing list.** A "known person" concept: sign up,
  receive new-video and new-post mail. Deferred.
- **Comments.** Giscus is dropped because it forces a GitHub login and the
  YouTube audience mostly has none. The site launches with no comments.
  A future comments system shares the identity layer with subscribers
  (one sign-in, likely better-auth on a Worker with D1, per PPMC defaults),
  so comments and the mailing list are one later project, not two widgets.
- **Visual design.** Done later with `/design`. Today's styling is a
  placeholder.
- **Search.** Dropped. 17 posts do not need it. Pagefind is the obvious
  add if the corpus grows.
- **Automated blog/social repurposing from the video pipeline.** Phase 3 of
  the ByteMyCache Production System design. The site only needs to accept
  the markdown that pipeline will eventually emit.

## Anti-goals

- Breaking inbound links. Video descriptions, old posts and external sites
  link to current URLs. Every current public URL must resolve.
- A theme. No PaperMod successor, no third-party Astro theme. Layouts are
  owned in-repo so the design pass has nothing to fight.
- Any new always-on job on the workstation or home lab. The site is static
  on Cloudflare Pages.
- Rewriting content. Posts migrate as they are. New chrome text (nav labels,
  home intro, meta descriptions) is copy and goes through `page-authoring`
  because the repo has a deploy target.

## Current state (recon, 2026-10-26)

- Hugo + PaperMod, 17 posts (6 drafts, 4 are a page bundle series on
  fail2ban + immutable reverse proxy), 1 video page with 3 YouTube ids,
  3 author pages (seth-brasile, matthew-weir, noah-weir), top-level pages:
  about, contact, hire, cv, privacy, terms, cookies, search, coming-soon,
  my-candida-treatment-plan (removed, see decisions).
- 32 images, about 3.4 MB, mostly under `content/posts/images/` plus
  bundle-local `images/` dirs.
- `/cv/` is generated from the sibling `../resume` repo via Node scripts.
  Superseded by sethbrasile.com.
- Comments: giscus. Analytics: self-hosted Umami. Both go.
- Deploy: Cloudflare Pages project `personal-blog` (`personal-blog-4u8.pages.dev`,
  custom domain bytemycache.com) in the **Setherd14 personal Cloudflare
  account** (`fd15b6bd9ab1cec50b0832c91d7cf53a`), git-connected, last deploy
  about four months ago. The bytemycache.com zone (`a5952f18b25948069b5ee028eb6db1a4`,
  Free plan) is in that **same Setherd14 account**, not in Seth Main
  (`6613cc7d5616272f77c29f031e34e30b`, Workers Paid) where PPMC work lives.
- store.bytemycache.com points at Fourthwall.
- sethbrasile.com does **not resolve** as of 2026-10-26 (no A record, no
  working nameservers). The `/cv/` and `/hire/` redirect targets are not
  live yet. See open questions.
- Socials in the current config: GitHub, YouTube `@byteMyCache`, Buy Me a
  Coffee, RSS at `/index.xml`.

## Decisions Seth made

- Astro, not the Nuxt default from the PPMC picker. Seth named Astro;
  PPMC brochure sites already run on it.
- Archive the current repo state and start over; only content carries.
- `/cv/` is superseded by sethbrasile.com. Redirect it there.
- One page per main-channel video. Supplemental videos (the two extra
  clips on the Magic page today, and future extras-channel videos) attach
  to the main video's page as `extras`, not as pages of their own. The
  Magic page stays one page at its current URL.
- No comments at launch. Better-than-giscus comes later with subscribers.
- The candida treatment page is removed from the site and the repo. The
  markdown was copied to the vault at `Personal/Candida Treatment Plan.md`
  on 2026-10-26. Not secret, so no history scrub; it just does not belong
  in the repo. The `unlisted` flag stays in the content model for future
  use.
- Hosting stays on Cloudflare Pages. Workers has been rejected each time
  it was proposed because nothing on this site needs it; Astro's `dist/`
  is the same either way, so a later move is a config change.
- Store, mailing list, and design are deferred aims, documented here.

## Calls made by the author of this document (Seth can overrule)

- **Keep:** tags, light/dark mode, an `author` field in frontmatter.
- **Drop:** client-side search, categories (fold into tags), author pages,
  the `coming-soon` page, the `hire` page (301 to sethbrasile.com; it leads
  with the agency and that belongs on Seth's personal site, not the channel
  brand), the giscus and Umami snippets, share buttons.
- **Hosting:** reuse the existing Cloudflare Pages project `personal-blog`
  in the **Setherd14 account** (`fd15b6bd9ab1cec50b0832c91d7cf53a`, Pages
  Free). The custom domain never detaches; cutover is a build-settings
  change (framework preset Astro, build `npm run build`, output `dist`)
  plus a push to `main`. Pages git integration builds every PR as a
  preview on `*.pages.dev`. `CLOUDFLARE_ACCOUNT_ID` is pinned to that id in
  any wrangler script in `package.json`. `www` via Redirect Rule.
- **Redirects** live in `public/_redirects` (Pages honours `_redirects`
  and `_headers`).
- **Styling:** Tailwind CSS v4, one base layout, system font stack, a
  single accent colour, prose via `@tailwindcss/typography`. Nothing more
  until the design pass.
- **Images:** move into Astro's `src/` so `<Image>` optimises them at
  build. Current paths under `/posts/images/...` get redirects only if any
  external link points at an image directly (unlikely; check with a crawl
  of the built Hugo site).
- **RSS:** keep the feed at `/index.xml` (existing subscribers), produced
  by `@astrojs/rss`, plus a sitemap via `@astrojs/sitemap`.
- **Draft handling:** all six draft posts are migrated as markdown with
  `draft: true`. They build locally only, never in production, same as
  Hugo today.
- **Affiliate disclosure:** the sentence already on the video page ("Note:
  the following are Amazon affiliate links. If you use these links to
  purchase, I get a small commission. It doesn't cost you anything extra,
  but it helps me out a lot. Thanks!") is reused verbatim as the automatic
  disclosure above any `mentioned` list. No new copy.
- **Repo name:** Seth chose to rename the GitHub repo to `bytemycache` at
  cutover. GitHub redirects the old name. The local checkout moves to
  `~/dev/bytemycache`, and the `ppmc-claude-routines-and-schedules` repo
  list is updated if it lists this repo. The Pages project keeps its
  internal name `personal-blog` (its `pages.dev` host is fixed; nobody
  sees it). After the rename the builder confirms the Pages GitHub
  connection still follows the repo, and reconnects it if not.
- **Repo:** keep the GitHub repo and its history. Tag the last Hugo commit
  `hugo-final`, push an `archive/hugo` branch, then replace the tree on
  `main` in one cutover commit. History of every post stays reachable.
  Renaming the repo is answered below.
- **Analytics:** PostHog per D007. Seth approved an **own project** in the
  PPMC Clients org for byteMyCache (different-in-kind property; uses one of
  the six slots). Projects are UI-only; Seth creates it and the builder
  commits the public key. The same-origin `/ingest` proxy is the Pages
  Function from the PPMC pattern (`functions/ingest/[[path]].ts`, copied
  from lisa-may-salon). That is the only server code in the repo.
- **Build and deploy:** Cloudflare Pages git integration deploys `main`
  and previews every PR. GitHub Actions runs the checks only: `astro
  check`, `astro build`, `npm audit --audit-level=high`. No deploy token
  in GitHub; nothing committed.
- **Pre-commit:** the PPMC `setup-pre-commit` skill; at minimum
  frontmatter schema validation (Astro content collections already fail
  the build on bad frontmatter) and no-secrets.

## Content model

Astro content collections with Zod schemas. Three collections.

### `posts`

```
title, description, date, updated?, draft (default false),
author (default "Seth Brasile"), tags[], series? (name + part number),
cover? (image + alt), unlisted (default false), youtubeIds[]? (optional,
for posts that accompany a video)
```

URL: `/posts/<slug>/`, slug from filename, matching Hugo's today.

### `videos`

One file per video. The production pipeline's publish package writes
here later.

```
title, description, date, youtubeId (required, the main-channel video),
extras[]? (label + youtubeId, supplemental clips rendered below the main
embed, may live on another channel),
series? (name + part number), tags[], thumbnail? (falls back to the
YouTube thumbnail), products[]? (label + url, for store links),
mentioned[]? (label + url, affiliate links with disclosure rendered
automatically), chapters[]? (time + label), relatedPosts[]? (post slugs),
draft, unlisted
```

Body: show notes, markdown.

URL: `/videos/<slug>/`. The existing "Control Your Home with Magic" page
has three ids; the first is the main video, the other two are
supplemental and become `extras`. Builder takes the extras' labels from
YouTube (oEmbed on the id, no new copy). The page keeps its URL and body.

### `pages`

about, contact, privacy, terms, cookies.

```
title, description?, unlisted (default false), noindex (default false)
```

URL: `/<slug>/`.

### `unlisted` semantics

An unlisted entry is built and served at its URL but is excluded from
every listing, the sitemap, the RSS feed, tag pages and home, and carries
`<meta name="robots" content="noindex, nofollow">`. Nothing uses it at
launch; it exists for share-by-link pages later. `draft` is stronger: not
built in production at all.

## Routes

```
/                         home: latest videos, latest posts, store CTA
/posts/                   all posts, newest first
/posts/<slug>/            post
/videos/                  all videos, newest first
/videos/<slug>/           video page
/tags/                    tag index
/tags/<tag>/              posts and videos sharing a tag
/about/ /contact/ /privacy/ /terms/ /cookies/
/index.xml                RSS (posts and videos)
/sitemap-index.xml        sitemap
/404                      real 404 page (PostHog soft-404 gotcha)
```

Redirects (`_redirects`, all 301). Seth chose to point `/cv/` and `/hire/`
at the sethbrasile.com root now, accepting that they dead-end until that
site is live:

```
/cv/            https://sethbrasile.com/
/cv/*           https://sethbrasile.com/
/hire/          https://sethbrasile.com/
/search/        /posts/
/authors/*      /about/
/categories/*   /tags/
/coming-soon/   /
/my-candida-treatment-plan/   /     (page removed; not secret, plain redirect)
```

Builder verifies the full Hugo URL inventory by building the archived
Hugo site once and diffing its `public/` URL list against the Astro
build plus the redirect map. Nothing public may 404.

## Navigation and chrome

Header: logo, Videos, Posts, About, Store (external). Footer: YouTube,
GitHub, Buy Me a Coffee, RSS, Contact, Privacy, Terms, Cookies. Store
link is the one persistent call to action; it is also rendered on every
video page's product block.

The existing logo assets (`bytemycachelogo.svg`, favicons, webmanifest)
carry over unchanged.

## Standards checklist (PPMC)

- Astro latest stable, TypeScript strict, Tailwind v4.
- Cloudflare Pages, existing project, `CLOUDFLARE_ACCOUNT_ID` pinned in
  any `package.json` wrangler script, never exported globally.
- PostHog with same-origin proxy, hostname-gated so previews and local dev
  never count, public key committed, `outbound_click` capture so store and
  affiliate clicks are measurable from day one.
- Real 404.
- `npm audit` clean at high severity; no banned libraries.
- No secrets in the repo; `.dev.vars` gitignored.
- Pre-commit hooks installed.
- Copy gate: any new human-facing text goes through `page-authoring`.
  Migrated post bodies are untouched and exempt.
- Project `CLAUDE.md` rewritten for the Astro repo; the Hugo one is
  archived with the tree.

## Cutover

1. Tag `hugo-final`, push `archive/hugo`.
2. Build the Astro site on a branch. Switch the Pages project's build
   settings to Astro (`npm run build`, output `dist`). The PR preview on
   `*.pages.dev` is the staging check.
3. Run the URL inventory diff against the preview; fix until zero public
   404s.
4. Merge to `main`. Pages deploys to bytemycache.com. Rollback is
   "rollback to previous deployment" in the Pages dashboard.
5. Verify live: home, a post, the video page with extras, a tag, `/cv/`
   redirect, RSS, PostHog events arriving.
6. Rename the GitHub repo and move the local checkout once the site has
   been live and clean for a day.

## Left to the builder

- Exact Astro integrations and versions, folder layout under `src/`.
- Series rendering (prev/next within a series).
- How YouTube embeds load (a click-to-load facade is preferred for speed,
  plain iframe is acceptable).
- Tag slug normalisation (current tags mix case and spaces).
- Whether to generate OG images or ship one static default (default is
  fine for launch).
- The redirect for direct image URLs, if the crawl finds any inbound links.
- Content of the rewritten `CLAUDE.md`.

## Questions answered by Seth (2026-10-26)

- Deploy account: Setherd14 (zone already there), existing Pages project.
- Hosting: Pages, not Workers (2026-10-26, second answer).
- Magic page: one page, extras attached (2026-10-26).
- Candida: removed from repo, cached in vault (2026-10-26).
- `/cv/` and `/hire/`: 301 to `https://sethbrasile.com/` now.
- PostHog: own project in the PPMC Clients org.
- Repo: rename to `bytemycache` at cutover.


