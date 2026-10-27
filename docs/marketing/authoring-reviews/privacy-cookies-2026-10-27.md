# Final review: /privacy/ and /cookies/ (2026-10-27)

- reportVersion: 1
- reviewer: Claude (agent read; not an operator read)
- reviewedAt: 2026-10-27
- status: **block** (open findings P1 to P3 below)
- operator read: **Seth approved this wording in session on 2026-10-27**, for both draft digests below. P1 to P3 still have to close before merge; a draft change from them gets a fresh review and Seth's read of the changed lines.

| pageId | contractSha256 | draftSha256 |
|---|---|---|
| bytemycache-privacy | c7ff8bcfd43d0cbe5174a572623d233a2a4c6c4c29e4f16874bd976ca16104ed | 1de9ccc9e5c7ffdf60c345d64163c5d861e15afd8f58543365f9ad1a73ecdd1e (`src/content/pages/privacy.md`) |
| bytemycache-cookies | 4a2de66ffa4444ab7c680429275c6e42ba124f7f427def05243d3a8f55efe6d9 | dc2b450a93935d68cd744e93e9924210c2bab9a52aa393440d92764c396bc22d (`src/content/pages/cookies.md`) |

Surfaces: each page's frontmatter title (rendered as the h1 and `<title>`) and markdown body. Neither page has a `description`.

Claims checked against: `src/components/Analytics.astro`, `functions/ingest/[[path]].ts`, `src/layouts/BaseLayout.astro` (fonts, theme bootstrap), `src/components/ThemeToggle.astro`, `src/components/YouTubeEmbed.astro` (facade, `noscript` iframe), `src/lib/site.ts` (affiliate disclosure), `~/dev/ppmc-crm/CLAUDE.md` (Cloudflare + Neon), `~/.claude/skills/crm-contact-worker/SKILL.md` (Resend fallback, Turnstile), plan Task 11.

## Unit outcomes: privacy

| Unit | Locator | Truth | Lens | Outcome |
|---|---|---|---|---|
| P-title | frontmatter title | n/a | site-function | pass |
| P-date | "Effective date" line | pending (P3) | site-function | block |
| P-rec | "What we record" | verified (Analytics.astro; PostHog default properties) | reader | pass |
| P-tied-1 | "Is it tied to you?" para 1 | verified (cookieless docs, standard S4) | reader | pass |
| P-tied-2 | para 2 (US storage, no replay/sale/ads, policy link) | verified (proxy targets us.i.posthog.com; replay off) | reader | pass |
| P-svc | "Other services" list, 5 items | verified; the YouTube no-JS qualifier is from the `noscript` iframe | reader | pass |
| P-msg | "Messages you send" | form, CRM, Turnstile and Resend facts are planned (Task 11), not built (P1) | reader | block |
| P-q | "Questions" | verified | site-function | pass |

## Unit outcomes: cookies

| Unit | Locator | Truth | Lens | Outcome |
|---|---|---|---|---|
| C-title | frontmatter title | n/a | site-function | pass |
| C-date | "Effective date" line | pending (P3) | site-function | block |
| C-store | "What this site stores" | verified (theme key, cookieless analytics) | reader | pass |
| C-third | "When other services add their own" | YouTube and Amazon verified; Turnstile left out pending Task 11 Step 6 (P2) | reader | block |
| C-ctl | "Clearing or blocking it" | verified (default follows `prefers-color-scheme`) | site-function | pass |

## Priority findings

- **P1 (factual-legal, closed 2026-10-27):** checked against `ContactForm.astro` (fields name, email, message; Turnstile loads on first `focusin`) and `functions/api/contact.ts` / `_lib/resend-fallback.ts` (CRM first, Resend fallback). The draft matches; no change. Original note: the contact-form claims describe Task 11 as planned. Re-check them against `functions/api/contact.ts` and `ContactForm.astro` once those exist; the draft digest changes if they differ.
- **P2 (factual-legal, open, moved to after the merge by Seth's decision to skip preview secrets):** what Turnstile stores in the browser is unverified. If it stores anything, add it to the cookies list (draft change, re-review).
- **P3 (factual-legal, open):** the effective date must equal the go-live date. Set it at merge on both pages and re-review.
- **P4 (factual-legal, corrected in the draft):** the signed privacy contract's direct-contact belief says an email also goes into the CRM. It doesn't; email lands in the inbox, and the draft says so. The contract wording is wrong, not the page; fixing it in a later Revision contract is open for Seth.
- **P5 (craft, corrected):** removed an opening sentence that described the page instead of saying anything, and replaced "record your screen or your session" with "make recordings of your visit".

## Reader verdict (draft, agent read)

A reader from the footer gets the questions in the contract's order and can decide whether to keep browsing, what to avoid (affiliate links, pressing play, the form) and where to ask. **Pass for question flow;** final status waits on P1 to P3 and Seth's read.
