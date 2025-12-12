---
layout: post
title: Integrating Linux Deploy with Android
description: How to integrate GNU/Linux containers with the Android environment using Linux Deploy.
date: 2015-09-14 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Since version 1.5.3, Linux Deploy has begun work on integrating GNU/Linux containers with the Android environment. This opens up the following possibilities:

- access to the entire Android file system;
- execution of Android applications/commands directly from the container (for example, getprop, reboot, shutdown);
- switching between the container console and Android (`unchroot` command).

<!--more-->

To activate the ability to run Android applications, you need to enable mounting in the settings ("Properties" -> "Mounts"), and the/system directory (added by default) should be added as a mounting point ("Properties" -> "Mount points"). After that, you need to click the "START" button in the application so that the directory is mounted in the container. Commands from Android will be available from the container console if their names do not overlap with similar ones in the container, or are available along the full path, for example `/system/bin/ls`. The reboot and shutdown commands are automatically overridden in the container and call similar commands from Android.

If the ability to run some commands from Android is not enough, then you can use the switch between the container console and the Android unchroot command inside the container. Calling `unchroot` without parameters opens `sh` from Android with all its environment variables, call with parameters launches the corresponding command in Android. For example:

```
root@THL:/ # linuxdeploy shell
Configuring the container: 
dns ... done 
mtab ... done 
Debian GNU/Linux 8 (jessie) [running on Android via Linux Deploy] 
root@localhost:/# unchroot getprop ro.product.model
thl 5000
root@localhost:/# unchroot
root@THL:/ # ls /data/
...
root@THL:/ # exit
root@localhost:/#
```

Thus, having access to Android directly from the container, you can organize a tighter integration of running applications inside GNU/Linux containers with the Android system.
