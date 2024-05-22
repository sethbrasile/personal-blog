---
title: Protect Your Services with an Immutable Reverse Proxy, Fail2Ban, and Cloudflare (Part 2)
date: 2024-04-22T11:38:01-05:00
author: [Seth Brasile]
tags: [coreos, nginx, containers, immutable infrastructure, homelab, cybersecurity, cloudflare]
categories: [Web Services, cybersecurity]
showToc: true
draft: true
---

>**If you missed part 1, I highly recommend reading through it first to understand the concepts and theory behind the tools we'll be using. You can [jump back to part 1 here.][part 1]**

---

# Step-by-Step Guide

## Prerequisites
- Free Cloudflare account
- Public IP address
- Domain name
  - Hopefully from Cloudflare.. It _will_ make your life easier but it's not necessary, you can use any domain registrar as long as you change your nameservers to Cloudflare.
- Basic understanding of DNS
- An enterprise grade firewall (or a home firewall that you've configured to be enterprise grade)
  - We _need_ the ability to define an isolated network or VLAN. This is crucial for security. If you're using a consumer-grade router, you're going to have a bad time. You _can_ use a consumer-grade router, but you're going to have to install Tomato/OpenWrt/DD-WRT on it, OR you're going to have to stitch multiple routers together, and you're going to have to be very careful about what you're doing because it's nearly impossible to keep your LAN devices isolated from _probably nefarious_ traffic.
  - In my opinion, **the BEST way to do this** is to repurpose an old computer as a pfSense/OPNsense firewall. This is a **mostly-free** option (assuming you have some old hardware or know someone who does). You likely only need to buy a dual or quad port pcie NIC, and you're good to go. This is the most secure option, and it's the option that I'm going to be assuming you're using for the rest if this guide. If you're not, that's ok, all the concepts will apply nearly 1:1 to any enterprise grade firewall, you might just need to search for specifics on how to do things in your firewall's interface.
- Up-to-date software
  - Make sure that you're running the latest versions of your application web server and the application you're hosting. If what you're securing is a 10 year old version of WordPress, you're going to have a bad time either way.
  - If what you're hosting is a piece of legacy software that can't be updated or replaced, _you can_ make it more secure with these techniques, but if there's a known vulnerability in the login page of the app that you're hosting, no amount of security is going to help you keep _that_ piece of software secure* _(see note)_. You need to replace that software. Assuming your legacy app isn't running with root/admin privileges, you can still keep the other software on the server secure with these techniques.

*_it is technically possible to use a reverse proxy to inspect the contents of incoming traffic and block requests that match a known pattern, thereby writing a targeted protection for a given vulnerability, but this is a very advanced technique and it's not something that I'm going to be discussing in this post. [Here is a basic example of using this technique to block attempts at sql injection (written wayyyy back in 2013!).](https://www.yourhowto.net/nginx-block-sql-injection-and-file-injection/)_

## Let's do it!


The basic gist of how we install Fedora CoreOS is by creating a config file that describes the containerized services we want to run, then we pxe boot into the CoreOS installer which reads the config, downloads the latest OS image, applies our config, then boots.

## Conclusion

The integration of reverse proxies with Fail2Ban, all running in containers hosted on Fedora CoreOS, creates a formidable defense strategy for web services. This configuration leverages the strengths of each component—reverse proxies for traffic management and encryption, Fail2Ban for automated threat mitigation, and Fedora CoreOS containers for secure, scalable, and isolated environments. By adopting this approach, organizations can significantly enhance the security, reliability, and performance of their web services, staying one step ahead in the ongoing battle against cyber threats.


---

## Bonus!

--> Head to [part 3] to learn how to set up an enterprise-grade firewall with pfSense.

[part 1]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1/
[part 3]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-3/
