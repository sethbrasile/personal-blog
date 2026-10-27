# Final review: meta descriptions (2026-10-27)

- reportVersion: 1.0.0
- pageId: bytemycache-meta-descriptions (Patterned, skeleton meta-description-v1)
- reviewer: Claude (agent draft review; not an operator approval). Operator read: pending, Seth asked to read all 13 before publish.
- reviewedAt: 2026-10-27
- contractSha256: `cbeaca8f1a524de80360bb4b51c2f2ba58a935086b34cba140a9e8b1931434a7` (docs/marketing/authoring-contracts/meta-descriptions.json, approved by Seth in chat)
- draftSha256: `198ae0672595b56a5767e0f8d865b49f7ee26e00fef1f33f5f708a4dad844b47` (sha256 of the manifest `<member>.txt<TAB><rendered meta description>` concatenated in filename order, extracted from dist/ after `npm test` built the site)
- status: clean

## Surfaces

Each description renders in four places, all checked in the build: `<meta name="description">` and `og:description` (identical on all 13), the RSS `<description>` for posts (all 11 items now carry one), and the PostCard blurb on `/posts/` and tag pages.

## Files read (audit scope)

Sources: the 11 published `src/content/posts/*/index.md` bodies (hashed in the contract), `src/content/videos/your-kids-can-use-magic-wands-to-control-your-home.md`, `src/pages/posts/index.astro`, `src/pages/videos/index.astro`. Rendered: `dist/posts/*/index.html`, `dist/posts/index.html`, `dist/videos/index.html`, `dist/index.xml`. Out of scope: the 5 draft posts (not built in production); they still have no description.

## Unit outcomes

| unit | chars | truth | lenses | outcome |
|---|---|---|---|---|
| `posts` | 143 | verified against source | reader-value, seo-entity-value | pass |
|  | Posts from ByteMyCache on homelab security, Docker, PowerShell, Laravel and smart home fixes, plus the occasional rant about the state of tech. | | | |
| `posts_email-is-stupid` | 147 | verified against source | reader-value, seo-entity-value | pass |
|  | A 2014 rant: running your own email was still stuck in 1993, and moving 26 inboxes to Google's custom-domain email would have cost me $130 a month. | | | |
| `posts_fix-a-homepod-mini-that-wont-turn-on` | 147 | verified against source | reader-value, seo-entity-value | pass |
|  | Three HomePod minis went dead after an update and two power events, and Apple's reset did nothing. A plug-in-and-hold trick brought all three back. | | | |
| `posts_fixing-throw-in-powershell` | 144 | verified against source | reader-value, seo-entity-value | pass |
|  | PowerShell's Throw keeps going when the caller sets -ErrorAction SilentlyContinue. Put a Return after every Throw so your function really stops. | | | |
| `posts_how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands` | 150 | verified against source | reader-value, seo-entity-value | pass |
|  | A 2014 walkthrough for hosting several Ghost blogs in Docker behind one nginx proxy with PageSpeed and SPDY, with a volume container holding the data. | | | |
| `posts_microsoft-copilot-365-copilot-copilot-plus-recall` | 133 | verified against source | reader-value, seo-entity-value | pass |
|  | My take on Microsoft's Copilot+ Recall: who asked for a PC that logs what was on your screen, then keeps that database in plain text? | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1` | 155 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 1 is the theory: the attacks a self-hosted service attracts, and how a firewall, reverse proxy, Fail2Ban, Cloudflare and Fedora CoreOS each defend it. | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-2` | 148 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 2 is the build: write a Butane config, install Fedora CoreOS in a VM, and run a SWAG reverse proxy with a wildcard cert through Cloudflare DNS. | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-3` | 138 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 3 moves the reverse proxy onto its own VLAN in pfSense, so a compromised proxy can reach only the service ports you explicitly allow. | | | |
| `posts_some-great-mac-apps-to-check-out` | 148 | verified against source | reader-value, seo-entity-value | pass |
|  | Five Mac apps I picked up recently: Swish for window gestures, Shottr for screenshots, Raycast for search, Lunar for displays, Clop for compression. | | | |
| `posts_understanding-googles-page-speed-guidelines` | 147 | verified against source | reader-value, seo-entity-value | pass |
|  | How I reached 98/100 on PageSpeed Insights back in 2014 by inlining critical CSS and loading stylesheets, fonts and scripts after the page renders. | | | |
| `posts_why-laravel-image-handling-still-sucks-and-how-to-fix-it` | 154 | verified against source | reader-value, seo-entity-value | pass |
|  | Stop routing image uploads through your server. Have Laravel issue a pre-signed URL and let the browser upload straight to Cloudflare R2 or any S3 bucket. | | | |
| `videos` | 136 | verified against source | reader-value, seo-entity-value | pass |
|  | ByteMyCache videos on DIY electronics and smart home builds, like magic wands that control your home through an ESP8266 infrared sensor. | | | |

## Priority findings

| level | surface | finding | disposition |
|---|---|---|---|
| craft | some-great-mac-apps-to-check-out | Draft named a purpose for four apps but not Raycast | corrected: "Raycast for search" |
| craft | part-1 | "attacks a self-hosted service draws" read awkwardly | corrected: "attracts" |
| factual | part-2 | Fail2Ban is in the series title but never configured in part 2's body | corrected before draft: left out of the part 2 description |
| factual | copilot-recall | Post never says Microsoft changed the plain-text storage | no "at first" or "fixed" wording used |
| factual | 2014 posts (email, Ghost/Docker, PageSpeed) | Advice is dated (SPDY, 2014 PageSpeed scoring, 2014 pricing) | each description states 2014 |

## Family duplicate gate

Command: `python3 ~/.claude/skills/page-authoring/scripts/family_dup_gate.py --skeleton skeleton.txt members/*.txt --json dup-report.json`
Members: 13 (all files listed above under Unit outcomes). Skeleton: empty file (no declared shared text), sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
Result: PASS; shared sentences 0, shared spans 0, max pair Jaccard 0.0000.

## Reader verdict

Read as a searcher choosing between results: each description names the exact problem or tool, says what the reader gets (fix, walkthrough, list, opinion), flags age where it matters, and promises nothing the page lacks. Pass.
