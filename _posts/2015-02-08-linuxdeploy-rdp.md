---
layout: post
title: Installing and configuring the RDP server
description: Guide to setting up Remote Desktop Protocol (RDP) access on Linux Deploy.
date: 2015-02-08 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy uses [VNC](https://en.wikipedia.org/wiki/Virtual_Network_Computing) as the default graphics subsystem, as the most native remote access to the GNU/Linux desktop system. However, you can configure remote access via the [RDP](https://en.wikipedia.org/wiki/Remote_Desktop_Protocol) protocol used in MS Windows operating systems. The example uses the Ubuntu 12.04 distribution (Precise Pangolin), but with minor changes this will work in other distributions. In this case, the RDP will run on top of the VNC server, so it is required that it be installed. In Linux Deploy, the VNC server is installed by default.

<!--more-->

### Playbook

- Start the pre-installed GNU/Linux system with the START button from the main application window.

- Connect to the system via SSH, VNC (the IP address for connecting is indicated in the upper line of the main application window) or through the Android terminal (linuxdeploy shell script).

- Open the command line (terminal) of the system and switch to superuser mode:
```sh
sudo -s
```

- Install xrdp package:
```sh
apt-get install xrdp
```

- Allow xrdp user to work with network:
```sh
usermod -aG aid_inet xrdp
```

- To automatically start and stop the RDP server via the Linux Deploy interface, you must allow user scenarios ("Properties" -> "Custom scripts") in the settings and add the `/etc/init.d/xrdp` path to the list of scripts.

- Restart the GNU/Linux system with the STOP/START buttons from the main application window.

- Connect via the RDP client: module - sesman-Xvnc, username - `android`, password - `changeme`.
