---
layout: post
title: Launch BackTrack on Android
description: Guide to launching BackTrack Linux distribution on Android using Linux Deploy.
date: 2012-10-05 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy supports the launch of the [BackTrack](https://en.wikipedia.org/wiki/BackTrack) distribution for Android. The prepared image of this distribution can be downloaded from the [Linux-on-Android](https://sourceforge.net/projects/linuxonandroid/) project website.

### Playbook

- Download the [image](https://downloads.sourceforge.net/project/linuxonandroid/Backtrack/Image/backtrack-v10-image.zip), unpack it and copy it to the SD card.

- In the properties:
  - *Distribution* - Ubuntu;
  - *Distribution suite* - lucid; 
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/backtrack.img`);
  - *User name* - backtrack (or root);
  - *Desktop environment* - GNOME.

- Run reconfiguration ("Properties" -> "Reconfigure").

- Start the GNU/Linux system with the "START" button from the main application window.

- Connect to the system via VNC. The password to access the system after reconfiguration will be: `changeme`
