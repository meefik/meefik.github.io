---
layout: post
title: Announcement of Linux Deploy 2.0
description: Preparing for the release of Linux Deploy 2.0 with new features and modular architecture.
date: 2015-12-08 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Preparing for the release of the next version of Linux Deploy, which will include many new interesting features. The main one's are:

- work with containers without superuser rights (based on [proot](https://proot-me.github.io)), including architecture emulation without the need to support the [binfmt_misc](https://en.wikipedia.org/wiki/Binfmt_misc) module at the core level;
- modular architecture based on plug-in components;
- updated application interface for Android;
- built-in Android-application management interface via telnet and web interface;
- extended CLI for managing containers from the command line;
- CLI with support for various platforms based on the Linux kernel, not only Android;
- repository of finished containers (container configurations and rootfs archives for them).

<!--more-->

The [Linux Deploy 2.0 command line interface](https://github.com/meefik/linuxdeploy-cli) is already available for testing, which has changed significantly. Now it allows you to create, configure and fully manage containers through the `linuxdeploy` command. Each container has a configuration file that contains all the parameters for deploying and running a specific distribution. You can work with several configurations, switching between them if necessary. Linux Deploy now has a modular architecture consisting of separate components written in a Bash-compatible ash scripting language. Components are interconnected by dependencies and are connected in a given order, there is protection against cyclic dependencies. Each component has five basic functions that are action handlers: installation, configuration, start, stop, help. The components have a tree structure and are located in the root directory, which is set in the `INCLUDE_DIR` environment variable. Each component is a directory containing the files required by the component. There are two main files: `deploy.conf` - component configuration, `deploy.sh` - component functions.

Components are divided into several groups responsible for a certain functionality. For example, the bootstrap component group is responsible for preparing rootfs and deploying the distribution. The core component group includes basic distributions settings and basic functions for working with containers. There are also groups to support various initialization systems, graphics subsystem and desktop environments, as well as a collection of components for installing and running various software. By combining components, you can build your own version of the distribution with the necessary set of programs.

Let's say we want to create a container with Arch Linux as standard. To create a container, first you need to set its parameters, use the `config` command:
```sh
linuxdeploy -p arch config --target-path='linux.img' --chroot-dir='/mnt' \
    --target-type='file' --disk-size='2000' --fs-type='auto' \
    --source-path='http://mirrors.kernel.org/archlinux/' --distrib='archlinux' --arch='i686' \
    --user-name='android' --include='bootstrap'
```

The dump of the resulting configuration file can be obtained using the command:
```sh
linuxdeploy -p arch config -x

TARGET_PATH="linux.img"
CHROOT_DIR="/mnt"
TARGET_TYPE="file"
DISK_SIZE="2000"
FS_TYPE="auto"
SOURCE_PATH="http://mirrors.kernel.org/archlinux/"
DISTRIB="archlinux"
ARCH="i686"
USER_NAME="android"
INCLUDE="bootstrap"
```

When the basic parameters are set, you can start the installation with the `deploy` command:
```sh
linuxdeploy -p arch deploy
```

This parameterless command starts the installation and configuration of all components connected through the `INCLUDE` parameter, in this case bootstrap. Once the deployment and configuration process is complete, you can connect to the container with the `shell` command:
```sh
linuxdeploy -p arch shell -u root
```

We may need to install some additional components in the future without reinstalling the basic system, then you can use the following command, for example, to install an ssh server:
```sh
linuxdeploy -p arch deploy -n bootstrap extra/ssh
```

Here, the option "-n bootstrap" excludes from the installation the components of the bootstrap group on which the `extra/ssh` component depends. The following commands will work in the same way, but the `extra/ssh` component will be saved in the container configuration:
```sh
linuxdeploy -p arch config --include='${INCLUDE} extra/ssh'
linuxdeploy -p arch deploy -n bootstrap
```

Here, the `${INCLUDE}` variable is taken from the current configuration and in this case contains "bootstrap". The expanded container can be exported as a rootfs archive:
```sh
linuxdeploy -p arch export rootfs.tar.gz
```

Sometimes you need to import the distribution from the rootfs archive, for this you can use the following commands:
```sh
linuxdeploy -p arch config --source-path='rootfs.tar.gz'
linuxdeploy -p arch deploy bootstrap/rootfs
```

The list of created configurations can be viewed through the `conf` command:
```sh
linuxdeploy -p arch config

arch            archlinux  i686       latest     bootstrap extra/ssh
centos          centos     i386       7          bootstrap init
debian          debian     i386       jessie     bootstrap graphics desktop
fedora          fedora     i386       21         bootstrap
gentoo          gentoo     i686       latest     bootstrap
kali            kalilinux  i386       sana       bootstrap
opensuse        opensuse   i586       13.2       bootstrap
slackware       slackware  x86        latest     bootstrap
ubuntu          ubuntu     i386       wily       bootstrap
```

The list of available components can be viewed through the `conf` command. Each component is compatible with all or only some distributions. The list of components connected (via `INCLUDE`) and compatible with the current configuration with their dependencies can be obtained with the command:
```sh
linuxdeploy -p arch config -l

bootstrap                      Installer of Linux distibution
bootstrap/debian               Bootstrap for Debian GNU/Linux
bootstrap/rootfs               Prepare and import RootFS
core                           Core components
core/aid                       Android users and groups
core/emulator                  CPU emulation
core/hostname                  Hostname
core/hosts                     Hosts file
core/locale                    Localization
core/mnt                       Mount points configuration
core/motd                      Message after a successful login
core/net                       Network configuration
core/profile                   User and its environment
core/proot                     PRoot configuration
core/su                        SU command
core/sudo                      Sudoers file
core/timezone                  Time zone
core/unchroot                  Break chroot
```

List of all components:
```sh
linuxdeploy config -la
```

List of dependencies for a specific component:
```sh
linuxdeploy -p arch config -l extra/ssh
```

Starting/stopping the current configuration with all components is done with `start` and `stop` commands, for example:
```sh
linuxdeploy -p arch start
```

Help for all connected components can be obtained with the `help` command, information about a particular component can be obtained as follows:
```sh
linuxdeploy help extra/ssh

Name: extra/ssh
Description: Secure shell (SSH) server
Target: debian:*:* ubuntu:*:* kalilinux:*:* archlinux:*:* fedora:*:* opensuse:*:* gentoo:*:* slackware:*:*
Depends: extra
Help:

   --ssh-port=PORT
     Port of SSH server.

   --ssh-args=STR
     Defines other sshd options, separated by a space.

```

At the moment, testing and debugging of the CLI is underway, it was possible to achieve the installation of Debian (wheezy), Ubuntu (precise), Kali Linux (moto), Arch Linux, Gentoo and Slackware distributions without superuser rights.
