---
layout: post
title: Launch Kali Linux on Android
description: Running the Kali Linux distribution on Android using Linux Deploy.
image: /assets/images/linuxdeploy-kali-xfce.png
date: 2015-01-31 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

The [Kali Linux](https://www.kali.org) distribution is based on Debian and is positioned as a distribution for testing information security. Installation of this distribution in Linux Deploy is fully supported automatically with installation from the official repository (see [the GNU/Linux installation instructions](/2012/11/18/linuxdeploy-guide/) and the [instructions at www.kali.org](https://www.kali.org/how-to/kali-linux-android-linux-deploy/)), but in some cases you may need to install from a ready-made image without Internet access.

![linuxdeploy](/assets/images/linuxdeploy-kali-xfce.png "Kali Linux"){: .center}

<!--more-->

### Playbook

- Download the [ARM image archive](https://www.offensive-security.com/kali-linux-vmware-arm-image-download/) (for example, for Raspberry Pi) and unpack.

- Extract an image of the second partition from the full image (run it under Linux):
```sh
kpartx -v -a kali-1.0.9-rpi.img
dd if=/dev/mapper/loop0p2 of=/tmp/kali.img bs=1M
```
For the Raspberry Pi image, this is the second partition, for images of other devices the partition normalizer may differ. To view the table of sections in an image, use the command:
```sh
fdisk -l kali-1.0.9-rpi.img
```

- Copy the kali.img file to the memory card of the device. If the image takes up more than 4095 MB, then the memory card must be formatted in an exFAT, NTFS or other file system that is supported on the device and can store files larger than 4 GB.

- In the Linux Deploy application, create a new profile and specify in the settings:
  - *Distribution* - Kali Linux;
  - *Distribution suite* - kali;
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/kali.img`);
  - *Desktop environment* - Xfce.

- Run reconfiguration ("Properties" -> "Reconfigure").

- Start the GNU/Linux system with the "START" button from the main application window.

- Connect via SSH or VNC, password - `changeme`.
