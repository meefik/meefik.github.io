---
layout: post
title: Launch OpenPandora on Android
description: Running the OpenPandora distribution on Android using Linux Deploy.
date: 2013-08-25 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

You can run the [OpenPandora](http://www.openpandora.org) distribution via Linux Deploy on Android.

<!--more-->

### Playbook

- In the Linux Deploy 1.4.1+ application, create a new profile and specify the following in the parameters:
  - *Distribution* - RootFS;
  - *Mirror URL* - http://www.openpandora.org/firmware/pandora-rootfs.tar.bz2;
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/pandora.img`);
  - *Image size (MB)* - 1000 (possible more);
  - *User name* - android;
  - *Desktop environment* - Xfce;
  - *Install GUI* - No.

- Start the installation via "Properties" -> "Install". As a result, a disk image file must be created on the memory card and the rootfs archive unpacked into it.

- Start the SSH server (from the Android console, you can use the ConnectBot terminal):
```sh
linuxdeploy shell "/etc/init.d/dropbear start"
```
Now you can connect via SSH, login - `android`, password - `changeme`, port `22`.

- Stop SSH Server:
```sh
linuxdeploy shell "/etc/init.d/dropbear stop"
```

- Configuring automatic SSH start/stop via the Android interface of Linux Deploy (START/STOP buttons):
```sh
linuxdeploy shell "cp /etc/init.d/dropbear /etc/init.d/ssh"
```

**Notice:** In order for the linuxdeploy command to be available from the Android console, you need to allow creating a symbolic link in the system ("Settings" -> "Create a simlink") and updating the working environment ("Settings" -> "Update ENV") in the settings. However, this is an optional requirement, and you can call the `linuxdeploy` command using the full path `ENV_DIR/bin/linuxdeploy`, where `ENV_DIR` is the directory of the working environment, by default `/data/data/ru.meefik.linuxdeploy/linux`.
