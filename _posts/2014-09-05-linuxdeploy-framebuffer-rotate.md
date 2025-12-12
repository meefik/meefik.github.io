---
layout: post
title: Screen rotation in framebuffer mode
description: Solution for rotating the screen and touch input in framebuffer mode on Linux Deploy.
date: 2014-09-05 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Below is a solution for turning the screen correctly in frame buffer mode. That is, to rotate the picture by 90 degrees (landscape orientation) and the touch screen driver handled this rotation correctly. The solution is tested on Samsung Galaxy S2 (i9100), touchscreen MXT224 (you can find out the touchscreen model by using the command: `cat /sys/devices/virtual/sec/sec_touchscreen/tsp_touchtype`), Ubuntu 13.04 Raring Ringtail and Debian 7.0 Wheezy.

What does work?

- positioning the cursor to the click location;
- retention processing (left mouse button retention emulation);
- processing of double-click with one finger (emulation of the left mouse button);
- processing of pressing with two fingers (emulation of the right mouse button);
- rotating the coordinates of the touch screen.

<!--more-->

To do this, follow these steps:

- Install the distribution via Linux Deploy (Debian or Ubuntu) and connect to the console under the root user (for example, over SSH).

- Install the necessary packages:
```sh
apt-get install build-essential wget unzip xorg-dev libmtdev-dev
```

- Download the [source code](https://github.com/meefik/xorg-input-mtev) of the modified mtev driver for Xorg:
```sh
wget https://github.com/meefik/xorg-input-mtev/archive/master.zip --no-check-certificate
unzip master.zip
```

- Start driver building:
```sh
cd ./xorg-input-mtev-master/
make
```

- Copy the driver to Xorg module directory:
```sh
cp obj/mtev.so /usr/lib/xorg/modules/input/mtev_drv.so
```

- Edit the file `/etc/X11/xorg.conf`:
```
    Section "ServerLayout"
        Identifier "Layout0"
        Screen "Screen0"
        InputDevice "touchscreen" "CorePointer"
    EndSection

    Section "InputDevice"
        Identifier "touchscreen"
        Option "Device" "/dev/input/event2" #linuxdeploy
        Driver "mtev"
        Option "Rotation" "1"
    EndSection

    Section "Device"
        Identifier "Card0"
        Driver "fbdev"
        Option "fbdev" "/dev/graphics/fb0" #linuxdeploy
        Option "Rotate" "CW"
    EndSection

    Section "Screen"
        Identifier "Screen0"
        Device "Card0"
        DefaultDepth 24
        SubSection "Display"
            Depth 24
        EndSubSection
    EndSection
```

- Run GNU/Linux via Linux Deploy in frame buffer mode ("Properties" -> "Graphics subsystem" -> "Framebuffer"). You can use the virtual keyboard [florence](https://packages.debian.org/search?keywords=florence) to type.
