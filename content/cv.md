+++
title = 'My CV'
draft = false
comments = false
searchHidden = true
+++

# Seth Brasile

Over 12 years overall experience in dev/tech/devops/security:

- 1.5 years as full stack senior/architect leading a team of 6 engineers in a successful startup
- 5 years as a software engineer in a professional capacity, working primarily in web technologies
- 10+ years experience in dev overall, including front-end, back-end, devops, and systems automation
- 7 years experience in enterprise IT
- 2 of those IT years specialized in systems automation and cyber security, writing powershell systems and security tools, automating distributed enterprise Windows update/upgrade management, and building out an RMM code delivery and monitoring tool in golang+grpc

### Senior Full Stack Software Engineer + DevOps + Software Systems Architect

BetterLife (March 2023-Current)

BetterLife is a "mastermind" platform which allows users to form, browse, join and manage small groups (called "pods") which meet on a regular basis and share and discuss their progress in achieving a "BetterLife" through accountability, goal setting, and investments, primarily in real estate. Members also gain access to community platforms and events, and a variety of tools, internal and external, including a custom integrated courses platform to help them achieve their goals.

One of the biggest upsides of BetterLife in my opinion is the fact that they're a capitalist "for profit" corporation that is operating like it's a "non profit" and handing 100% of profits to anti-human trafficking efforts. BetterLife was profitable enough to hand $500,000 USD to the Tim Tebow Foundation in its first year!

At BetterLife, I designed their entire platform from the ground up and I am responsible for the entire stack, from the frontend to the backend + machine learning systems, from the databases to the CI/CD pipeline. I hired and led a team of 2 frontend developers, 1 backend developer, a senior frontend engineer + UI/UX designer, and a Machine Learning engineer.

The systems we built tie all of the mentioned tools together and provide a seamless experience for users, while giving the company visibility into how people are using the platform, health of pods and the overall health of the company.

We used machine learning in "R" in order to create a match making system that allows users to find existing pods that are a good fit for them and encourage them to apply and make contact. We plan to expand this machine learning system in the future to include member growth and success metrics which will drive even better matchmaking based on real life results.

I also provided code review and oversaw a group of college students building a mass video conferencing app for their Senior project. This app is intended to eventually replace BetterLife's existing video conferencing system. This system is not yet in use, but it is finished and it is incredible.

I still work with BetterLife, but the bulk of the dev work is done and we're in "maintenance mode" for now which only needs me for a few hours per week.

#### BetterLife Tech Stack

We chose the following stack:

Private members-only web app - Allows users to manage subscription, access tools, take courses, and manage their pods experience:
- Nuxt (frontend and backend)
- Vercel
- FaunaDB
- Stripe

Reporting/Telemetry/BI - Allows the company to see how people are using the platform, the health of their pods, and the overall health of the company:
- Postgresql (NeonDB)
- Influxdb 2.0 (hosted at influxdata)
- Heroku
- Golang: custom go cli tool, via heroku scheduler, syncs data around from system to system
- Grafana

Machine Learning - Creates matchmaking data for users to find pods that are a good fit for them and also creates groups in our community platform based on customer demographics and other factors:
- Python
- R
- reticulate
- hetzner cloud
- dokku / docker

## Open Source
- I am the author of [EZ Web Audio](https://github.com/sethbrasile/ez-web-audio)
- I am the author of [Ember Remodal](https://sethbrasile.github.io/ember-remodal/)
- I am the author or [Ember Audio](https://sethbrasile.github.io/ember-audio/)
- I was the author of the officially recommended [Cloudinary adapter](https://github.com/sethbrasile/ghost-cloudinary-store) for Ghost Blogs, though it is no longer recommended, as I stopped maintaining it.

## Writing Credits

- Of course the articles on this blog
- My article on using docker to deploy [ghost blogs](/posts/how-to-run-multiple-dockerized-proxied-spdyd-and-pagespeedified-ghost-blogs-with-4-commands/)
  was featured in the official Docker newsletter

## Past Roles

### Centralized Services Automation Specialist (IT Devops)
#### DKBInnovative
#### Jun 2021 - Mar 2023 · 1 yr 10 mos

I designed and implemented systems to automate the tracking and management of cyber security and compliance for Enterprise servers and workstations in the health, manufacturing and government sectors. This work was mostly in powershell, but also included linux servers and mac clients. I built a proof-of-concept MSP code delivery + RMM platform in golang. This platform included an "agent" that could be installed on linux/mac/pc and a server-side message broker service which sent commands using GRPC over mutual-TLS.

### Point of Sale Business Analyst
#### The Chickasaw Nation
#### Oct 2016 - Jun 2021 · 4 yrs 9 mos

Manage enterprise point of sale and supporting systems, and manage related infrastructure. Design and implement payment device and POS device tracking systems to enable PCI Compliance. Manage and build systems for food and beverage locations and retail stores.

### Web Developer
#### Greeting Card Collection
#### Jan 2016 - Jul 2016 · 7 mos

(The DSR client hired me to maintain and keep building.)

### Web Developer
#### Deep Space Robots -> Greeting Card Collection
#### Apr 2015 - Dec 2015 · 9 mos

Front end web development in Javascript / Ember.js. We built a suite of tools that allowed our clients to build customized white-labeled Greeting card sites.

### Junior Web Developer
#### Koddi
Sep 2014 - Apr 2015 · 8 mos
PHP, Javascript, junior full stack. We built a lodging/booking/travel data analytics and ad management platform.

### IT Client Services Technician
#### Chickasaw Nation Division of Commerce
#### Jun 2012 - Aug 2013 · 1 yr 3 mos

Standard enterprise "IT Guy" - the guy that shows up to reboot your computer.
