+++
title = 'My CV'
date = 2024-07-26T12:22:27-05:00
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

At BetterLife, I designed their entire platform from the ground up and I was responsible for the entire stack, from the frontend to the backend + machinen learning systems, from the databases to the CI/CD pipeline. I hired and led a team of 2 frontend developers, 1 backend developer, a senior frontend engineer+UI/UX designer, and a Machine Learning engineer.

The systems we built tie all of the mentioned tools together and provide a seamless experience for users, while giving the company visibility into how people are using the platform, health of pods and the overall health of the company.

We used machine learning in "R" in order to create a match making system that allows users to find existing pods that are a good fit for them and encourage them to apply and make contact. We plan to expand this machine learning system in the future to include member growth and success metrics which will drive even better matchmaking based on real life results.

I also provided code review and oversaw a group of college students building a mass video conferencing app for their Senior project. This app is intended to eventually replace BetterLife's existing video conferencing system. This system is not yet in use, but it is finished and it is incredible.

I still work with BetterLife, but the bulk of the dev work is done and we're in "maintenance mode" for now which only needs me for about 5 hours per week.

#### BetterLife Tech Stack

We chose the following stack:

Private members only web app - Allows users to manage subscription, access tools, take courses, and manage their pods experience:
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


### Writing Credits

- Of course the articles on this blog
- I wrote an article on
