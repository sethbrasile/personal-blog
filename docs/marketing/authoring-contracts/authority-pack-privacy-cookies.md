# Authority pack: /privacy/ and /cookies/ (bytemycache.com), 2026-10-27

Decision (Seth, 2026-10-27): option A, PostHog cookieless for every visitor. Standards source: docs/superpowers/research/2026-10-27-privacy-analytics-standards.md (S4 keep IP default, S5 no DNT, S6 disclosure pattern, S7 process).

Verified (branch astro-rebuild):
- F-posthog-init: src/components/Analytics.astro. PostHog loads only on bytemycache.com and runs `cookieless_mode: 'always'`. Pageviews, page leaves and autocapture are on, and `mask_personal_data_properties` is set. Session recording is off. No identify(). Custom events: contact_click {channel, href, link text} and outbound_click {host, href, link text}.
- F-cookieless: PostHog cookieless docs. Nothing is stored in cookies, localStorage or sessionStorage. The ID is a server-side hash of a daily salt, IP, user agent and hostname, and the salt is deleted daily. Requires the project setting "Cookieless server hash mode".
- F-proxy: functions/ingest/[[path]].ts. Events go via bytemycache.com/ingest to PostHog US cloud, with the visitor IP forwarded. Cookies are not forwarded.
- F-ip: PostHog `anonymize_ips` stays at its default (off), so the IP is stored with events (standard S4).
- F-theme: ThemeToggle.astro / BaseLayout.astro. The localStorage key `theme` holds the light/dark choice.
- F-fonts: fonts load from Google (fonts.googleapis.com, fonts.gstatic.com).
- F-youtube: thumbnails load from i.ytimg.com (Google) with the page. The youtube-nocookie.com player loads only after the visitor presses play.
- D-ghl-retired (Seth, 2026-10-27): GoHighLevel is retired. /contact/ gets a contact form into Seth's own CRM (plan Task 11).
- F-form (planned, Task 11): the form collects name, email address and message; Turnstile renders on first interaction with the form. Verify against the built code before final review.
- F-crm: ppmc-crm is Seth's own CRM, running on Cloudflare with data in Neon Postgres (~/dev/ppmc-crm/CLAUDE.md).
- F-resend: if the CRM call fails, the form emails the message to Seth through Resend (crm-contact-worker pattern).
- F-turnstile (planned, Task 11): Cloudflare Turnstile checks the form for bots.
- F-amazon: amzn.to affiliate links on the video page, plus AFFILIATE_DISCLOSURE.
- F-amazon-policy: Amazon Associates terms require disclosing that third parties, including Amazon, may place and read cookies.
- F-store: store.bytemycache.com runs on Fourthwall.
- F-host: Cloudflare Pages hosts the site.
- F-contact: support@bytemycache.com.

Pending verification (not claimable until checked):
- Whether PostHog's GeoIP enrichment runs in cookieless mode. Check a test event after the key goes in. Until then the copy does not claim "approximate location".
- What Turnstile stores in the browser. Inspect storage on the preview in Task 11 Step 6; the cookies page names it only if it stores something.
- The Neon region of the CRM database. Until confirmed, the copy does not say where form messages are stored geographically.

Prohibited:
- "No personal information collected" or "anonymous". The IP is received and stored.
- Any compliance claim (GDPR, CCPA, "compliant").
- A promise to delete or export a person's data.
- Data stored "on our servers".
- That ad-blockers stop the analytics.
- Do Not Track or any opt-out control the site doesn't have.
- Session recording, heatmaps, advertising or selling data.
- Approximate location (pending, see above).

Constraints:
- Plain "we" register, as on the existing pages.
- Two pages, both linked from the footer.
- One "Effective date: <Month D, YYYY>" line directly under the title on both pages, set to the date the copy goes live (S6).
