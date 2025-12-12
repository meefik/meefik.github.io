---
layout: post
title: A bit about Linux Deploy
description: Statistics and features of the Linux Deploy project after three years of development.
date: 2015-09-04 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

The [Linux Deploy](/2012/08/21/linuxdeploy-release/) project (LD for short) is now three years old, and here are some statistics. The current version of LD 1.5.2-160 is 52 releases and 160 updates, [GitHub](https://github.com/meefik/linuxdeploy) has 18,805 lines of code. More than 10,000 devices have been supported since Android 2.1. About 500 thousand installations. At the moment, LD supports 8 distributions (Debian, Ubuntu, Kali Linux, Fedora, Arch Linux, Gentoo, openSUSE, Slackware), for which installers and configurators are specially written. Each distribution supports from 2 to 9 architectures (varieties arm and x86, 32 and 64 bits) and from 1 to 7 releases. A total of 121 versions of distributions and their architectures are supported. Each distribution can be automatically configured to work with 1 of 5 supported desktop environments (XTerm, LXDE, Xfce, GNOME, KDE), not to mention SSH, VNC, and Xorg configurations. Taking into account the desktop environments (distribution/architecture/desktop environment), 597 installation options are obtained, which can be automatically deployed and configured via LD.

<!--more-->

Few people know, but in LD there is a command line interface (CLI), which is accessible from the terminal through the command [linuxdeploy](/2015/02/07/linuxdeploy-shell/). Using the CLI, you can manage the process of deploying distributions without the Android graphical interface. Also, in the latest versions, the CLI supports work not only in Android, but also on ordinary computers under GNU/Linux operating systems. This can be useful for experimenting with different distributions, versions, and architectures. As for the architecture, LD supports the cross-architectural installation of arm <-> x86, the emulation is implemented using QEMU and works in both directions, i.e. you can run x86 distributions on arm architecture and arm distributions on x86 architecture. To support emulation mode, the Linux kernel must support [binfmt_misc](https://en.wikipedia.org/wiki/Binfmt_misc).

Often, pre-built distributions are available as rootfs-archives, which are tar-archives of the root file system. Such archives are used in container-based virtualization systems, such as [OpenVZ](https://en.wikipedia.org/wiki/OpenVZ) or [Docker](https://en.wikipedia.org/wiki/Docker_(software)). LD supports installation from rootfs archives, for this, in the LD settings, it is enough to select the type of RootFS installation and specify the path to the archive on the memory card or a link to the archive on the Internet. In the latest versions, the function of exporting as a rootfs archive of the system already installed in LD has been added. In the future, you can use container repositories to deploy and run them through LD.

Linux Deploy is an open non-profit project, the development of which depends on the contribution of third parties. If you are interested in this project, then support it with your participation.
