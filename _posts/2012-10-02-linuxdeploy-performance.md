---
layout: post
title: Linux Deploy performance test
description: Performance test of Linux Deploy on different file systems and desktop environments.
date: 2012-10-02 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Tested under Debian/wheezy/armhf on a Samsung Galaxy S II.

SD card read / write speed (10 class) on Android for file systems vfat, ext2, ext4:

* **vfat**: read speed 14.1 MB/s; write speed 12.0 MB/s
* **ext2**: read speed 14.9 MB/s; write speed 3.9 MB/s
* **ext4**: read speed 14.9 MB/s; write speed 16.6 MB/s
* **ext2 (loop)**: read speed 17.0 MB/s; write speed 7.4 MB/s
* **ext4 (loop)**: read speed 17.2 MB/s; write speed 8.8 MB/s

Installation time and use space on disk (Debian wheezy/armhf on Samsung Galaxy S II):

* **Without GUI** ~ 0:12 / 260 MB
* **XTerm** ~ 0:14 / 290 MB
* **LXDE** ~ 0:19 / 450 MB
* **XFCE** ~ 0:20 / 495 MB
* **GNOME** ~ 0:55 / 1.3 GB
* **KDE** ~ 1:20 / 1.3 GB
