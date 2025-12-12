---
layout: post
title: Using Linux Deploy CLI on desktops
description: Guide to using Linux Deploy CLI for deploying GNU/Linux containers on desktop Linux systems.
date: 2016-01-26 12:00:00 +0000
categories: [linuxdeploy]
comments: true
---

Despite the fact that initially Linux Deploy (abbreviated LD) was conceived as an application for Android, over time there are other options for its application. With the Linux Deploy CLI, a number of new features have become available that open up new uses for the tool.

[Linux Deploy CLI](https://github.com/meefik/linuxdeploy-cli) is a command-line application designed to automate the process of installing, configuring, and running GNU/Linux distributions inside a chroot container. The application can work both in ordinary desktop Linux-distributions and on mobile platforms based on the Linux kernel, provided that the necessary dependencies are observed (all dependencies can be collected statically). Applications from the Linux distribution run in a chroot environment, operate in parallel with the main system, and are comparable with it in terms of speed. Since the work of Linux Deploy is based on a system call to the Linux kernel, only Linux distributions can act as guest systems.

<!--more-->

The application can work in two modes: with superuser rights (chroot) and without them (proot). In normal mode, all supported installation types are available: installation in a file, on a disk partition (logical disk), in a POSIX compatible directory and in RAM (tmpfs). In proot mode, installation is only available in the directory, and a number of restrictions appear:

- all users inside the container have full access to the entire file system of the container, and the owner of all files and directories is the current user;
- no access to privileged operations with the system, for example, `ping`, `ulimit`, etc. does not work;
- applications can only work with network port numbers higher than 1024.
- if the application uses the chroot system call in its work, then it must be run through a special fakechroot utility, for example, `fakechroot /usr/sbin/sshd -p 2222`.

The application supports automatic installation (base system) and initial configuration of distributions of Debian, Ubuntu, Kali Linux, Arch Linux, Fedora, CentOS, Gentoo, openSUSE and Slackware. Installation of Linux-distribution is carried out over the network from the official mirrors on the Internet. It also supports importing any other system from a pre-prepared rootfs archive in the format tar.gz, tar.bz2 or tar.xz. The application allows you to connect to the console of the installed system (container), as well as start and stop applications inside the container (there is support for various initialization systems and own autoplay scenarios). Each installation option is saved in a separate configuration file, which is responsible for setting up each container. If necessary, containers can be started in parallel. You can export the configuration and the container itself as a rootfs archive for later deployment of this container without re-installing and configuring it.

In general, the idea of Linux Deploy arose from the desire to get an easy and convenient tool for quickly deploying a Linux distribution that could be used for development, testing or training purposes, and then quickly remove it without making changes to the main (host) Linux system and without risking its integrity. The [proot](https://proot-me.github.io) program made it possible to create containers for running Linux applications without root privileges, and to use the [QEMU](https://en.wikipedia.org/wiki/QEMU) software emulation to run applications with a different architecture from the host without the need to support the [binfmt_misc](https://en.wikipedia.org/wiki/Binfmt_misc) module at the kernel level.

It so happens that my main job since 2011 is using computers with Debian. Local developers periodically need a system to run and test their web applications (mainly Java, PHP, Python). For this purpose, virtual systems were usually used either on the basis of VirtualBox, or in the local Proxmox cloud, or Docker. The main disadvantage of VirtualBox is its demanding computer resources, large VDI disk image size, relatively low speed and the likelihood of VM image failure if the system is incorrectly turned off. The disadvantage when using the "cloud" can be called the need for the administrator himself to service user requests for the creation of such systems, as well as spending the resources of the "cloud" on minor tasks. Superuser rights are required to use Docker.

This month, an experiment was conducted, PHP developers their virtual server was replaced by an LD container. Two Debian-based containers were prepared: Apache + PHP + OCI8 and Apache + PHP + MySQL + PhpMyAdmin. Containers were placed on a shared network drive on a local network, the size of each container was about 150 MB.

What the administrator got from this:

- once prepared, the container can be deployed on the developer's computer by one team without the participation of the administrator;
- working with the container does not require superuser rights, so there is no risk of failure of the main system.

What the developer got:

- deployment, launch, and management of the system in the container is carried out without the participation of an administrator by one team;
- deployment of the container from pre-prepared archives is carried out over the network in less than a minute;
- start and stop the container (Web server + database) occurs instantly, you do not need to wait for the operating system to start;
- there is no risk of damaging the container if you forget to disconnect it when turning off the computer, because the system image is a normal directory without its own file system;
- the computer works faster, because resources are spent only on the software being run in the container, and not on the entire operating system (in our case, this is about 50 MB, instead of 500 MB in VirtualBox).
- checking the operability of the software directly from the IDE directory without having to fill it to the server, for this it is enough to connect the necessary directory of the main system to the container.

Now for more details on how to do this. Following are instructions for preparing and deploying the LD container.

To run containers without superuser rights, you must install [proot](https://proot-me.github.io):
```sh
mkdir ~/bin
wget https://proot.gitlab.io/proot/bin/proot -O ~/bin/proot
chmod 755 ~/bin/proot
```

To download and install the Linux Deploy CLI:
```sh
wget -O cli.zip https://github.com/meefik/linuxdeploy-cli/archive/master.zip
unzip cli.zip
rm cli.zip
ln -sf ~/linuxdeploy-cli/cli.sh ~/bin/linuxdeploy
```

Create a configuration named "linux" to deploy the Debian Wheezy base system (64 bits):
```sh
linuxdeploy -p linux conf --method='proot' --source-path='http://deb.debian.org/debian/' \
    --distrib='debian' --arch='amd64' --suite='wheezy' --target-path='$ENV_DIR/rootfs/linux' \
    --chroot-dir='$TARGET_PATH' --target-type='directory' --username='webmaster' --include='bootstrap'
```

View saved configuration:
```sh
linuxdeploy -p linux conf -x
```

Starting a new system deployment:
```sh
linuxdeploy -p linux deploy
```

Connecting to the container console as root (the `exit` command to stop):
```sh
linuxdeploy -p linux shell -u root
```

Next, you can install and configure the necessary software in the container, but you should take into account the features described above. For example, to run Apache, you need to change its port (file `/etc/apache2/ports.conf`) to 8000, set the empty parameter `APACHE_ULIMIT_MAX_FILES=" "` (file `/etc/apache2/envvvars`), and run `apachectl` itself from under an ordinary user (not root).

Configuring autostart based on the SysV initialization system:
```sh
linuxdeploy -p linux conf --include='$INCLUDE init' --init='sysv' --init-level='3' --init-user='$USER_NAME' --init-async
```
Parameters: INIT_LEVEL - SysV initialization level, INIT_USER - from under which user to run services (by default this is root), INIT_ASYNC - to run services in parallel.

Preparing the configuration, exporting it and exporting the container to the rootfs archive (tar.gz, tar.bz2 and tar.xz archives are supported):
```sh
linuxdeploy -p linux conf --source-path='linux.tgz' --target-path='\$ENV_DIR/rootfs/linux' --chroot-dir='\$TARGET_PATH'
linuxdeploy -p linux conf -x > /path/to/linux.conf
linuxdeploy -p linux export /path/to/linux.tgz
```

Escaping "\$" allows you to save the names of variables to config, rather than their values. Thus, when importing a config, these variables will be automatically replaced with the corresponding values, which may differ from the current values.

Now, there are two files (`linux.conf` and `linux.tgz`) that you can use when importing a container on another computer:
```sh
cd /path/to
linuxdeploy -p linux conf -i ./linux.conf
linuxdeploy -p linux deploy
```

Connect the main system directory to the container (directory `~/www` connect to `/var/www container`):
```sh
linuxdeploy -p linux conf --mounts='$HOME/www:/var/www'
```

Starting the container (`/etc/rcN.d/SXXname start` commands are executed for SysV):
```sh
linuxdeploy -p linux start
```

Stop container and release resources (`/etc/rc6.d/KXXname stop` commands are executed for SysV):
```sh
linuxdeploy -p linux stop -u
```

The result is a solution that meets the needs of both developers and administrators.
