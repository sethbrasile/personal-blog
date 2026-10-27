# CLAUDE.md

Guidance for agents working in this repo.

## What this is

`byteMyCache` (https://bytemycache.com): the content hub for Seth Brasile's ByteMyCache YouTube channel. Videos, long-form posts, a store band that links to store.bytemycache.com. Static **Astro 7.4** site (Tailwind 4, "Maker Zine" design, light default plus dark mode). It replaced a Hugo/PaperMod site; every old URL is built or redirected.

- Spec: [docs/superpowers/specs/2026-10-26-astro-rebuild-design.md](docs/superpowers/specs/2026-10-26-astro-rebuild-design.md)
- Plan: [docs/superpowers/plans/2026-10-26-astro-rebuild.md](docs/superpowers/plans/2026-10-26-astro-rebuild.md)
- Design artboards: `docs/superpowers/design/`
- Hosting: Cloudflare Pages project `personal-blog` in the Setherd14 account `fd15b6bd9ab1cec50b0832c91d7cf53a` (zone bytemycache.com is in the same account). Pages, not Workers (Seth's standing decision). Pin `CLOUDFLARE_ACCOUNT_ID` inline on any wrangler command; never export it globally.

## Commands

```bash
npm run dev         # astro dev
npm run build       # astro check && astro build -> dist/ (must report 0 check errors)
npm test            # vitest; builds the site once per run (tests/global-setup.ts)
npm run typecheck   # astro check
npm run format      # prettier --write . (respects .prettierignore; lint-staged formats staged files on commit)
```

Node 22 (`.nvmrc`, `engines >=22.12`). Pre-commit (husky) runs a secrets scan (`scripts/check-secrets.sh`), `lint-staged`, `typecheck` and `test`. CI (`.github/workflows/ci.yml`) runs `npm audit --audit-level=high`, build and test; it never deploys.

## Content model

Collections are defined in `src/content.config.ts`. Helpers (published/listed filters, paths, tag index) are in `src/lib/content.ts`; site constants in `src/lib/site.ts`; dates go through one Chicago-time helper in `src/lib/format.ts`.

- **posts**: `src/content/posts/<slug>/index.md` plus co-located `images/`. Fields: `title`, `description?`, `date`, `updated?`, `draft`, `author`, `tags`, `series? {name, part}`, `cover? {image, alt}`, `unlisted`, `youtubeIds?`, `note?`. The slug is the folder name and is the URL (`/posts/<slug>/`).
- **videos**: `src/content/videos/<slug>.md`. Fields: `title`, `description`, `date`, `youtubeId`, `thumbnail?`, `extras? [{label, youtubeId}]`, `series?`, `tags`, `products? [{label, url}]`, `mentioned? [{label, url}]`, `chapters? [{time, label}]`, `relatedPosts? [slug]`, `draft`, `unlisted`.
- **pages**: `src/content/pages/*.md|mdx`. Fields: `title`, `description?`, `unlisted`, `noindex`.

How to:

- **Add a post**: create `src/content/posts/<slug>/index.md` with frontmatter; put images in `images/` and reference them relatively (they are optimised). Set `draft: true` while writing.
- **Add a video**: create `src/content/videos/<slug>.md` with `youtubeId`. The newest listed video is the home hero.
- **Add an extra** (additional YouTube video on a video page): add `{label, youtubeId}` to that video's `extras`.
- **Store products** (the three-product band on the video page and home): `products` on the video, `{label, url}` pointing at store.bytemycache.com product URLs.
- **Affiliate links**: `mentioned` on the video. The Amazon affiliate disclosure (`AFFILIATE_DISCLOSURE` in `src/lib/site.ts`) is rendered automatically with that list.
- **draft vs unlisted**: `draft: true` is excluded from production builds entirely (shown in `astro dev`). `unlisted: true` is built and reachable by URL but left out of lists, tags and RSS, and gets `noindex`. The sitemap exclusion is manual: add its full URL (e.g. `https://bytemycache.com/<path>/`) to `UNLISTED_PATHS` in `src/lib/sitemap.mjs`.
- Markdown runs through Astro 7's default Satteri processor. A local mdast plugin (`src/lib/mdast-strip-comments.mjs`) strips HTML comments (Hugo never rendered raw HTML). Shiki `langAlias` maps `basH` and `Powershell` (set in `astro.config.mjs`). Migrated bodies are byte-identical to the Hugo originals (R14); do not reformat them (`.prettierignore` covers them).
- New site chrome or page text is copy: it goes through `page-authoring` (the repo has a deploy target).

## Redirects and the URL inventory test

- `public/_redirects`: static (exact) rules first, then dynamic (splat/placeholder) rules. New rules must keep static-before-dynamic, because Cloudflare matches static rules first. Covers Hugo-era URLs, feeds, pagination, and `/cv/` `/hire/` to https://sethbrasile.com.
- `public/_headers`: security headers and CSP.
- Legacy Hugo image URLs stay as byte-identical copies under `public/posts/` (an old og:image has inbound links).
- `tests/fixtures/hugo-urls.txt` (live Hugo sitemap, 80 URLs) and `hugo-extra-urls.txt` (non-sitemap Hugo URLs) feed `tests/url-inventory.test.ts`: every URL must be built or redirected. `tests/redirects.ts` emulates Cloudflare `_redirects` (verified against `wrangler pages dev`). If you add a route or remove a page, this test tells you what broke.

## Analytics

- `src/data/analytics.ts`: `POSTHOG_KEY` (public client token, committed on purpose). Set to the byteMyCache project in the PPMC Clients org. Typed `string` so the key-aware tests typecheck; setting it to `''` ships no snippet at all.
- `src/components/Analytics.astro`: loads the snippet only when `location.hostname` is `bytemycache.com` (previews and dev stay out), against the same-origin `/ingest`.
- PostHog runs cookieless for every visitor (`cookieless_mode: 'always'`): nothing on the device, no consent banner in any region, replay off. The privacy and cookies pages depend on this; `analytics.test.ts` pins it. **The PostHog project setting "Cookieless server hash mode" must stay on**, or PostHog silently drops every event. Background: `docs/superpowers/research/2026-10-27-privacy-analytics-standards.md`.
- `functions/ingest/[[path]].ts`: Pages Function reverse proxy to PostHog (static assets host vs API host). The other Pages Function is `functions/api/contact.ts`.
- `src/components/analytics.test.ts` is key-aware: with an empty key it asserts no PostHog code in the build; with a key it asserts the snippet, host gate and `/ingest`.

## Contact form

- `src/components/ContactForm.astro` (no React): name, email, message. Cloudflare's Turnstile script loads and the widget renders only on the first focus of a field, so visitors who never touch the form load nothing from Cloudflare. Every visible string sits in one `TEXT` object at the top (agent drafts, not yet approved by Seth). The public site key is hardcoded in the component.
- `functions/api/contact.ts` (with `_lib/crm.ts`, `_lib/resend-fallback.ts`, from the `crm-contact-worker` skill): origin allow-list (apex, www, `personal-blog-4u8.pages.dev` and its subdomains, judged on the parsed hostname), Turnstile siteverify, then a signed lead to the CRM ingest endpoint. An empty `CRM_ACCOUNT_KEY` or missing `CRM_CLIENT_SECRET` means "no CRM": the lead goes straight to the Resend fallback email. Request validation is by hand (no zod).
- Secrets, set with `CLOUDFLARE_ACCOUNT_ID=fd15b6bd9ab1cec50b0832c91d7cf53a npx wrangler pages secret put <NAME> --project-name personal-blog`: `CRM_CLIENT_SECRET`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`. Never in the repo or `wrangler.toml`.
- `wrangler.toml` is Pages-only and holds the plain vars (`CRM_INGEST_URL`, `CRM_ACCOUNT_KEY`, `RESEND_FROM`, `LEAD_FALLBACK_TO`, `NODE_VERSION`). Because `pages_build_output_dir` is set, every git build overwrites dashboard-set plain vars; secrets survive. Change plain vars in the file, not the dashboard. `CRM_ACCOUNT_KEY` stays `""` until `db:onboard` mints the account.

## Deploy

Cloudflare Pages git integration deploys `main` (production) and builds a preview for every other branch. GitHub Actions only checks. Intended Pages build settings, applied by Seth at cutover (plan Task 10 Step 1), not yet set: command `npm run build`, output `dist`, `NODE_VERSION=22`. Never set `NODE_ENV=production` in the Pages build env: `npm ci` would skip devDependencies and `astro check` would fail (the test harness sets it itself, `tests/global-setup.ts`). Do not push or merge to `main` without Seth.

## Design

Tokens live in `src/styles/global.css` (`@theme`: colors with `-dark` pairs, fonts Bricolage Grotesque / IBM Plex Sans / IBM Plex Mono, no border radius). The single layout is `src/layouts/BaseLayout.astro`. Artboards are in `docs/superpowers/design/`. The Maker Zine design is implemented.

## Deferred aims (spec non-goals, nothing built)

- Store migration off Fourthwall and expansion to many products.
- Subscribers and mailing list ("known person" concept).
- Comments (Giscus dropped; a future system shares identity with subscribers, likely better-auth on a Worker with D1).
- Search (Pagefind if the corpus grows).
- Automated blog/social repurposing from the video pipeline.

## Tech debt

- 16 posts have no `description`, so they have no meta description and title-only RSS items. Seth writes them through `page-authoring`; do not invent them.
- The Shiki comment-colour fix is a CSS override keyed to the github-dark hex (`#6a737d`) and scoped to `.post-body` (Satteri's Shiki bridge ignores `colorReplacements`). It breaks silently if the theme changes; `tests/pages.test.ts` guards it.
- `public/_headers` still sends the deprecated `X-XSS-Protection: 1; mode=block`.
- The ingest proxy strips only a denylist of headers (hop-by-hop plus cookie), so `authorization`/`cf-access` headers are forwarded. Negligible here.
- Collection schemas are not `.strict()`, so a misspelled frontmatter key is silently dropped.
- `slugifyTag` drops `#`, `+`, `~` unlike Hugo's urlize (no current tag is affected). Tag names render as stored (`IT`, `smart home`); normalisation is deferred.
- No post currently sets `series` in frontmatter, so the series prev/next nav (`Previous · Part N`) is untested by the build.
- Inline-code background `#e3e7ea` and the store band hexes are literals, not tokens.
- `/posts/`, `/videos/`, `/tags/` and tag pages render no meta description.

## Open questions for Seth

- Masthead tagline and `SITE.description` wording: both are agent-drafted copy-gate text, not approved. Description is `Videos and posts on DIY electronics, smart home, homelab, DevOps and web. The store sells kits, cases and sensors from the videos.` Options: keep, drop the store sentence, or your own wording.
- sethbrasile.com does not resolve yet, so the `/cv/` and `/hire/` redirects point nowhere live.
- `www.bytemycache.com` has no DNS record. The spec wants `www` to apex via a Cloudflare Redirect Rule (dashboard action).
- Privacy and cookies pages are rewritten for cookieless PostHog and the CRM contact form (contracts in `docs/marketing/authoring-contracts/`, review in `docs/marketing/authoring-reviews/`). Before merge: recheck the form claims against the code, check what Turnstile stores in the browser, and set both effective dates to the go-live date.
