---
title: Protect Your Services with an Immutable Reverse Proxy, Fail2Ban, and Cloudflare (Part 2)
date: 2024-05-22T10:33:05-05:00
author: [Seth Brasile]
tags: [coreos, nginx, containers, immutable infrastructure, homelab, cybersecurity, cloudflare]
categories: [Web Services, cybersecurity]
showToc: true
draft: true
comments: false
---

>If you missed part 1, I highly recommend reading through it first to understand the concepts and theory behind the tools we'll be using. You can [jump back to part 1 here.][part 1]

---

## Before we dive in, let's ask a couple of important questions:

- **Why are you doing this?** - Why do you want to host a web service at home?
- **Who is going to use this service?** - Is this service going to be available for the public or to friends and family? Or is this just for you?

If your motivation here is just to learn, that's great! Read on! If your motivation is to provide some private services for friends and family, that's great too!

If this is just for you, or if you're doing this for public consumption, I would suggest you reconsider, because there are better options for both of these scenarios.

## There are better options when...

### "I'm doing this for the public"
Unless your main motivation is learning, you don't want the headache of guaranteeing uptime for the public. I highly encourage you to use a cloud service in this case. Most cloud services allow you to offer anything that would be suitable for self hosting, for free, with guaranteed uptime. I highly recommend cloudflare pages/workers for static sites and vercel for dynamic. This blog is hosted on cloudflare pages.

### "I'm doing this for myself"

There are cool new concepts called SASE and ZTNA that are designed to allow you to access your services from anywhere in the world, securely, without having to expose them to the public internet. I highly recommend looking into these technologies if you're doing this just for yourself and your immediate household. It's a lot like VPN in concept, but how you interact with it, how it makes resources available, and how it decides you're OK to connect is much different. I will likely write a post on this in the future, but for now, I can just wholeheartedly recommend looking into ZTNA. Take a look at [Twingate](https://www.twingate.com/) - it's a great example. I use it in my own homelab and it has completely replaced my previous wireguard VPN setup. I run a "connector" in a container on a VM in my homelab. You can set up multiple connectors for redundancy, and it's all managed through their web interface. It took me all of 10 minutes to set up, and it's free.

(If you've heard of "cloudflare tunnel" and "tailscale" - this is basically the same thing)

The negative is that this concept starts to fall down as soon as you don't have complete control over the client devices that will be accessing your services.

---

With that out of the way, let's dive in!

## Introduction

This is going to seem daunting at first, but I promise you, it's not that bad. Once you have this all set up, it's super easy to understand and manage. The hardest part is wrapping your head around some new concepts. I'm going to do my best to make everything as digestable as possible. Unfortunately, that means this post contains a lot of words.



# Step-by-Step Guide

## Prerequisites
- Free Cloudflare account
- Public IP address (this does not have to be static, it can be a dynamic IP)
- A VM host
  - This post is going to assume you have access to a QEMU host. I will be using proxmox. Any QEMU host should be directly applicable.
  - I would not bother if your hypervisor is HyperV. CoreOS does not play nicely with HyperV. It IS possible and I have done it, but I would not do it again. Get you a real hypervisor.
- Domain name
  - Hopefully from Cloudflare.. It _will_ make your life easier but it's not necessary. You can also transfer a domain registration to cloudflare.
  - If you bought your domain at another registrar and are keeping it there, you need to follow cloudflare's setup guides to move your DNS into cloudflare.
- Basic understanding of DNS
  - It's really not hard..
  - Watch this [fireship video](https://www.youtube.com/watch?v=UVR9lhUGAyU)
- An enterprise grade firewall (this is cheap or free, explained more in [part 3]). We **need** a few features that you're not going to find on a standard consumer router:
  - We need the ability to define an isolated network or VLAN. We don't want to haphazardly send public internet traffic into our private LAN.
  - We need the ability to pull a dynamic list of IP ranges from cloudflare and only allow connections from IPs in the list.
  - We need the ability to automatically update our DNS entries in cloudflare with our dynamic IP address.
- Up-to-date software
  - Make sure that you're running the latest versions of your application web server and the application you're hosting. We do hope that what we're accomplishing here does to some extent "protect" you when your backend services are vulnerable (explained in further detail in the section on [Known Vulnerability Attacks]), but that doesn't provide an excuse to not keep things up to date. It is absolutely mandatory to keep all of the software in your stack up to date at all times.
  - If what you're hosting is a piece of legacy software that can't be updated or replaced, _you can_ make it more secure with these techniques, but if for example there's a known vulnerability in the login page of the app that you're hosting, no amount of security is going to help you keep _that_ piece of software secure. You need to replace that software. Assuming your legacy app isn't running with root/admin privileges, you can still keep the other software on the server secure with these techniques.
  - *_it is technically possible to use a reverse proxy to inspect the contents of incoming traffic and block requests that match a known pattern, thereby writing a targeted protection for a given vulnerability, but this is a very advanced technique and it's not something that I'm going to be discussing in this post. [Here is a basic example of using this technique to block attempts at sql injection (written wayyyy back in 2013!).](https://www.yourhowto.net/nginx-block-sql-injection-and-file-injection/)_

## Let's do it!

The basic gist of how we install Fedora CoreOS is by creating a config file that describes the containerized services we want to run, then we pxe boot into the CoreOS installer which reads the config, downloads the latest OS image, applies our config, then boots.

## Conclusion

The integration of reverse proxies with Fail2Ban, all running in containers hosted on Fedora CoreOS, creates a formidable defense strategy for web services. This configuration leverages the strengths of each component—reverse proxies for traffic management and encryption, Fail2Ban for automated threat mitigation, and Fedora CoreOS containers for secure, scalable, and isolated environments. By adopting this approach, organizations can significantly enhance the security, reliability, and performance of their web services, staying one step ahead in the ongoing battle against cyber threats.


---

## Bonus!

--> Head to [part 3] to learn how to set up an enterprise-grade firewall with pfSense.

[part 1]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1/
<!-- [part 3]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-3/ -->
[part 3]: /coming-soon
[Known Vulnerability Attacks]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-1/#known-vulnerability-attacks
