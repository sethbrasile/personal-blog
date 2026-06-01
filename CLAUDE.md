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

Node build scripts (the `/cv/` ingest) live in `scripts/`:

```bash
# In the resume repo first — it PRODUCES the artifacts:
( cd ../resume && npm install && npm run build )   # → resume/output/{*.pdf,resume.json}

# Then in this repo — it CONSUMES them:
npm install                 # one-time (js-yaml)
npm run build:cv            # resume/cv.yaml → content/cv.md
npm run sync:assets         # resume/output/{pdf,json} → static/cv/
npm run build:data          # build:cv + sync:assets
npm run build               # build:data + hugo (uses `hugo` on PATH; HUGO=… overrides)
```

There is no linter or test suite — it's a Hugo site with a small Node
ingest step for `/cv/`.

### Hugo version (current — no pin)

Builds on **current Hugo extended** (`brew install hugo` → 0.16x is fine).
The theme was the old blocker; it's now on a current PaperMod commit (see
"Theme is a git submodule"), so the historic Hugo < 0.124 pin is **gone**.
`hugo`'s default environment is `production`, so a plain `hugo` build emits
the prod-only Umami snippet — that's expected, not a leak.

Harmless, non-fatal deprecation WARNs remain:
- `.Language.LanguageDirection` / `.Language.LanguageCode` — **theme**
  templates (`baseof.html`, `opengraph.html`, `rss.xml`). Clear when PaperMod
  updates upstream; don't fix by editing the vendored theme.
- `languageCode` config key (`hugo.yaml`) — **ours**. Hugo 0.158 deprecated it
  in favor of `locale`. Safe future cleanup, but verify RSS `<language>` output
  doesn't regress before renaming — not done yet.

Also pre-existing (not theme-related): one post trips the goldmark
"raw HTML omitted" WARN — content uses inline HTML and `markup.goldmark`
`unsafe` is off. Left as-is.

## The /cv/ page (lens-toggle CV system)

`/cv/` is a custom single-page CV, not a normal post. How it fits together:

- **`../resume` is the SOURCE. This repo holds ARTIFACTS, never originals.**
  Every CV byte the site serves — prose, PDF, JSON Resume — is generated
  from the sibling `resume` repo. Nothing under `content/cv.md` or
  `static/cv/` is hand-authored; treat all three as build output.
- **"Change the resume" = change the source, then re-render.** When asked to
  edit the resume/CV, edit it in `../resume` (`cv.yaml` for what the site
  renders; `knowledge/*.md` / `voice/*.md` are tailoring background), then
  run the full render below. Do **not** patch `content/cv.md`,
  `static/cv/resume.json`, or the PDF directly — the next build overwrites them.
- **Source of truth: `resume/cv.yaml`** (in `../resume`) — structured CV
  data incl. lens tags + weights + voice text.
- **Full re-render (two repos, in order):**
  ```bash
  ( cd ../resume && npm run build )   # cv.yaml → output/{resume.json, Seth-Brasile-Resume.pdf}
  npm run build:data                  # build:cv (→ content/cv.md) + sync:assets (→ static/cv/)
  ```
  `npm run build:data` alone is **not** enough for text that appears in the
  PDF/JSON — those come from the resume repo's `npm run build`. Skip step 1
  and the PDF/JSON keep the old wording while `content/cv.md` updates.
- `content/cv.md` — **generated**, do **not** hand-edit (header says so).
  `scripts/build-cv.mjs` writes it from `cv.yaml` (Hugo-specific ingest).
- **PDF + JSON Resume are produced by the resume repo, not here.** The
  resume repo owns the data and its portable outputs; Hugo is one consumer.
  `resume/scripts/{render-pdf,export-json-resume}.mjs` → `resume/output/`
  (`Seth-Brasile-Resume.pdf` via @react-pdf — its own print layout, not the
  web page; `resume.json` = JSON Resume v1.0.0). `scripts/sync-cv-assets.mjs`
  copies them into `static/cv/`. Footer buttons render only when the files
  exist (`os.FileExists`).
- Scripts read `cv.yaml` / `output/` from `../resume` by default; override
  with the `RESUME_REPO` env var. `npm install` here (js-yaml) and in the
  resume repo (@react-pdf, react, js-yaml).
- **react-pdf gotcha (fixed 2026-06-01):** `@react-pdf/renderer` ≥4.5 dropped
  `renderToBuffer` from the default export (still a named export). `render-pdf.mjs`
  now does `import ReactPDF, { renderToBuffer } from '@react-pdf/renderer'`.
  Symptom if it regresses: `TypeError: ReactPDF.renderToBuffer is not a function`.
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

**Pinned to a master commit, not a tag.** PaperMod's last tag (v8.0, Sep 2024)
predates the Hugo-compat fixes (`partials/` prefix → hard error, `site.Social`
→ `site.Params.social`), so it does **not** build on current Hugo. Master does.
The submodule is pinned to a recent master commit (updated 2026-06-01, was the
stale vendored tree before). To bump: `git -C themes/PaperMod fetch && git -C
themes/PaperMod checkout <newer-master-sha>`, rebuild, re-test the custom pages
(cv, videos, homepage, search), then commit the new gitlink. Prefer a tag once
PaperMod cuts one newer than v8.0.

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

- _(resolved 2026-06-01)_ ~~PaperMod submodule is stale — pins to Hugo < 0.124.~~
  Theme bumped to a current PaperMod master commit + restored as a real submodule
  (was a broken plain-tree state); site now builds on current Hugo extended. All
  custom pages re-tested. Remaining: re-pin to a PaperMod **tag** once one newer
  than v8.0 ships, and the theme's own `.Language.*` deprecation WARNs clear
  upstream.
