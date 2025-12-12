---
layout: post
title: Installing GNU/Linux in RAM
description: Using Linux Deploy to install GNU/Linux distributions in RAM for improved performance.
date: 2015-05-21 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Modern models of mobile devices are equipped with a significant amount of RAM, for example, the ThL 5000 has 2 GB of RAM and 1 GB of swap memory. The Android system and system applications use no more than 1 GB of RAM. Thus, there is still at least 1 GB of memory that can be used for their own purposes. Linux Deploy version 1.5.1 adds support for installing GNU/Linux distributions in RAM.

<!--more-->

For this purpose, [tmpfs](https://en.wikipedia.org/wiki/Tmpfs) is created, where the distribution will be installed. To use this function in Linux Deploy, just select "Properties" -> "Installation type" -> "RAM" and specify the size of the created image in megabytes below. If 0 is specified, the image size will be calculated automatically based on the amount of free RAM.

The performance of the GNU/Linux system in this mode is very good, applications are instantly launched, and interfaces respond to actions instantly. The time of installation of the distribution will also be appreciated. For example, the basic Debian on ThL 5000 is installed over Wi-Fi in 3 minutes, and together with the LXDE graphics environment and SSH server - in 5 minutes. Minimum image size for Debian: minimum installation - 300 MB, desktop environment LXDE + SSH server - 700 MB.

This type of installation is well suited for quickly checking something or quickly accessing some features of the GNU/Linux distribution without the need for permanent storage of the system image. It should be remembered that all data stored on the disk in RAM will disappear without a trace when the device is rebooted. This feature can be used from the point of view of security, rebooting the device will erase all traces of work in GNU/Linux without the possibility of any recovery.
