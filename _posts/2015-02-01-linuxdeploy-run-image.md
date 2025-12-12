---
layout: post
title: Run any Linux distribution on Android from an image
description: Instructions for running any Linux distribution on Android using Linux Deploy and a pre-made image.
date: 2015-02-01 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy is designed to automatically install the latest versions of the most popular Linux distributions via the Internet and then run Linux applications of these distributions on Android. However, it also supports running the distribution from ready-made images. Prepared images of distributions can be downloaded from the [Linux-on-Android](http://sourceforge.net/projects/linuxonandroid/) project website.

<!--more-->

### Playbook

- Download the image of the desired distribution ([select the zip archive with the image](http://sourceforge.net/projects/linuxonandroid/files/)), unpack and copy it to the memory card.

- In Linux Deploy, create a new profile and specify (mandatory) the following in the parameters:
  - *Distribution* - should correspond to the image;
  - *Distribution suite* - should correspond to the image;
  - *Architecture* - should correspond to the image;
  - *Installation type* - File;
  - *Installation path* - the path to the *.img file (for example, `/sdcard/linux.img`).

- Run reconfiguration via "Properties" -> "Reconfigure".

- Start the GNU/Linux system with the "START" button from the main application window.

- Connect via SSH or VNC, password - `changeme`.
