---
title: Protect Your Services with an Immutable Reverse Proxy, Fail2Ban, and Cloudflare (Part 1)
date: 2024-04-22T11:38:01-05:00
author: [Seth Brasile]
tags: [coreos, nginx, containers, immutable infrastructure, homelab, cybersecurity, cloudflare]
categories: [Web Services, cybersecurity]
showToc: true
draft: false
---

>If you're looking for the tl;dr step-by-step guide, you can [skip to part 2 here][part 2] (but I highly recommend reading through this post first to understand the concepts and theory behind the tools we'll be using).

>If you're looking for a guide on how to set up an enterprise-grade firewall with pfSense, you can [skip to part 3 here][part 3].

---

The idea of hosting a web service in your own home can be simultaneously exciting and absolutely horrifying... On the one hand, you'd like to learn more about web technologies and devops, learn how to create robust services, and learn how to secure them. On the other hand though, you're worried about the security implications of hosting a web service on your home network. What happens if you do this incorrectly? What happens if an attacker gets into your network due to some mistake you made?" This is where some planning and multiple layers of reverse proxy (with some baked-in security-focused tools) comes in.

We'll be discussing these topics from the perspective of a homelab, but the same principles apply to a production environment. The only difference is that in a production environment, you'd likely have more resources to throw at the problem, and you'd likely have more people to help you manage the problem. In a homelab, you're likely on your own. Learn these concepts at home and then point out to everyone at work how your home web service is much more secure than the one your employer pays for!

First, we'll be discussing [some theory on threats and attack vectors](#understanding-the-threat) so that we understand _why_ each of these tools matters and so that we can make intelligent decisions in their configuration. Then we'll be discussing the [specifics of the tools themselves](#understanding-the-tools-at-our-disposal) and how they can be used to secure your web services. Finally [in part 2][part 2], we'll be discussing how to deploy these tools in a homelab environment.

<!--
### A Couple of important Disclaimers

_Disclaimer for the non-cybersecurity expert: The following disclaimer containing some amount of showboating is the language these cybersecurity people speak lol, you can safely ignore it. It's intended to pull the "security person" into a mindset of "let's all figure this out together" instead of their default "none of these people know what they're talking about!"_

_Disclaimer for the cybersecurity expert: I'm not one of you and I don't have your vocabulary. I'm just very nerdy and very into these subjects. I have only been to (gasp) **one** cybersecurity conference! I did work in a cybersecurity-heavy position at a mid size MSP for a few years, and though my title didn't have the word "security" in it, I did make most of the implementation decisions and advised our security team on a lot more than I would have imagined given their supposed pedigrees. My work (this specific work) has been reviewed highly by "ex-NSA" consultants and I believe I have things to teach that could be valuable to your average homelabber and even to many in IT spaces. I will be describing things in my own words and in a way that I think is more accessible to the average person than the standard "security" vocabulary. If you're a cybersecurity expert you will likely roll your eyes at this section, but I hope you'll still find the rest useful. If you see any serious misinformation here or if you jump over to part 2 and see a security issue with my setup, please point it out!! I (and anyone else reading this) would love to learn more!_

--- -->

# Understanding the Threat

When we're thinking about securing our web services, we need to think about the types of attackers that we're trying to protect against. There are many different types of attackers, but for the purposes of this post, we'll be generalizing them into two categories: the **random** attacker and the **targeted** attacker. We'll also be discussing the tools that these attackers use to compromise systems and the ways in which we can protect against them.

It's important that we think through the types of attackers that we're trying to protect against. Think through their perspective, what information they have available to them, what tools they might have at their disposal, and what their motivations might be.

## The Random Attacker

Generally speaking, just like irl thieves, attackers are looking for _easy_ targets, so the more difficult you make it for them, the more likely they are to move on to the next target.

Let's work through this scenario: An attacker has found that your IP address has some ports opened. They may have found your IP address by probing DNS records and found that GoDaddy URL that you pointed at your IP address last year, or maybe they did a scan across a public IP range and found that you're responding in some way on a port or two (remember that depending on the methods available to this specific attacker, "hanging" or "not responding" can be just as good as a response, so we need to be careful in the _way_ in which we don't respond). Or maybe they found your IP address in a data breach or in [Shodan](https://www.shodan.io) and are just trying to see if you're still vulnerable.

This attacker is likely to be using automated tools to scan for open ports, identify services running on those ports, and exploit known vulnerabilities in those services or the servers they're hosted on. They're not specifically targeting you, they're just looking for easy targets. They're likely to move on to the next target if they encounter any resistance or if they find that you're not an easy target. They run a few scripts against your IP, they don't work, they move on.

This is an extremely easy one for us, and an important one to get right. When this type of attacker _does_ find a vulnerability they're unlikely to just start attacking, they're likely to either log the vulnerability or use it to install some method of continued foothold in the network, then sell that information or foothold to some other interested party. This is where the next type of attacker comes in:

## The Targeted Attacker

This attacker is a bit more intelligent, sophisticated and motivated. They might know who you are (or at least already know what you're hosting) and they're specifically targeting you. They could be someone who knows you, they could be hired by someone who wants your data, or they could be a random attacker with increased interest because they decided they like the last 3 digits of your public IP. It's also possible that this attacker bought a list that contained your IP address and an existing foothold in your network from the random attacker we discussed in the previous paragraph.

The way we mitigate this attacker is first and foremost by avoiding [ending up on a list](#the-random-attacker) in the first place, and second, by making it extremely difficult for them to find out any information about our stack, and placing multiple layers of security in their way so that if they find a vulnerability, they're unlikely to be able to use the same vulnerability to get through the next layer.

## The Attacker's Tools

New vulnerabilities are discovered every day and attackers are constantly scanning the internet for vulnerable systems. They use automated tools to scan for open ports, identify services running on those ports, and exploit known vulnerabilities in those services or the servers they're hosted on. They also use brute-force attacks to guess passwords, launch DDoS attacks to overwhelm servers, and deploy malware to compromise systems.

There are "dark web" marketplaces filled with information about vulnerabilities, exploits, and tools that attackers can use to compromise systems. These tools are often sold or rented to attackers, making it easier for them to launch attacks without having to develop their own tools.

# 3 Classes of Attack and How to Protect Against Them

## DDoS Attacks

A Distributed Denial of Service (DDoS) attack is a type of cyber attack that aims to overwhelm a web service with a flood of traffic, rendering it unavailable to legitimate users. DDoS attacks can be launched by botnets, which are networks of compromised devices controlled by a single attacker. To protect against DDoS attacks, organizations can use a cloud-based security service like Cloudflare, which can absorb the load of a DDos attack and filter out malicious traffic before it reaches the web service, ensuring that legitimate users can access the site. If a service like Cloudflare is doing its job, you won't even know that a DDoS attack is happening.

# Understanding the Tools at our Disposal

## Enterprise Grade Firewall

We will dive much deeper on this topic in [part 3] of this series, but it's worth mentioning here: We cannot secure our web services without a real enterprise grade firewall. The good news here is that this is likely _free_ or _very cheap_!

I previously mentioned that it's important that we _don't respond_ in very specific ways in order to ward off the random scans that bad actors all over the internet use. By _only even considering connections from cloudflare_, we look just like any old completely closed and NATed IP address that's not worth a 2nd look. This is only possible with an Enterprise grade firewall.

## Reverse Proxy

A reverse proxy acts as a middleman between the internet and your web server, forwarding client requests to the server and concealing the server's existence and characteristics (and therefore, concealing information about potential vulnerabilities). This setup provides several security benefits, including anonymity and obscurity, load balancing and traffic control, ability to inject additional tooling into the web stack (even on legacy applications) and centralized SSL/TLS management. Let's break these down:

### Anonymity and Obscurity

By concealing the existence and characteristics of the backend servers, a reverse proxy makes it harder for attackers to exploit specific server vulnerabilities. This is because the reverse proxy acts as a shield, preventing attackers from directly interacting with the backend servers. This is especially important when it comes to protecting against zero-day vulnerabilities or other unknown exploits that could be present on the backend system.

### Ability to Inject Additional Tooling

A reverse proxy can be used to inject additional security tooling into the web stack, such as Web Application Firewalls (WAFs), Intrusion Detection Systems (IDS), and other security mechanisms. This allows you to add an extra layer of protection to your web services without modifying the underlying applications, making it easier to secure legacy applications or third-party services. This is especially useful when you're hosting a web service that you don't have control over, or when you're hosting a web service that you don't have the ability to modify (like a third-party service).

We will be discussing Fail2Ban and WAF in this post, but it's worth mentioning that you could also use IDS, or other security mechanisms in this layer. IDS should really be integrated into your firewall.

### Centralized and Automated SSL/TLS (free automated certs!)

By leveraging "LetsEncrypt" or "ZeroSSL" and handling SSL/TLS encryption at the reverse proxy level, you can simplify and automate certificate management for all of your domains and subdomains at once and ensure encrypted connections between clients and the web server without any interaction from you (beyond initial config) and without spending a dollar. This enhances data security during transmission and helps protect sensitive information from eavesdropping or interception. Centralized SSL/TLS management also allows you to ensure consistently rotated certificates exist across all your services. Gone are the days of "Hey, I'm getting a security warning when I visit your site!" and "I swear, I swapped out that certificate last month!"

### Load Balancing and Traffic Control

It may seem at first that load balancing and traffic control are not security features, but they are. It has been proven that [DDoS attacks are commonly coupled with other types of attacks](https://www.corero.com/theft-and-ddos-attacks-go-hand-in-hand/) that actually do result in a data breach. Basically, while you're busy reacting to the DDoS attack, you're ignoring other alerts or not receiving them b/c critical infrastructure is down, and the attacker is happy-as-a-clam working to get into your network. The more robust your stack is, the more likely you are to be able to handle a DDoS attack and still be able to respond to other alerts.

A reverse proxy can absorb a huge amount of garbage requests (a common DDos tactic) and distribute seemingly-legitimate incoming traffic across multiple application servers, ensuring that no single server is overwhelmed and that no Single-Point-of-Failure exists (in the app stack.. the reverse proxy is still a SPoF but we will have moved the moniker of "SPoF" to a much more robust device with a smaller responsibility, which reduces the chances that a failure occurs). This is crucial for maintaining availability during DDoS attacks or other high-traffic events. By spreading the load across multiple servers, a reverse proxy can ensure that the web service remains responsive and available to legitimate users and reduce the likelihood that an attacker achieves their goal.

We won't be discussing load balancing in this post specifically, but it's worth mentioning, and it's also worth mentioning that a reverse proxy can also help with caching and optimizing content delivery, further reducing the load and response time from your backend servers.

## Fail2Ban (Brute Force Protection)

Fail2Ban is an intrusion prevention software that monitors log files for suspicious activity and automatically adjusts firewall rules to block potentially malicious IP addresses. When deployed alongside a reverse proxy, Fail2Ban offers several advantages:

1. **Automated Response to Threats**: Fail2Ban swiftly detects and blocks all known brute-force methods, sql injection attacks, SSH attacks, and other common threats, significantly reducing the window of opportunity for attackers.
2. **Customizable Security Policies**: Administrators can tailor Fail2Ban’s rules to suit their specific security needs, allowing for a dynamic defense mechanism that evolves with the threat landscape.
3. **Resource Efficiency**: By preventing repeated access attempts from known malicious sources, Fail2Ban reduces unnecessary load on the web services, ensuring that resources are available for legitimate users.
4. **Reduced Chance of False Positive**: When Fail2Ban blocks an IP address, it only does so temporarily, allowing legitimate users to regain access after a specified period, minimizing the risk of false positives permanently affecting user experience. This may seem like a negative, but a temporary block is actually good enough to thwart any attacker because they're likely to move on to the next target after a few failed attempts. Even if this is a targeted attack and they don't move on, _just slowing them down_ actually makes it impossible for success to ever be possible.

Read more about Fail2Ban [here](https://en.wikipedia.org/wiki/Fail2ban)

## Cloudflare (DDoS Protection, WAF, CDN, SSL/TLS)

Cloudflare is a cloud-based security service that provides protection against DDoS attacks, malware, and other online threats. By routing web traffic through Cloudflare’s global network, organizations can benefit from:

1. **Obscured Origin IP**: Cloudflare acts as an additional reverse proxy, concealing the origin IP address of the web services and preventing attackers from directly targeting the servers, enhancing security and privacy.
2. **DDoS Mitigation**: Cloudflare’s network absorbs and filters out malicious traffic, preventing DDoS attacks from overwhelming the web services and ensuring that legitimate users can access the site.
3. **Web Application Firewall (WAF)**: Cloudflare’s WAF protects against common web application vulnerabilities, such as SQL injection and cross-site scripting, by inspecting incoming traffic and blocking malicious requests.
4. **Content Delivery Network (CDN)**: Cloudflare’s CDN caches static content and optimizes delivery, reducing latency and improving performance for users, and further reducing the load from your application server and internal reverse proxy.
5. **SSL/TLS Encryption**: Cloudflare offers free SSL/TLS certificates and enforces secure connections between clients and the web services, enhancing data security and privacy. We will be setting up automated cert provisioning with ZeroSSL, but it's worth mentioning that we will end up with full encryption from the client to Cloudflare, and then from Cloudflare to your reverse proxy.

## Fedora CoreOS (Immutable Host for your Containers)

I'm not sure if I can even describe this operating system in a way that does it any justice.. I'll try, but you should go search around and watch some videos on how this stuff works, it's incredible.

Fedora CoreOS is designed to be an absolutely minimal containerized-workloads-only operating system with an immutable file system and the ability to configure it so that not only is it impossible to log in, but it's impossible to even _become_ a user. This removes basically all known attack surface from the operating system itself. It's technically possible for a skilled attacker to break out of a web process and into the container that's hosting it, but the host OS does not provide any login capability, so the most the attacker can gain access to is some config files and some logs, along with the ability to send http requests from the container. They haven't gained _any_ privilege by breaking into the web server. This is a _huge_ improvement over a traditional OS where an attacker could potentially gain root access to the host OS and then have access to _everything_ that server has access to.

Now say we're wrong and that an attacker does break out of the container and into the host OS. The host OS' file system is immutable, so they can't make any changes. They can't edit config files, they can't install new software, they can't even change the time on the server. They still haven't gained any privilege.

Fedora CoreOS also has automatic updates, so you can be sure that your OS is always up-to-date with the latest security patches and bug fixes. This is obviously crucial for maintaining a secure environment. The way these security updates work is completely bananas. They download a static "image" just like updating a container, then layer your configuration on top of that image and boot into it. If the anything fails, we can easily boot back into the previous image.

Summing up the benefits of using containers on Fedora CoreOS for securing web services:

1. **Isolation and Containment**: Containers encapsulate applications and their dependencies, limiting the potential impact of a security breach to the contained environment, thereby enhancing the overall security posture.
2. **Rapid Deployment and Scalability**: Containers can be quickly deployed, replicated, and scaled, allowing for flexible response to varying traffic and threat levels without compromising security.
3. **Consistent, Immutable Environment**: Fedora CoreOS’s emphasis on immutability and automatic updates ensures that the underlying operating system remains secure, stable, and free from unauthorized changes, reducing the attack surface.

Now on to the guide in [part 2]!

---

--> Head to [part 2] to learn how to deploy these tools in a homelab environment.

--> Head to [part 3] to learn how to set up an enterprise-grade firewall with pfSense.

<!-- [part 2]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-2/
[part 3]: /posts/protect-your-services-with-an-immutable-reverse-proxy-fail2ban-and-cloudflare-part-3/ -->

[part 2]: /coming-soon
[part 3]: /coming-soon
