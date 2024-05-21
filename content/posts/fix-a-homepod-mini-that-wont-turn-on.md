---
title: "Fix a Homepod Mini That Wont Turn On"
date: 2023-07-12T12:57:56-05:00
draft: false
author: ["Seth Brasile"]
tags: ["homepod", "apple", "homekit", "smart home", "tips"]
categories: ["Smart Home"]
cover:
  image: "posts/images/homepod.webp"
---

I recently faced 3 broken homepod minis, all bought at different times (so different ages), all with the same problem: they would not turn on.

I tried everything I could find online, and nothing worked. I was about to give up and throw them away, but just as I was carrying the first to the trash can, I decided to try one more thing that I've seen generally work for various electronic devices (like laptops), but not suggested anywhere for these. I'm glad I did, because it worked!

_Disclaimer: The content in this article is based on my own experience, but I allowed AI (github copilot) to write chunks of it for me, which explains the confusing tone. I won't make a habit of allowing AI to write my articles, but I wanted to see how it would do. Did it do well? I find the tone offputting? Or maybe it's just the headings/sections? "the problem" ... "the solution" ..._ `¯\_(ツ)_/¯`

## The Problem

The homepods would not turn on. No lights, no sounds, nothing. I had obtained 3 new door stops. I tried everything I could find online, and nothing worked. When I plugged them into my macbook, they would flash an orange light, that's the only sign of life I could eek out of them.

All 3 of these devices broke shortly after I allowed them to update to the latest firmware and I also had just recently accepted the "home" update that "switches to a new home architecture" or some such. I believe it was the update that allows homekit to work with the new [Matter](https://developer.apple.com/apple-home/matter/) standard and it notified me and asked me to accept upgrading to the new home architecture.

I accepted and allowed the update, then within 2 weeks, 2 power events occurred in my home, a lightning strike killed the first homepod, and a power outage a couple of days later killed the other 2. Since they all broke within a week of eachother, and now they work, I believe it was actually a _reboot_ following the updates that triggered the issue, given that none of them are actually "fried."

The official apple doc for troubleshooting a homepod that won't turn on is [here](https://support.apple.com/en-us/HT208244), but it didn't help me. The reset procedure they outline specifically had no effect.

## What didn't work

I tried:

- Using Apple's reset procedure
- Plugging them in to a different outlet
- Plugging them in to a different outlet with a different cable
- Plugging them in to a different outlet with a different cable and a different power brick
- Plugging them in to a macbook pro with a USB-C cable
- Leaving them unplugged for a few days
- Removing them from my homekit setup

## The Solution

The solution was to unplug the homepod, then plug it back in and immediately hold your finger on the top of the homepod. Hold your finger there until you see it light up, then release. The homepod should turn on and work normally.

This is very similar to Apple's documented reset procedure, but it's different enough and their procedure didn't work.

I don't know for certain whether you need to readd them to your home app, I had already removed all 3 before I brough them back to life.
