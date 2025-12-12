---
layout: post
title: Linux Deploy release 1.0
description: Announcement of the initial release of Linux Deploy, an open source tool for installing GNU/Linux on Android devices.
image: /assets/images/linuxdeploy-debian-lxde.png
date: 2012-08-21 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

**Linux Deploy** is open source software for quick and easy installation of the operating system GNU/Linux on your Android device.

![linuxdeploy](/assets/images/linuxdeploy-debian-lxde.png "Debian LXDE on Android"){: .center}

The application creates a disk image or a directory on a flash card or uses a partition, mounts it and installs an OS distribution. Applications of the new system are run in a chroot environment and working together with the Android platform. All changes made on the device are reversible, i.e. the application and components can be removed completely. Installation of a distribution is done by downloading files from official mirrors online over the internet. The application can run better with superuser rights (root).

<!--more-->

You can manage the process of installing the OS, and after installation, you can start and stop services of the new system (there is support for running your scripts) through the UI. The installation process is reported as text in the main application window. During the installation, the program will adjust the environment, which includes the base system, SSH server, VNC server and desktop environment. The program interface can also manage SSH and VNC settings.

Installing a new operating system takes about 15 minutes. The recommended minimum size of a disk image is 1024 MB (with LXDE), and without a GUI - 512 MB. When you install Linux on the flash card with the FAT32 file system. After the initial setup the password for SSH and VNC generated automatically.

Features:

* Bootstrap: Debian GNU/Linux
* Distribution versions: stable, testing, unstable (squeeze, wheezy, sid)
* Supported architectures: armel, armhf
* Control interface: SSH, VNC
* Supported languages: multilingual interface

The application is distributed under license [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) or later. For more details, see [the project page](/linuxdeploy).
