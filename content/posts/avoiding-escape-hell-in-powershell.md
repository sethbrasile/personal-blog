---
title: "Avoiding Escape Hell in Powershell"
date: 2022-12-19T15:59:56-06:00
draft: true
author: ["Seth Brasile"]
tags: ["powershell", "windows", "scripting", "cmd", "IT"]
categories: ["Powershell"]
---

I've got a question for you: When working on efficiently managing consistency and security across any more than a small
handful of Windows machines, how often do you end your day feeling like you've been dragged through the very bowels
of hell?

![Threshold of Hell gif from Christmas Vacation](/posts/images/threshold_of_hell.gif)

As an IT professional working daily on writing scalable powershell code, one of the most painful parts of the job is developing code that switches context.
For example, if you're writing a powershell script that needs to be passed into a powershell session through CMD for one reason or another. Maybe you're using
an RMM tool that only supports CMD, or you're using psexec to run your code, or maybe you're creating a scheduled task in your script that needs to execute
another bit of powershell at a later time. It's so hard to deal with for a lot of reasons, but the biggest is the wild special-character escape sequences you
have to come up with and the incredible trial-and-error process (generally without access to any meaningful error messages or logging) you have to go through
before you come up with your finished work. This exercise is unfortunately the antitheses of productively managing machines, and you run into this stuff
wayyyyy more often than it feels like you should.

## An Example:

Let's continue with one of the examples I just mentioned. Let's imagine that I need to delete all of the registry items in a
specific location

```powershell
$regPath = "HKLM:\Some\Path"

# grab all the items under the key and create an array, loop through them
@((Get-Item -Path $regPath).Property -join ',') | Foreach-Object {
  $parts = `$_ -split '-';
  $name = `$parts[-1];
  $path = (`$parts -ne `$name) -join '\';

  Remove-ItemProperty -Path $path -Name $name -Force -EA 0;
  Remove-ItemProperty -Path $regPath -Name $_
};
```

```powershell
$psString = "-Command &amp;{

  `$ErrorActionPreference = 'SilentlyContinue';

  `$reboots = @(`'$((Get-Item -Path $regPath).Property -join ''',''')`') | Foreach-Object {
  `$parts = `$_ -split '-';
  `$name = `$parts[-1];
  `$path = (`$parts -ne `$name) -join '\';
  Remove-ItemProperty -Path `$path -Name `$name -Force -EA 0;
  Remove-ItemProperty -Path $regPath -Name `$_
};

`$ErrorActionPreference = 'Continue'; }"
```

_(You might be thinking, "Why doesn't he just store the 2nd portion in a .ps1 file on the system!" - There's a longer
discussion here that I won't be getting into in this post. Short version is: There are many cases where this isn't
an option)_

The powershell code has to be stored as a text value in the scheduled task and the scheduled task is going to run it
in the equivilent of a CMD session, so it will exist there as a text value, then it will be passed into powershell as
a string. Once it is passed into powershell, NOW it follows powershell's standard execution rules, but on it's way
through, you probably needed to escape some special characters through something like 4-6 layers of execution
environment switching:

1. `Stored as a string in original powershell code`
2. `Passed into scheduled task`
3. `Passed into CMD`
4. `Passed as a CMD string to powershell.exe and interpreted as powershell code`
5. `If there were string values here, now we're unwrapping those and interpreting them in the context of powershell`
6. etc...

In the end, it looks something like this:

```powershell
# Example of finished powershell with escape hell


```

Can I let this fly? Can I sit by silently while I know that there are others like me out there struggling with this
nonsense? No! No I cannot!

![We're all in this together gif from Christmas vacation](/posts/images/in_this_together.gif)

## The Answer:

**JUST CONVERT YOUR CODE TO BASE64!**

This is **SO SO SO** easy and so obvious in hind sight, but for some reason it doesn't appear to be a common practice.
Before I came to this realization, over the years, I had spent.. feels like... hundreds.. of hours internet searching
and trial-and-error for answers to tons of slightly different situations, and for some reason, I've never once come
across this very clear and obvious answer that completely skips the entire problem.

Wow.. whatever code you can come up with can become a base64 string with literally ZERO escape sequences for special
characters because you can convert a `scriptblock` directly into base64 without escaping a single character, and
powershell.exe natively accepts base64 encoded commands as a runtime parameter, I'm sure you might run input length
limits in some circumstances so it doesn't split the whole powershell world wide open for you, but that's a lot easier
to work around than the ridiculous situation outlined above. Here's an example:

```powershell
# Example of above with base64 instead of escaping
```

---

## In Closing

Of course, the fact that we have to worry about this at all, that there is no widely understood and accessible best
practice, and that Windows doesn't just provide a simple API for these use cases out of the box is completely
irresponsible and utterly asinine... but that's what we're hopefully working on fixing here, isn't it? Anyway.. a
topic for a different day 😁
