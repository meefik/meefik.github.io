---
layout: post
title: Launch Raspbian MATE on Android
description: Running the Raspbian MATE distribution on Android using Linux Deploy.
date: 2013-01-04 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

The <a href="http://www.raspbian.org/RaspbianMate">Raspbian MATE</a> distribution is based on Debian and is being developed for the Raspberry Pi, using <a href="http://mate-desktop.org/">MATE</a> as the desktop environment. This distribution can be run on Android via Linux Deploy.

![linuxdeploy](/assets/images/linuxdeploy-raspbian-mate.png "Rapsbian MATE"){: .center}

<!--more-->

### Playbook

- Download image from the <a href="http://www.raspbian.org/PiscesMATEImages">official website</a>: <a href="http://archive.raspbian.org/assets/images/rpi_pisces_mate_r2.zip">rpi_pisces_mate_r2.zip</a>

- Extract an image of the third partition from the full image (run it under Linux):
```sh
kpartx -v -a rpi_pisces_mate_r2.img
dd if=/dev/mapper/loop0p3 of=/tmp/rpi_pisces_mate.img bs=1M
```

- Copy the rpi_pisces_mate.img file to the device memory card.

- In the Linux Deploy application, create a new profile and specify in the properties:
  - *Distribution* - Debian;
  - *Distribution suite* - wheezy;
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/rpi_pisces_mate.img`);
  - *User name* - raspbian;
  - *Desktop environment* - Other.
  
- Run reconfiguration ("Properties" -> "Reconfigure").

- Start GNU/Linux with the "START" button from the main application window. Connect via SSH: login - `raspbian`, password - `changeme`.

- Configure desktop environment autostart via VNC:
```sh
cat << EOF > ~/.vnc/xstartup
XAUTHORITY=\$HOME/.Xauthority
LANG=ru_RU.UTF-8
export XAUTHORITY LANG
echo \$\$ > /tmp/xsession.pid
mate-session
EOF
chmod 755 ~/.vnc/xstartup
```

- Restart GNU/Linux through the program interface.

- Connect via VNC, password - `changeme`. The MATE desktop should open.
