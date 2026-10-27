# Post ideas

Seth's queue of things to write about. Notes only; nothing here ships.

## Why I stopped running my own reverse proxy (Cloudflare Tunnel instead)

Added 2026-10-27.

- I no longer run the reverse proxy from the "Protect Your Services" series. Cloudflare Tunnel works better for most services and wins on security too (no open inbound ports).
- Part 2 already says Cloudflare Tunnel / Tailscale-style access is the better option when the service is just for you.
- Loose end: parts 1 and 2 still link "part 4" (pfSense firewall) to `/coming-soon`, which now redirects to the home page. Decide whether this post replaces part 4, and add a note at the top of the series pointing to it.

## The year of the Linux desktop is finally here: daily-driving Ubuntu

Added 2026-10-27.

- I'm daily-driving Ubuntu on my main workstation now.
- Share my config dir and how the setup was mostly Claude-led.
- Source material: `~/dev/beast-config` (system changes are documented in `docs/`) and `~/dev/dotfiles` (shared Claude Code config, hooks, backups).
- Before sharing either repo, check for secrets, hostnames and IPs.
