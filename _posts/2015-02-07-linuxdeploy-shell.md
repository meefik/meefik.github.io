---
layout: post
title: Managing Linux Deploy from the command line
description: How to use the linuxdeploy command line script to manage Linux Deploy environments.
date: 2015-02-07 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

In addition to the graphical interface, Linux Deploy allows you to manage a GNU/Linux system instance from the command line via the Android terminal emulator. For these purposes, a special **linuxdeploy** script is used, which can be run from the Android command line and accepts the following parameters:

- **prepare** - Prepare a container, create an image, and create a file system;
- **mount** - Mount the container;
- **umount** - Unmount the container;
- **install** - Start the installation of a new system;
- **configure** - Launch the container reconfiguration;
- **start** - Launch the container;
- **stop** - Stop the container;
- **shell** - Execute chroot in a container;
- **status** - Information about the system.

<!--more-->

By default, the `linuxdeploy` script is located in the `ENV_DIR/bin/linuxdeploy` directory, where `ENV_DIR` is the directory of the working environment (by default `/data/data/ru.meefik.linuxdeploy/linux`), but access to it can be made more convenient (without specifying the full path to the script) if you place a symbolic link to this script in `/system/bin`. To do this, in the Linux Deploy settings there is an option "Settings" -> "Create a simlink", after changing the parameter, you need to update the environment ("Settings" -> "Update ENV").

All settings set through the Linux Deploy GUI are stored in the file `ENV_DIR/etc/deploy.conf`. They can be changed by editing this file, but it should be borne in mind that any changes to the parameters through the graphical interface will overwrite the file and lose the changes made. Switching profiles also overwrites the configuration file. However, you can copy the original configuration file, for example, to a memory card, edit it, and specify this file as the "-c FILE" parameter.

The `linuxdeploy shell` command is probably the most useful and necessary for accessing the command line of the installed distribution directly from the Android terminal. This command also has an optional parameter that accepts the command to be executed after switching to chroot, the bash command interpreter is started by default.

Usage examples:

```sh
linuxdeploy shell date
linuxdeploy shell "uname -a"
linuxdeploy shell /bin/bash
```
