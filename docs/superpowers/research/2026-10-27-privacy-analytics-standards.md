# Privacy and analytics standards from potluck-planner, applied to bytemycache

Date: 2026-10-27. Purpose: pull the accepted privacy/analytics standards out of
potluck-planner (the most worked-through PPMC site on this) and say which apply
to the bytemycache rebuild before the privacy and cookies pages are rewritten
and the PostHog key goes in (plan Task 10 Step 3). Also the raw material for a
skill (see the last section).

## Files read

potluck-planner @ `2256cfeb`:

- `src/lib/consent-region.ts` (whole file)
- `src/middleware.ts` lines 230-268 (`syncConsentRegionCookie`)
- `instrumentation-client.ts` (whole file)
- `docs/posthog-config-state.md` (privacy rows: `cookieless_server_hash_mode`, `anonymize_ips`, client-side privacy pins)
- `CLAUDE.md` (Analytics/Errors row, Locked Decisions section searched for consent/cookie/analytics)
- `src/app/(marketing)/privacy/page.tsx` (sections 4 and 8 by grep)
- `src/app/(marketing)/__tests__/marketing-copy-contract.test.ts` (legal-page rules by grep)
- `docs/marketing/authoring-reviews/privacy.md`, `privacy-2026-10-21-revision.md`, `privacy-2026-10-21-revision-2.md` (first 40 lines each)

Elsewhere:

- `~/.claude/skills/ppmc-analytics-posthog/` (SKILL.md, references, `assets/astro/Analytics.astro` by grep)
- `~/.claude/reference/decisions.md` (D007)
- PostHog docs: JS persistence page; cookieless tracking and data storage pages (via search results)

## What potluck does (the accepted standards)

### S1. Region-gated cookieless analytics instead of a consent banner (bd 800)

- Visitors from consent-required regions get PostHog in `cookieless_mode: "always"` with `disable_session_recording: true`. That means no cookies, no localStorage and no replay. Everyone else gets normal persistence.
- Regions: EU 27, EEA (IS, LI, NO), UK plus crown dependencies (GB, GG, JE, IM), and Quebec (CA with `cf-region-code` QC). Switzerland is excluded on purpose, because revFADP does not mandate opt-in consent for first-party analytics.
- **It fails closed.** A missing country, `XX` (unknown), `T1` (Tor), or Canada without a region code is all treated as consent-required. In the code's words: "A stray cookieless visitor costs one session recording; the inverse is a compliance gap."
- The verdict comes from Cloudflare geo headers in middleware. It is mirrored into a JS-readable cookie, `pp-cl` (`1` means cookieless, `0` means normal; `SameSite=Lax`, `Secure`, path `/`, 30-day max-age). The cookie is rewritten only when stale.
  - It is classed as strictly necessary and consent-exempt, because it holds a presence-only verdict and no personal data.
  - Only an explicit `0` unlocks normal persistence. A stale value or a missing cookie falls back to cookieless.
- `cf-region-code` needs the zone's "Add visitor location headers" managed transform.

### S2. PostHog project setting that S1 depends on

- `cookieless_server_hash_mode` = **2** (stateful, enabled). This is a must-stay row in the config baseline. Without it PostHog **silently drops every cookieless event**.
- In cookieless mode PostHog builds the visitor ID on its servers from a hash of team ID, a daily salt, IP, user agent and hostname. The salt rotates daily and is then deleted, so the same person counts as new each day.

### S3. Drift check on load-bearing PostHog settings

- `docs/posthog-config-state.md` holds a baseline, and `scripts/posthog-config-snapshot.py` checks the live project against an `EXPECTED` dict, exiting 1 on drift.
- Settings that only live in the PostHog UI, and that would break analytics or privacy silently if flipped, are listed there with the reason.

### S4. IP handling

- `anonymize_ips: false`, which is PostHog's default. Potluck keeps IPs.
- This is a baseline row with no reasoning attached, not a locked decision. The PPMC proxy forwards the visitor IP on purpose so city-level geo works (`ppmc-analytics-posthog`, `references/site-side.md`).

### S5. No Do Not Track or Global Privacy Control handling

Nothing in potluck reads DNT or GPC. The region gate is the privacy mechanism, and there is no per-visitor opt-out switch.

### S6. Privacy page disclosure pattern

- **Section "Who else sees it?":** a short list naming each provider and its one job. The PostHog item says what is recorded, what is hidden and what can still appear, plus "Data is stored in the United States", with a link to PostHog's privacy policy.
- **Section "Cookies and Browser Storage":**
  - Lists every first-party cookie by purpose, and says "we do not use third-party advertising cookies".
  - States the region rule in plain words: "If you are visiting from the EU, EEA, UK, or Quebec, we do not set the analytics cookie at all … cookieless mode that stores nothing on your device. We also set a small cookie recording only whether this cookieless mode applies to you."
  - Then a paragraph on everything kept in browser storage, with lifetimes.
- **Rights:** "Depending on your location, you may have the right to …". It is hedged and makes no compliance claim.
- **One effective date** goes directly under the h1, the same date on privacy and terms. A test pins its placement and that the dates match, and it is bumped with any legal wording change.

### S7. Process for legal copy

- Contracts live in `docs/marketing/authoring-contracts/*.json` and review reports in `docs/marketing/authoring-reviews/*.md`, both committed.
- Seth approves the exact wording in session before the page is edited. The agent's review is labelled "agent read; not an operator read".
- Each review lists the code files it checked the claims against (for example `instrumentation-client.ts` for the PostHog claims).

### S8. PII hygiene (potluck-specific)

- `mask_personal_data_properties: true`, plus `custom_personal_data_properties` for credential query params.
- Replay text masking through a `<Pii>` component, with static and runtime gates.
- Credentials are stripped from URLs before posthog-js runs.

## What the PPMC skill says today, and the gap

- `ppmc-analytics-posthog`'s `Analytics.astro` template says "Cookies on (US-only site, no consent banner required)".
- bytemycache copied that line (`src/components/Analytics.astro`). The assumption is wrong for bytemycache: a YouTube channel's audience is not US-only, and EU, UK and Quebec readers reach the site from the videos.
- The PPMC skill has no non-US branch. Potluck's S1/S2 is that branch, and it is what should become part of the skill.

## How each standard applies to bytemycache

| Standard | Applies? | How |
|---|---|---|
| S1 region gate | **Yes, the outcome; the mechanism is the open choice below** | bytemycache is static Astro on Pages with no middleware, so potluck's mechanism doesn't port as is |
| S2 cookieless server hash mode | **Yes, load-bearing** | Turn on at project creation, or every cookieless event is dropped |
| S3 drift check | Yes, lightweight | One row in CLAUDE.md for now: "PostHog project setting `cookieless_server_hash_mode` must stay enabled; turning it off silently drops events". A script is overkill for one setting |
| S4 IP | Yes: keep the default | Leave `anonymize_ips` off, and the privacy page says PostHog receives the IP address. Whether location enrichment still runs in cookieless mode is unverified: one third-party guide says GeoIP is lost. Check a test event after the key goes in before the page claims "approximate location" |
| S5 no DNT/GPC | Yes | No `respect_dnt`. Cookieless analytics is the privacy mechanism |
| S6 disclosure pattern | Yes | Name every provider with its one job and where data is stored, list every cookie and storage key, state the cookieless rule plainly, hedged rights line, one effective date under the title on privacy, cookies and terms |
| S7 process | Yes | Move the contracts and reviews into the repo (`docs/marketing/authoring-contracts/`, `docs/marketing/authoring-reviews/`) instead of the git-ignored SDD workspace |
| S8 PII hygiene | Mostly no | No accounts, no credentials in URLs, replay already off. `mask_personal_data_properties: true` is a free one-liner and worth adding |

### The one open choice: how to get S1 on a static site

**A. Cookieless for every visitor (recommended).**
- How: set `cookieless_mode: 'always'` in `posthog.init` for everyone, with no region check.
- Upsides:
  - No new server code: the `/ingest` proxy stays the only Function.
  - No region cookie.
  - The cookies page can say analytics stores nothing on your device, which is true everywhere.
- Cost: no visitor is recognised across days, so weekly and monthly unique visitors are inflated and returning-visitor stats are lost. Replay is already off here. For a content blog that cost is small.

**B. Region-gated like potluck.**
- How: a Pages Function decides the region. Either a `functions/_middleware.ts` on every page request, or a small endpoint the snippet calls before `posthog.init`. It reads `cf-ipcountry` / `cf-region-code`, sets the `pp-cl`-style cookie, and US visitors keep cookies.
- Upside: real cross-day returning-visitor numbers for non-consent regions.
- Costs:
  - A server invocation per page view, or one extra request.
  - New server code on the static site.
  - The zone needs the visitor-location-headers transform for Quebec.
  - The privacy page has to explain two modes.

## Effect on the two pending questions

1. **Discard IP addresses in PostHog?** Answered by the standard: no. Keep PostHog's default, as potluck does, and disclose it. With option A the IP is also an input to the daily hash.
2. **Honour Do Not Track?** Answered by the standard: no. Cookieless analytics is the mechanism, and neither potluck nor the PPMC template uses DNT.

What still needs a decision is A or B above. The two page contracts also change with it: under A, the cookies page's main point becomes "the site stores only your light/dark choice; analytics stores nothing on your device".

## Skill candidate

Fold S1, S2, S3, S5 and S6 into `ppmc-analytics-posthog` as a "non-US audience" branch. It would cover:

- When it applies: any site whose audience can't be assumed US-only.
- The A/B choice for static sites, and middleware for SSR apps.
- The fail-closed region list with the Switzerland reasoning.
- The load-bearing project setting.
- Privacy-page wording patterns.

Use `meta-tools:skill-creator`, with this file and potluck's `consent-region.ts` as inputs.
