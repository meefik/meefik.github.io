---
layout: post
title: Launch Bodhi Linux on Android
description: Guide to launching Bodhi Linux distribution on Android using Linux Deploy.
image: /assets/images/linuxdeploy-bodhilinux-e17.png
date: 2013-01-02 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy supports the launch of the [Bodhi Linux](https://www.bodhilinux.com) distribution on Android.

![linuxdeploy](/assets/images/linuxdeploy-bodhilinux-e17.png "Bodhi Linux и E17"){: .center}

<!--more-->

### Playbook

- Get a link to the <a href="http://sourceforge.net/projects/bodhilinux/files/ARMHF/rootfs/">rootfs Bodhi Linux archive</a>.

- In the Linux Deploy application, create a new profile and specify the following in the parameters:
  - *Distribution* - RootFS;
  - *Mirror URL* - the previously obtained link (for example, http://netcologne.dl.sourceforge.net/project/bodhilinux/ARMHF/rootfs/bodhi-rootfs-20130124.tar.gz);
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/bodhi.img`);
  - *User name* - android;
  - *Desktop environment* - Other.
  
- Run installation ("Properties" -> "Install"). At this stage, a new system image is created into which the rootfs archive is unpacked.

- After the installation is complete, go back to the Linux Deploy settings and change the following:
  - *Distribution* - Debian;
  - *Distribution suite* - wheezy;
  - *Architecture* - armhf;
  - *Desktop environment* - Other.
  
- Run reconfiguration ("Properties" -> "Reconfigure"). At this stage, the installation of the GUI (SSH server, VNC server) is performed.

- Start Linux with the START button from the main application window. Connect via SSH: login - `android`, password - `changeme`.

- Use the SSH terminal to configure autostart of the desktop environment:
```sh
    cat << EOF > ~/.vnc/xstartup
    XAUTHORITY=\$HOME/.Xauthority
    LANG=ru_RU.UTF-8
    export XAUTHORITY LANG
    echo \$\$ > /tmp/xsession.pid
    enlightenment_start
    EOF
    chmod 755 ~/.vnc/xstartup
```

- Install the missing packages:
```sh
    sudo apt-get install locales openssh-server -yq
```

- Restart GNU/Linux through the program interface.

- Connect via VNC, password - `changeme`. The [E17](https://en.wikipedia.org/wiki/Enlightenment_(software)) environment desktop should open.
