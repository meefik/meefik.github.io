---
layout: post
title: Desktop environment in Linux Deploy 2.0
description: Guide to installing and configuring various desktop environments in Linux Deploy 2.0.
image: /assets/images/linuxdeploy-debian-lxde.png
date: 2016-09-14 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy supports automatic installation and configuration of some of the most common desktop environments. Version [LD 2.0](https://github.com/meefik/linuxdeploy/releases) retains support for XTerm (full-screen terminal), LXDE, Xfce, and MATE environments. These environments are in almost all supported LD distributions, they are not very demanding on resources and can work without graphical acceleration. However, you can start other desktop environments manually. To do this, in the LD settings, select the "Other" desktop environment and execute the "Configure" command. After that, you need to connect to the container, install the packages of the desired environment of the desktop, and under the user (by default - android) edit the file `~/.xsession`, prescribing the command to start the working environment.

<!--more-->

You can install and configure various work environments as follows (using the example of the Debian/Ubuntu distribution):

### 1. GNOME

Installation:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils gnome-core
```

File `~/.xsession`:
```sh
XKL_XMODMAP_DISABLE=1
export XKL_XMODMAP_DISABLE
if [ -n "`gnome-session -h | grep '\-\-session'`" ]
then
   gnome-session --session=gnome
else
   gnome-session
fi
```

### 2. KDE

Installation:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils kde-standard
```

File `~/.xsession`:
```sh
startkde
```

### 3. E17

Installation:
```sh
apt-get install desktop-base dbus-x11 x11-xserver-utils xfonts-base xfonts-utils e17
```

File `~/.xsession`:
```sh
enlightenment_start
```

### 4. Cinnamon

Installation:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils cinnamon
```

File `~/.xsession`:
```sh
XKL_XMODMAP_DISABLE=1
export XKL_XMODMAP_DISABLE
cinnamon
```
