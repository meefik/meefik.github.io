---
layout: post
title: Instructions for installing GNU/Linux via Linux Deploy
description: Step-by-step guide to install a GNU/Linux distribution on Android using Linux Deploy.
date: 2012-11-18 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Instructions for installing the GNU/Linux distribution via Linux Deploy for Android:

1. Connect WiFi or another network with Internet access. Installation is carried out over the network and will not work without Internet access.

2. Make sure that you have superuser (root) rights on the device.

3. Install the latest version of [Linux Deploy](https://play.google.com/store/apps/details?id=ru.meefik.linuxdeploy).

4. Install the [BusyBox](https://play.google.com/store/apps/details?id=ru.meefik.busybox) app and start the installation with the "Install" button. By default, BusyBox is installed in the `/system/xbin` directory, which usually does not need to be changed. If the installation directory already contains utilities of the same name, they will not be replaced by utilities from BusyBox, which can subsequently lead to problems with Linux Deploy. To prevent this from happening, in the BusyBox settings the option "Settings" -> "Replace applets" must be selected.

5. Launch the Linux Deploy application and go to settings. Verify that "Settings" -> "BusyBox directory" specifies the BusyBox installation directory in the previous step. If for some reason BusyBox cannot be installed on the system partition (for example, HTC has a system partition write lock), you can specify the `/data/data/ru.meefik.busybox/files/bin` path as the BusyBox directory. After changing the BusyBox directory, you need to update the working environment of the "Settings" -> "Update ENV". It is useful to leave the "Settings" -> "Screen Lock" option enabled: while the application is active, the screen, WiFi and processor will not go into sleep mode.

6. The program supports work with several profiles, where the settings for each Linux instance are stored. You can quickly switch between instances through the profile management window (opens by clicking on the icon in the header of the main window). By default, a profile is created with the name Linux. Go to the settings of the current profile (rightmost button) and set the necessary options for installing and running the GNU/Linux distribution (see [description of parameters](/2012/11/19/linuxdeploy-properties/)).

7. Start the installation from the "Properties" -> "Install" button. The installation log is displayed in the main application window. Installation takes about 30 minutes on average.

8. If the installation is complete without errors, you can start the Linux system with the "START" button. This will start the services selected in the parameters - SSH, VNC.

9. To access the Linux console over SSH, you must install [ConnectBot](https://play.google.com/store/apps/details?id=org.connectbot) (or another SSH client). To access the Linux desktop, you must install a VNC client, such as [VNC Viewer](https://play.google.com/store/apps/details?id=com.realvnc.viewer.android). The default settings for connecting to the system via VNC are: Host - `127.0.0.1`, Port - `5900`. The default password for SSH and VNC is changeme. You can change the password of the current user in the application settings, either from the console with the passwd command for SSH or vncpasswd for VNC. To run programs from the root user, use the sudo command (for example, sudo synaptic). By default, the root user (unless specified in the settings as the user name) does not have a password, but you can set a password for it with sudo passwd root.

10. To stop the Linux system, all the services running under it and unmount the disks, just press the "STOP" button.
