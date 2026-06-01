---
layout: post
title: DIY Projects
description: A DIY project to create a long-lasting LED keychain beacon inspired by tritium-powered devices.
image: /assets/images/diy-jt-circuit.png
date: 2012-07-31 12:00:00 +0000
categories: [diy]
comments: true
---

Some time ago, I found a curious device on the Internet — a keychain powered by a radioisotope of hydrogen (tritium). Its principle of operation is simple: a sealed cavity contains the isotope, and the inner part of the cavity is coated with a phosphor, which glows when exposed to electrons emitted as a result of beta decay of tritium. The half-life of tritium is 12 years, which ensures the continuous glow of the phosphor for many years.

![diy-keychain](/assets/images/keychain.jpg "LED Keychain Beacon")

I was inspired by this idea, and in 2012 I came up with the idea of making a keychain beacon that would glow and remain visible in the dark for a long time. You could use it for keys or for something else; I was simply interested in the idea. However, I decided not to use a radioactive element, but an electric circuit with an ordinary LED. The challenge was to make the LED glow for many years without replacing the battery, while keeping the keychain small.

It was one of my DIY projects, and I had a lot of fun working on it. I will share the details of each project in this post.

<!--more-->

## Keychain LED Beacon

To implement the idea, I found the so-called ["Joule thief"](https://en.wikipedia.org/wiki/Joule_thief) circuit to power the LED from a 1.5 V pulsating current and selected the components so that the circuit consumed a minimum of energy. It was possible to achieve a consumption of 0.01 mA with a pulsation frequency of 1 Hz. The expected lifetime of such a circuit with an LR44 battery was 3 years; in practice, the battery lasted about 5 years of continuous operation before the glow stopped completely.

The JT circuit was as follows:

![jt-circuit](/assets/images/diy-jt-circuit.png "JT circuit")

This is how it looks assembled:

<video controls poster="/assets/images/diy-jt-keychain.png">
  <source src="/assets/videos/diy-jt.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

I only got around to assembling the keychain case now. I used an old AA battery, sawed off the bottom, and removed all the contents. I put the JT circuit inside, powered by an LR44 battery, and filled the circuit with hot melt adhesive for insulation. Then I took transparent epoxy resin and tinted it with green phosphor. I filled the inside with resin and left some resin on the LED side. After the resin cured, I sanded everything and added a loop on the back side to attach the keychain; I also filled the loop with resin. The result is an AA-sized cylinder, one end of which glows and the other of which can be attached as a keychain. The epoxy resin makes the keychain durable and waterproof, and the phosphor adds a nice greenish glow between LED flashes.

![keychain](/assets/images/keychain.gif "Keychain demo")

## Tesla Coil

[Tesla coil](https://en.wikipedia.org/wiki/Tesla_coil) is a resonant transformer circuit that generates high-voltage, low-current, high-frequency alternating current. I had been interested in this topic for a long time, and I decided to make a small Tesla coil myself. The main idea was to make it as simple as possible, using only a few components and without the need for a high-voltage power supply.

The Tesla coil circuit was as follows:

![tesla-coil-circuit](/assets/images/diy-tesla-coil-circuit.png "Tesla coil circuit")

This is how it looks assembled:

<video controls>
  <source src="/assets/videos/diy-tesla-coil.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## High Voltage from 1.5 V

I also wanted to make a simple high-voltage generator that could produce high voltage from a single 1.5 V battery. I found a circuit that uses a flash inverter from an old Kodak camera and a few transistors to produce a high-voltage output. The circuit is simple and can be assembled easily on a breadboard.

The high-voltage circuit was as follows:

![hv-circuit](/assets/images/diy-hv-circuit.png "High Voltage from 1.5 V circuit")

This is how it looks assembled:

<video controls>
  <source src="/assets/videos/diy-hv.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## LED Night Light

Finally, I wanted to make a simple LED night light that could be powered by a single 1.5 V battery and would turn on automatically in the dark. I found a circuit that uses a phototransistor to detect ambient light and a few transistors to drive an LED. The circuit is simple and can be assembled easily on a breadboard.

The LED night light circuit was as follows:

![led-night-light-circuit](/assets/images/diy-led-night-light-circuit.png "LED Night Light circuit")

This is how it looks assembled:

<video controls>
  <source src="/assets/videos/diy-led-night-light.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

That's all, as they say: "Just for fun" 😊
