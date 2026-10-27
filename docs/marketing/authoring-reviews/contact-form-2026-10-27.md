# Contact form strings (2026-10-27)

- reviewer: Claude (agent read; not an operator read)
- **operator read: Seth approved these strings in session on 2026-10-27**
- source of truth: the `TEXT` object in `src/components/ContactForm.astro`, plus the intro sentence in `src/content/pages/contact.mdx`

| Unit | Text | Lens |
|---|---|---|
| intro | "Send me an email at seth@bytemycache.com, or use the form below to tell me how I might help you or your business:" | site-function (replaces the dead booking widget line) |
| labels | Name / Email / Message | site-function (accessibility) |
| button | "Send message" / "Sending…" | site-function |
| success | "Thanks, your message is on its way. I'll reply by email." | reader (what happens next) |
| error | "Something went wrong and your message wasn't sent. Please try again, or email seth@bytemycache.com." | reader (a working way out) |
| check not ready | "The spam check didn't finish. Wait a moment and press Send again." | reader |

Truth: the form collects only these three fields (`functions/api/contact.ts` validateContact), which matches the privacy page's "Messages you send" section.
