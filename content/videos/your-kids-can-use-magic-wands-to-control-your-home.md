---
title: 'Control Your Home with Magic'
date: 2024-07-07T15:50:47-05:00
draft: false
# yt video ids
ids: ['6ElDx8rN_Po', 'R90adjnIfpQ', 'pUkgUDp6Cys']
categories: [ 'DIY', 'Smart Home' ]
showToc: true
tags: [ 'DIY', 'Smart Home', 'Magic Wands', 'Infrared', 'ESP8266', 'Home Assistant', 'ESPHome' ]
description: 'Control your home with magic wands using infrared and ESP8266. This project uses Home Assistant and ESPHome to control devices in your home with the flick of a wand. This project is perfect for Harry Potter fans, those with Magiquest wands lying around, or anyone who wants to add a little magic to their home.'
---

## Series Summary

In this video series, I show you how to control your smart home with a magic wand from the Magiquest game at Great Wolf Lodge (or from eBay)!

I show you how to make an infrared receiver listening for signals cast specifically from these Magiquest wands, effectively repurposing the wands into home automation controllers.

You could allow your children to control their lighting and devices around the house with magic wands, OR you could even set up your OWN "Magic Quest" at home!

Thanks to the power of open source software, the IRRemote package available for ESP microcontrollers has built-in support for the infrared magic wands meant for Magiquest at the Great Wolf Lodge, so this isn't very dev-heavy and only requires some light config-file wrangling.

I walk you through how everything works, building the sensor, flashing the configuration to the sensor, and then using the sensor in home assistant.

I also make multiple hardware recommendations, but none of the specific pieces I recommend are absolutely mandatory and you can make your own custom setup work just as well.

The sensor is an ESP based microcontroller (in my case an esp8266) flashed with ESPHome with an attached TSOP4838 IR receiver.

### Components available in my store
[3D printed case](https://store.bytemycache.com/products/esp8266-case-ir)\
[Full kit](https://store.bytemycache.com/products/esp-d1-mini-ir-sensor-kit)\
[Fully assembled wand sensor](https://store.bytemycache.com/products/esp-d1-mini-ir-sensor-assembled)

### Products mentioned in this video series
_Note: the following are Amazon affiliate links. If you use these links to purchase, I get a small commission. It doesn't cost you anything extra, but it helps me out a lot. Thanks!_

[TSOP4838 IR Receiver](https://amzn.to/4bv6kr2)\
[UL listed USB plug](https://amzn.to/4eOtcop)\
[ESP8266 D1 Mini Clone](https://amzn.to/3RYRqT2)\
[Nice long USB cables](https://amzn.to/3WgSJ19)\
[ESP32](https://amzn.to/3VTq5mp)\
(Note on this ESP32: The one I tested was USB-C and it had trouble with wifi range. The amazon comments claim that this wifi problem only exists for the USB-C version, so I've linked the micro USB version, but I have not personally tested the micro USB version. It should theoretically be the same except without the wifi problem...)

### Resources

[Github repository with ESPHome configuration files](https://github.com/sethbrasile/magiquest-esphome)

[Home assistant installation guide](https://www.home-assistant.io/installation)

[This site gives you microcontroller pinouts](https://randomnerdtutorials.com/esp8266-pinout-reference-gpios)

### STL and OpenSCAD files for the 3D printed case
https://www.printables.com/model/916690-wemos-d1-mini-infrared-sensor-enclosure\
https://www.thingiverse.com/thing:6666582

_In addition to printables/thingiverse, the OpenSCAD file is available in the github repository. If you make any improvements or additional variations, send me a pull request on github!_

Shout out to the original case designer:\
https://www.thingiverse.com/brainfever/designs\
I came up with my case by editing this design:\
https://www.thingiverse.com/thing:1768820

## Writeup

Work in progress! Come back soon for a full writeup of this project.
<!--
### Introduction

This task is much simpler than it sounds. Most of the hard stuff is taken care of by a ESPHome and a couple of really awesome open source libraries. All we really need to do is wire up a sensor and flash the ESP with the right configuration. I'll walk you through all of that. I'll also show you how to use the sensor in Home Assistant. I'll also give you some ideas for how to use this sensor in your home.

### Hardware

We need a few pieces of hardware, but they're all really simple:

_Note: the following are Amazon affiliate links. If you use these links to purchase, I get a small commission. It doesn't cost you anything extra, but it helps me out a lot. Thanks!_

- [TSOP4838 IR Receiver](https://amzn.to/4bv6kr2)
- [UL listed USB wall plug](https://amzn.to/4eOtcop) (I recommend this one because it's UL listed, but you can use any USB power supply you have lying around. Please make sure to use a UL listed power supply, don't create a fire hazard in your home.)
- [ESP8266 D1 Mini Clone](https://amzn.to/3RYRqT2) (I recommend this one because it's cheap and it works. You can use any ESP8266 or ESP32 you have lying around, but you'll need to adjust the pinouts in the ESPHome configuration file. I'll show you how to do that later.)
- [Nice long micro USB cable](https://amzn.to/3WgSJ19) (I recommend these because they're nice and long and they work. You can use any micro USB cable you have lying around.)
- [Some solder]()
- [A soldering iron]()
- [Some gekko tape or velcro]() (or something to attach the sensor to some suitable casting surface. Gekko tape was suggested by a youtube comment and I have not tried it myself. Thanks [@sandpohtoNL](https://www.youtube.com/@sandphotoNL)!) -->
