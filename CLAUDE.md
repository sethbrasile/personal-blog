# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`byteMyCache` — Seth Brasile's personal blog at https://bytemycache.com. Static
site built with **Hugo** using the **PaperMod** theme. Topics: web,
infrastructure, devops, automation, homelab. Content is mostly long-form
technical posts plus a YouTube video section.

## Commands

```bash
hugo server -D        # local dev server, includes drafts (most posts start draft: true)
hugo server           # local dev, published content only
hugo                  # production build → ./public/ (gitignored)
hugo new posts/my-slug.md     # new post from archetypes/default.md
hugo new videos/my-slug.md    # new video page from archetypes/videos.md
```

Node build scripts (the `/cv/` data pipeline) live in `scripts/`:

```bash
npm install                 # one-time (js-yaml)
npm run build:cv            # resume/cv.yaml → content/cv.md
npm run build:resume-json   # resume/cv.yaml → static/cv/resume.json
npm run build:data          # both of the above
HUGO=/path/to/hugo-0120 npm run build   # data + hugo (see version gotcha)
```

There is no linter or test suite — it's a Hugo site with a small Node
data-gen step for `/cv/`.

### ⚠️ Hugo version pin (gotcha)

The vendored PaperMod submodule is old and only builds on **Hugo < 0.124**
(it uses `.Site.Social`, removed in 0.124, and a partial call with a
superfluous `partials/` prefix that became a hard error in Hugo 0.146+).
`brew install hugo` gives a current release (0.16x) that **breaks the
build**. Use an older extended binary for local builds/preview, e.g.
`hugo_extended_0.120.4`. Do not "fix" the deprecations by editing the
vendored theme. (See `## Tech debt`.)

## The /cv/ page (lens-toggle CV system)

`/cv/` is a custom single-page CV, not a normal post. How it fits together:

- **Source of truth: `resume/cv.yaml`** (in the sibling `resume` repo) —
  structured CV data incl. lens tags + weights + voice text. Edit there.
- **Editing model:** edit `resume/cv.yaml` → `npm run build:data` →
  commit the blog. The prose `resume/knowledge/*.md` files are narrative
  background for tailoring a specific application; `cv.yaml` is what the
  site renders.
- `content/cv.md` — **generated**, do **not** hand-edit (header says so).
  `scripts/build-cv.mjs` writes it from `cv.yaml`.
- `static/cv/resume.json` — **generated** JSON Resume v1.0.0 export.
  `scripts/export-json-resume.mjs` writes it from `cv.yaml`. Footer button
  appears only when this file exists (`os.FileExists`).
- Scripts read `cv.yaml` from `../resume` by default; override with the
  `RESUME_REPO` env var. They need `npm install` (js-yaml).
- `layouts/_default/cv.html` — main template (selected via `layout: cv`).
- `layouts/partials/cv-*.html` — `cv-jsonld`, `cv-lens-toggle`, `cv-role`,
  `cv-project`, `cv-skill-cloud`.
- `assets/css/extended/cv.css` — all styles, scoped under `.cv-root`
  (bundled site-wide by PaperMod, so scoping matters).
- `assets/js/cv-lens.js` — Alpine component (Alpine loaded from CDN). Only
  manages the active lens + persistence; **filtering is pure CSS** driven by
  `[data-lens]` on the root vs. `[data-lenses]` on items.
- **Lens model:** items carry `lenses: [dev, it, leader]` (membership) and
  optional `weight: {dev,it,leader}` (reorder). `full` shows everything;
  other lenses hide non-members and reorder by weight via CSS `order`.

## Theme is a git submodule

PaperMod lives at `themes/PaperMod` as a submodule (`.gitmodules`). A fresh clone
needs `git submodule update --init --recursive` or Hugo will fail to find the
theme. **Do not edit files under `themes/PaperMod/`** — override instead (see
below). `themes/PaperMod` content surfaces in QMD/grep results but is vendored,
not ours.

## How customization works (override pattern)

Local files in `layouts/` and `assets/` shadow the theme's versions by matching
path. Current overrides:

- `layouts/videos/{list,single}.html` — the custom **video section**. A video
  page declares YouTube IDs in frontmatter `ids: ['abc', 'def']`; `partials/video_list.html`
  renders them as embedded iframes.
- `layouts/shortcodes/` — `cta-button.html` (`{{< cta-button "Label" "/url" >}}`),
  `book-me.html`, `contact-form.html`. Use these in markdown bodies.
- `layouts/partials/comments.html` — comments via **giscus** (GitHub Discussions),
  themed by `assets/js/comments-giscus.js` to follow the site light/dark toggle.
- `layouts/partials/extend_head.html` — injects self-hosted **Umami analytics**
  (`analytics.tenorcreative.com`), production-only (`hugo.IsProduction`).
- `layouts/_default/_markup/render-link.html` — render hook forcing external
  links to `target="_blank"`.
- `assets/css/extended/custom.css` — custom styles layered on PaperMod.

When adding behavior, prefer a new override file in `layouts/`/`assets/` over
touching the theme.

## Content structure

- `content/posts/` — blog posts. Two forms coexist: single `.md` files, and
  **page bundles** (a directory with `index.md` + co-located `images/`) used for
  the multi-part series (e.g. the fail2ban reverse-proxy parts 1–4). Use a bundle
  when a post has its own images.
- `content/videos/` — video pages (YouTube embeds via `ids` frontmatter).
- `content/authors/` — author pages (seth-brasile, plus guest authors).
- `content/*.md` — top-level pages (about, hire, contact, cv, privacy, terms,
  cookies, search). Linked from the menu / profile buttons in `hugo.yaml`.

New posts default to `draft: true` (from the archetype) — flip to `false` to
publish. `showToc`, `comments`, `showCodeCopyButtons` are enabled by default in
the archetype.

## Config

`hugo.yaml` holds everything: menu, social icons, `profileMode` homepage,
analytics theme colors. The `store` and `Hire Me` buttons point at external
subdomains. Home output includes a JSON index (`outputs.home`) that powers
PaperMod's client-side search.

## Tech debt

- **PaperMod submodule is stale** — pins the site to Hugo < 0.124. Either
  bump the submodule to a current PaperMod (and re-test all layouts) or
  keep the old Hugo pin documented above. Skipped during the /cv/ build
  (2026-05-28) to avoid scope creep; preview used `hugo_extended_0.120.4`.
