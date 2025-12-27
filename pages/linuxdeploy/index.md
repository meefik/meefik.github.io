---
permalink: /linuxdeploy
layout: page
title: Linux Deploy for Android
description: Linux Deploy is an open-source Android application that facilitates the quick and easy installation of GNU/Linux operating systems on Android devices.
image: /assets/images/linuxdeploy-2.png
comments: false
footer: false
---

This application is [open-source software](https://github.com/meefik/linuxdeploy) for quick and easy installation of the operating system GNU/Linux on your Android device.

![Linux Deploy](/assets/images/linuxdeploy-2.png)

The application creates a disk image or a directory on a flash card or uses a partition, mounts it and installs an OS distribution. Applications of the new system are run in a chroot environment and working together with the Android platform. All changes made on the device are reversible, i.e. the application and components can be removed completely. Installation of a distribution is done by downloading files from official mirrors online over the internet. The application can run better with superuser rights (root).

You can manage the process of installing the OS, and after installation, you can start and stop services of the new system (there is support for running your scripts) through the UI. The installation process is reported as text in the main application window. During the installation, the program will adjust the environment, which includes the base system, SSH server, VNC server and desktop environment. The program interface can also manage SSH and VNC settings.

Installing a new operating system takes about 15 minutes. The recommended minimum size of a disk image is 1024 MB (with LXDE), and without a GUI - 512 MB. When you install Linux on the flash card with the FAT32 file system. After the initial setup the password for SSH and VNC generated automatically.

Features:

- Bootstrap: Alpine, Arch, CentOS, Debian, Fedora, Kali, Slackware, Ubuntu, Docker or from rootfs.tar
- Installation type: image file, directory, disk partition, RAM
- Supported file systems: ext2, ext3, ext4
- Supported architectures: arm, arm64, x86, x86_64, emulation mode (ARM ~ x86)
- Control interface: CLI, SSH, VNC, X11, Framebuffer
- Desktop environment: XTerm, LXDE, Xfce, MATE, other (manual configuration)
- Supported languages: multilingual interface

The app is available for download on Google Play and GitHub ([Privacy Policy](/linuxdeploy/privacy)):

<div class="no-border">
  <a href="https://play.google.com/store/apps/details?id=ru.meefik.linuxdeploy" target="_blank" rel="nofollow noopener"><img src="/assets/images/get-it-on-google-play.png" alt="Get it on Google Play"></a>
  <a href="https://github.com/meefik/linuxdeploy/releases/latest" target="_blank" rel="nofollow noopener"><img src="/assets/images/get-apk-from-github.png" alt="Get it on Github"></a>
</div>

<p><iframe src="https://ghbtns.com/github-btn.html?user=meefik&repo=linuxdeploy&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe></p>
