---
title: Protect Your Services with an Immutable Reverse Proxy, Fail2Ban, and Cloudflare (Part 3)
date: 2024-04-22T11:38:01-05:00
author: [Seth Brasile]
tags: [coreos, nginx, containers, immutable infrastructure, homelab, cybersecurity, cloudflare]
categories: [Web Services, cybersecurity]
showToc: true
draft: true
---

>**If you missed part 1, I highly recommend reading through it first to understand the concepts and theory behind the tools we'll be using, and this part doesn't make a lot of sense without part 2. Jump back to [part 1] or [part 2].**

---

## Bonus Topic: Setting up an enterprise-grade firewall with pfSense

I won't be going into too much detail here, there is loads of information about this already on the internet, but I wanted to give you a brief overview of how to set up a pfSense firewall, and provide some resources to get you started.

OPNsense is a very similar fork of pfSense and many people prefer it. I have not used OPNsense, but I'm sure it's also a great choice.

One more disclaimer: Just because it's common to use pfSense in a homelab, don't think that it's not enterprise-grade. pfSense is absolutely used in many enterprise environments. I have used it professionally in multiple managed enterprise IT environments. Netgate, the company behind pfSense, offers support contracts and hardware appliances for businesses, and they offer the exact same software for free to the community. It's a great tool, and I highly recommend it for home labs and businesses of any size.

## What you need

Basically all you need is any piece of hardware with more than one ethernet port. You can use a laptop with a USB NIC, a desktop with a built in ethernet jack and a single pci NIC, or a server with a quad port NIC. You can also use a virtual machine, but you'll need to have a physical NIC to pass through to the VM.

I DO NOT recommend using a VM for this, but it's possible. I've done it, and it's like pretty cool, and you get nerdy cool points from your nerd friends, but it becomes a real headache when it comes time for maintenance or troubleshooting.

IMO, the best hardware for this is a shitty old dell optiplex (any machine you'd expect to see an HR person or accountant using) with a dual or quad port gigabit NIC. Slap a sata SSD and a NIC in there, and you're good to go. You can get these for like $50 on ebay, and they can be had all over facebook marketplace for nearly free.

You DO specifically want intel NICs. Realtek NICs are known to have issues with pfSense, and you don't want to be troubleshooting that.

Pay attention that the NIC card you buy comes with a low profile bracket if you're using an optiplex (or similar) like I mentioned.

<!-- insert amazon link to PC, sata ssd and quad nic here -->

---

--> Head to [part 1] or [part 2]

[part 1]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1/
[part 2]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-2/
