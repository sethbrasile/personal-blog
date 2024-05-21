---
title: "Fixing Throw in Powershell"
date: 2023-02-03T12:09:50-06:00
draft: false
author: ["Seth Brasile"]
tags: ["powershell", "windows", "scripting", "IT"]
categories: ["Powershell"]
cover:
  image: "posts/images/pexels-vlad-chețan-2694317.webp"
---

This is going to be a short post because I'm only reiterating what [another blogger](https://jamesone111.wordpress.com/) has
[already written](https://jamesone111.wordpress.com/2019/01/30/powershell-dont-just-throw/). I'm reiterating here because more people should understand this.

If you've written any amount of powershell, you probably know that `Throw` does not behave the way that one would expect. James' post has finally clarified
something that has gotten me many times, and I always figured out a way around it, but never understood exactly what was happening.

When you call a function, and you pass that function `-ErrorAction SilentlyContinue`, or when you set `$ErrorActionPreference` to `'SilentlyContinue'`, both of
which are actually necessary in some cases, Powershell _continues_ in the case of reaching a `Throw` in the called function. This is completey unexpected
behavior! Apparently the authors of Powershell had different expectations about what `-ErrorAction`'s purpose was compared to how it ends up used. The caller
is likely expecting the execution of _their_ code to SilentlyContinue, but it's highly unlikely that the're asking the called function to abandon all error
handling...

The answer is very very simple. If you're writing a function and you're intending on the use of `Throw` giving the consumer more control over error
handling (you should), always follow that `Throw` with a `Return`. This forces Powershell to use `Throw` the way that all other languages (to my knowledge)
use `Throw`, by _always_ returning from the current function scope, regardless of the actions of the consumer.

Examples:

```powershell
Function New-Something {
  # ... code here that takes some action

  If ($undesiredThing) {
    Throw "An undesirable thing has occurred"; Return
  }

  # ... code that you don't want to run when the error state has occurred
}
```

This way, the consumer can use your function and your code will still behave the way you expect it to whether your consumer decides to `SilentlyContinue`
or not.

If you truly intend on giving your consumer the ability to disable error handling within your function, there are more intentional and communicative ways
to do it, such as something like a `-DisableUndesiredThingChecking` switch, like this:

```powershell
Function New-Something {
  param(
    [switch]
    $DisableUndesiredThingChecking
  )

  # ... code here that takes some action

  If ($undesiredThing -and !$DisableUndesiredThingChecking) {
    Throw "An undesirable thing has occurred"; Return
  }

  # ... code that you don't want to run when the error state has occurred
}
```
