# Final review: meta descriptions (2026-10-27)

- reportVersion: 1.0.0
- pageId: bytemycache-meta-descriptions (Patterned, skeleton meta-description-v1)
- reviewer: Claude (agent draft review; not an operator approval). Operator read: Seth read the first draft and asked for teasers instead of spoilers (contract re-signed); his read of this revision is pending.
- reviewedAt: 2026-10-27
- contractSha256: `9444307b13936dde5b565e14ae9a62718241ad12b3460c86d9a6d01abbfb04ba` (docs/marketing/authoring-contracts/meta-descriptions.json, approved by Seth in chat)
- draftSha256: `59b20e10979715a961a4cac1fc4716723440e431ca768db6ef32671b515160cb` (sha256 of the manifest `<member>.txt<TAB><rendered meta description>` concatenated in filename order, extracted from dist/ after `npm test` built the site)
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
| `posts_email-is-stupid` | 143 | verified against source | reader-value, seo-entity-value | pass |
|  | A 2014 rant about why running your own email server still felt stuck in 1993, and what Google's custom-domain email would have cost me instead. | | | |
| `posts_fix-a-homepod-mini-that-wont-turn-on` | 150 | verified against source | reader-value, seo-entity-value | pass |
|  | Three dead HomePod minis, and Apple's reset did nothing. Before you throw yours out, try the simple trick that brought all three of mine back to life. | | | |
| `posts_fixing-throw-in-powershell` | 148 | verified against source | reader-value, seo-entity-value | pass |
|  | PowerShell's Throw doesn't always stop your function. It depends on how the caller runs it. I'll show you why, and how to make sure it really stops. | | | |
| `posts_how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands` | 140 | verified against source | reader-value, seo-entity-value | pass |
|  | A 2014 walkthrough for running several Ghost blogs in Docker behind one nginx proxy with PageSpeed and SPDY, set up with just four commands. | | | |
| `posts_microsoft-copilot-365-copilot-copilot-plus-recall` | 138 | verified against source | reader-value, seo-entity-value | pass |
|  | My take on Microsoft's Copilot+ Recall, a feature that logs what's on your screen in a plain-text database, and on who actually wanted it. | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1` | 152 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 1 of my homelab security series: who is actually probing the services you host at home, and the layers that make you a target not worth the effort. | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-2` | 134 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 2 gets hands-on. I'll walk you through building an immutable reverse proxy on Fedora CoreOS, from an empty VM to a running proxy. | | | |
| `posts_protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-3` | 140 | verified against source | reader-value, seo-entity-value | pass |
|  | Part 3: if your reverse proxy ever gets compromised, what can the attacker reach from there? I'll show you how to lock that down in pfSense. | | | |
| `posts_some-great-mac-apps-to-check-out` | 144 | verified against source | reader-value, seo-entity-value | pass |
|  | Five small Mac apps I started using recently that make window management, screenshots, search, external displays and big files less of a hassle. | | | |
| `posts_understanding-googles-page-speed-guidelines` | 147 | verified against source | reader-value, seo-entity-value | pass |
|  | How I finally beat the 'Prioritize Visible Content' warning in 2014 and got PageSpeed Insights to 98/100 on mobile and desktop, and what I changed. | | | |
| `posts_why-laravel-image-handling-still-sucks-and-how-to-fix-it` | 147 | verified against source | reader-value, seo-entity-value | pass |
|  | Many PHP apps still push every image upload through the server, costing you bandwidth, security and scale. Here's a better way to do it in Laravel. | | | |
| `videos` | 136 | verified against source | reader-value, seo-entity-value | pass |
|  | ByteMyCache videos on DIY electronics and smart home builds, like magic wands that control your home through an ESP8266 infrared sensor. | | | |

## Priority findings

| level | surface | finding | disposition |
|---|---|---|---|
| craft | some-great-mac-apps-to-check-out | Draft named a purpose for four apps but not Raycast | corrected: "Raycast for search" |
| craft | part-1 | "attacks a self-hosted service draws" read awkwardly | corrected: "attracts" |
| factual | part-2 | Fail2Ban is in the series title but never configured in part 2's body | corrected before draft: left out of the part 2 description |
| factual | copilot-recall | Post never says Microsoft changed the plain-text storage | no "at first" or "fixed" wording used |
| user-client | all 11 posts | First draft gave away each post's answer (Seth: tease, don't spoil) | corrected: all 11 rewritten as teasers; contract re-signed with the new constraint |
| factual | laravel | Teaser said 'many Laravel apps'; post says 'many PHP developers' | corrected: 'Many PHP apps' |
| factual | 2014 posts (email, Ghost/Docker, PageSpeed) | Advice is dated (SPDY, 2014 PageSpeed scoring, 2014 pricing) | each description states 2014 |

## Family duplicate gate

Command: `python3 ~/.claude/skills/page-authoring/scripts/family_dup_gate.py --skeleton skeleton.txt members/*.txt --json dup-report.json`
Members: 13 (all files listed above under Unit outcomes). Skeleton: empty file (no declared shared text), sha256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
Result: PASS; shared sentences 0, shared spans 0, max pair Jaccard 0.0000.

## Reader verdict

Read as a searcher choosing between results: each description names the exact problem or tool and promises what the post will show without handing over the answer, flags age where it matters, and promises nothing the page lacks. Pass.
