---
title: 'Email Is Stupid'
date: 2014-09-21T17:11:04-05:00
draft: false
note: 'This article was written on a muuuuch older blog many moons ago and was rescued via the wayback machine and migrated to this blog. The original article at the wayback machine is linked at the bottom of this article. This article proves that I have been pissed at Microsoft for over 10 years.'
---

### Warning: This is a venting post.

It's 2014. The "future" that humanity has dreamed of since the early 1900s or so (as in robots, gadgets, etc..) is here.

If you do any reading into the history of web technologies, you will be absolutely amazed at the giant leaps that have been made in the past 10-15 years.

Web servers and their administration, "cloud" technologies, web frameworks, and etc... are downright FUN (that is, if you're a bit of a nerd) and fairly easy to use. Web technologies have been abstracted to the point where you barely have to understand much of the underlying technology. **It is awesome.**

## Wherefore art thou, E-mail?

So you've:

- Mastered the use of a cloud VPS provider or deployment platform/service, and set up your preferred deployment strategy. You can deploy a site that you've built or a CMS in 5 minutes or less!

- Mastered the art of scalability. Your sites/services can be infinitely scaled to meet demand and you're proud of it!

- Mastered some web technologies. Sites that you design are lean, easily upgradeable, easily migrateable, easily editable, and future developers will have no trouble picking up where you left off if a client ever wants more work done (that's assuming you're dead since obviously, if you were alive, the client would just come back to you, because you're very good).

- Decided to move all of your existing clients away from where you started (Dreamhost, godaddy, etc...) and onto your own cloud infrastructure.

- You've successfully migrated every site over to the new VPS' you set up and things are humming along beautifully. Your costs are 50% of what they were before, and you've got massive headroom!

> "This is awesome! Only one more thing to do! An E-mail server should be a piece of cake!"
>
> -You

**YOU WERE VERY WRONG**

Every aspect of email is seemingly stuck in 1993.

The protocol itself is stuck in 1993.

I place the blame for this squarely on the shoulders of Google and Microsoft.

> "Who needs to figure out a better way to handle email? Hotmail and Gmail are free! Even if you need custom email addresses for your domain, Microsoft and Google have you covered, and it's all free!"
>
> -You

**That is until the past couple years when both companies decided to monetize their offerings for custom domains.**

They successfully created a monopoly on everything email related by making it all free, now they're slowly changing things over to monetized. I have absolutely no problem with businesses charging money for the services that they offer. I do however have a bit of a chip-on-my-shoulder for companies that stunt the growth of the rest of the world by making something better than anyone else has, making it free for years, until everyone is dependant on it, then flipping the money-switch and leaving the entire world to fend for themselves if they don't want to pay **$5 per user per month.**

I run a VERY small operation (I handle IT stuff for 3 local businesses). It costs me a total of $15 per month to run their sites, plus 3 of my own. That's including a server dedicated to HA/caching, and two "back end" web servers.

I have a total of 26 email accounts in my DreamHost web panel. In order to switch over to Google's offering, it would cost me $130 per month.

**$130 per month**

## There is hope for the future

As I write this, there are a number of projects that are working on trying to solve this dilemma, and while I am grateful for them, they are somewhat not-quite-there-yet.

Mail-in-a-Box looks to me like the best offering so far, though it's not really a new thing, as much as an automated installer/configurer for old-things (don't get me wrong, this is VERY helpful).

Haraka looks good on paper. I would love a node.js based email server. I have tried installing Haraka according to their documentation 3 times now on 3 different machines, and can't get past the first few steps in the installation. I'm sure if I spent enough time trying to figure it out, I could probably do so, then contribute to their documentation in order to avoid whatever this problem is for others, but... I got 99 problems and all that...

## Summary

If you've got fewer than 99 problems, please do me a favor: go contribute to either of those projects so I can keep focusing on learning the things that I'm learning, and maybe we can solve this e-mail dilemma.

This article was rescued via the wayback machine:

https://web.archive.org/web/20141229184624/http://sethbrasile.geekedout.biz/e-mail-is-stupid/
