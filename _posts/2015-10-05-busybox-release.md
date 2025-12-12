---
layout: post
title: BusyBox for Android
description: BusyBox installer application for Android devices.
image: /assets/images/busybox.png
date: 2015-10-05 12:00:00 +0000
categories: [android, busybox]
comments: true
---

The application is an installer of the latest version [BusyBox](http://busybox.net) for Android. The application contains a BusyBox assembly for various hardware architectures and is the assembly with the most complete set of functions, 335 applets are currently supported (for busybox v1.23.2). The application allows you to install BusyBox in the system or remove the one already installed. It is possible to select the installation directory and installation mode (with the installation of applets, with or without replacing existing applets). Also, the assembly can be saved to the memory card in the form of a zip archive for subsequent installation through a recovery.

![busybox](/assets/images/busybox.png "BusyBox for Android"){: .center}

<!--more-->

What is BusyBox?

BusyBox combines tiny versions of many common UNIX utilities into a single small executable. It provides replacements for most of the utilities you usually find in GNU fileutils, shellutils, etc. The utilities in BusyBox generally have fewer options than their full-featured GNU cousins; however, the options that are included provide the expected functionality and behave very much like their GNU counterparts. BusyBox provides a fairly complete environment for any small or embedded system.

Requirements:

- Device with architecture arm, arm64, x86, x86_64
- Android 5 (API 21) or later
- Superuser permissions (root)

The application is distributed under license [GPLv2](https://www.gnu.org/licenses/gpl-2.0.html). For more details, see [the project page](/busybox).
