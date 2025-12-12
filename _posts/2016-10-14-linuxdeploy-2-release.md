---
layout: post
title: Release Linux Deploy 2.0
description: Overview of new features and improvements in the Linux Deploy 2.0 release.
image: /assets/images/linuxdeploy-2.png
date: 2016-10-14 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Today was the official release of Linux Deploy 2.0, which includes many new developments that have been conducted over the past year. Not everything could be realized from what was conceived for one reason or another, it's time to figure out what exactly has changed and how to live with it. For more details, see [the project page](/linuxdeploy).

![linuxdeploy](/assets/images/linuxdeploy-2.png "Linux Deploy 2.0")

<!--more-->

### Graphic interface

The application interface has been redesigned in a modern way — Material Design. In addition to styling, the functions of the application are more logically divided into sections, a sliding navigation panel has been added. Thanks to the compatibility library, the interface is almost equally displayed under different versions of Android, starting with Android 2.3.3. You can [see here](https://www.youtube.com/watch?v=9b8PnZge7vA) a screencast of the Linux Deploy application.

### Command Line Interface

The command line interface [Linux Deploy CLI](https://github.com/meefik/linuxdeploy-cli) has undergone significant changes, the application core is divided into separate parts — components, and the interface itself now allows you to manage almost all the functions of Linux Deploy without a graphical interface at all. CLI can also be used outside of Android (on other [Linux-based systems](/2016/01/26/linuxdeploy-cli-on-pc/)) as a stand-alone application that only requires a set of [BusyBox](https://github.com/meefik/busybox) utilities to work. Another nice feature is the unified configuration files for the CLI and the Android application interface, i.e. the settings changed through the CLI are displayed in the application interface and vice versa.

### Control connections

Linux Deploy now has the ability to access the CLI not only from the Android terminal or via adb, but also via telnet or the web interface. The most interesting feature is the web terminal, which provides access to the command line on the device directly through the browser, which became possible thanks to the [websocket.sh](https://github.com/meefik/websocket.sh) and [xterm.js](https://github.com/sourcelair/xterm.js) projects (details can be [found here](/2016/08/04/websocket-sh/)). Access to the web interface is limited by rules (several rules can be set through a space) in [httpd format](https://wiki.openwrt.org/doc/howto/http.httpd), for example, by default, access is limited by login and password ("/:username:password"), or you can open access for everyone ("A:\*"), or only for a specific IP address ("A:127.0.0.1").

### Support for new versions of distributions

Added support for Debian 9 (stretch), Fedora 24 and Ubuntu 16.10 (yakkety) distributions, and improved support for other distributions. The tests showed that the base installation is currently running for all supported distributions, including arm and x86 architectures.

### Support for desktop environments

Added support for the MATE desktop environment, but due to various problems with the launch of GNOME and KDE, it was necessary to abandon their support. The problems are due to inflated resource requirements, as well as the lack of graphical acceleration of X and VNC in Android.

### Running containers without superuser rights

High hopes were placed on the function of running GNU/Linux applications without superuser rights, which is based on the capabilities of the program [PRoot](https://github.com/meefik/PRoot). The PRoot project offers a tool that allows you to run applications that require certain system privileges by intercepting and replacing system calls using a trace mechanism. Unfortunately, the project itself has not been updated since 2015, support has been discontinued. However, a fork of the project was made. We managed to make a number of changes and even release [version 5.1.1](https://github.com/meefik/PRoot/releases/tag/v5.1.1), thanks to which PRoot earned in Android 5+, and the fake_link extension was added to emulate hard links that stopped working in Android 6+. But, unfortunately, the efforts to refine PRoot did not justify themselves, because in Android 5+ SELinux settings have become so severe that some system calls have ceased to work under the usual user. These include working with pty, managing users and groups, and accessing /dev. At the moment, the installation of distributions without superuser rights for Android 5+ does not work, and the launch of ready-made containers is possible, but with great restrictions.

### Support for initialization systems

Previously, running scripts inside the container at its start was carried out according to the list. Now there is support for two initialization systems — run-parts and sysv. The run-parts system works simply by specifying the path to the file or directory to run when the container starts. If the directory is specified, all files in the directory are run in alphabetical order, the parameter is passed "start", and stopped in reverse order, and the parameter "stop" is passed. The sysv initialization system implies the indication of the startup level (number 0 - 5), starting and stopping scenarios is carried out in accordance with this initialization system. As additional options, you can specify the user under whom the scripts will be run, as well as the method of starting — asynchronous (parallel) or normal (sequential).

### Interaction with Android from the container

Now you can send messages to the notification panel in Android directly from the container. To do this, use commands that can be executed through unchroot. Display notification:
```sh
am broadcast -a ru.meefik.linuxdeploy.BROADCAST_ACTION --user 0 --es "info" "Hello World!"
```
Display warning:
```sh
am broadcast -a ru.meefik.linuxdeploy.BROADCAST_ACTION --user 0 --es "alert" "Hello World!"
```
Hide message:
```sh
am broadcast -a ru.meefik.linuxdeploy.BROADCAST_ACTION --user 0 --esn "hide"
```

### Container repository

Now, in addition to installing distributions from official sources, it is possible to download a ready-made container from the container repository <http://hub.meefik.ru>. This will reduce installation time and traffic, as well as bypass some of the possible problems that may arise when installing in the usual way. At the moment, containers with Debian (arm and x86) are available in the repository, the rest of the distributions become available after buying the [Piggy Helper](https://play.google.com/store/apps/details?id=ru.meefik.donate) application (donation application). Paid access to the repository is dictated by the need to pay for hosting with large outgoing traffic, as well as the need to keep the archives of containers up to date.

### Other cool features

The new functions do not end there. In addition to many minor improvements, the following can be distinguished:

- added the function of synchronizing the working environment with the server or other device (the `linuxdeploy sync` command);
- added generation of a random user password (instead of "changeme");
- added the function of tracking network changes and updating the current container (the `NET_TRIGGER` parameter may contain the path to the file that will be executed when changes are made to the network);
- added the ability to add users to `aid_*` groups from the application interface (`PRIVILEGED_USERS` parameter);
- added the option to prevent the processor from braking when the screen is turned off;
- extended the syntax of the description of mount points, now you can specify where and where to mount "/from/dir:/to/dir".

### Feedback

Support for Russian-speaking users is carried out on the [4pda forum](https://4pda.to/forum/index.php?showtopic=378043) and English-speaking — in the [question section](https://github.com/meefik/linuxdeploy/issues) on the GitHub project page. The app itself can be downloaded from [Google Play](https://play.google.com/store/apps/details?id=ru.meefik.linuxdeploy) or from [GitHub](https://github.com/meefik/linuxdeploy/releases).
