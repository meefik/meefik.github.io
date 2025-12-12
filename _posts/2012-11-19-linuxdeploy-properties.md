---
layout: post
title: Overview of Linux Deploy options
description: The various settings and options available in Linux Deploy for installing GNU/Linux on Android.
date: 2012-11-19 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

The following describes the Linux Deploy settings for installing GNU/Linux distributions on Android.

<!--more-->

Linux Deploy configurable settings:

- *Properties -> Install*

Starts a new installation of the GNU/Linux system. The following settings are used during installation:

- *Properties -> Reconfigure*

Allows you to reconfigure an already installed system. All parameters of the current system will be reconfigured, including the reset of the user password.

- *Properties -> Export*

Allows you to save the archive of the container root file system. You must specify the path to the archive. Depending on the specified file extension (tar.gz or tar.bz2 archives are supported), an archive of the specified type will be created.

- *Properties -> Distribution*

Specifies which distribution to install. A number of other system deployment options depend on this setting.

- *Properties -> Distribution suite*

Allows you to specify one of several available versions of the selected distribution.

- *Properties -> Architecture*

Selecting an architecture indicates which distribution assembly to install. For example, the assembly of armhf differs from armel by supporting a set of processor instructions that allow you to perform floating point operations at the hardware floating point level. While armel supports only software implementation (software floating point). Thanks to optimization for modern processors, the armhf assembly potentially works faster, but it will not run on a processor that does not support new instructions. It should be noted that some distributions may not support a particular architecture from the list. When selecting the architecture of x86 on devices with ARM architecture will use the mode of emulation of the architecture with QEMU, but the emulation of the architecture reduces performance in about 3-4 times. Emulation will only work on devices where the kernel is built with support for the binfmt_misc module.

- *Properties -> Mirror URL*

Specifies the address of the repository from which the selected distribution will be installed.

- *Properties -> Installation type*

This parameter determines what type of installation will be used. Several installation options are supported: in the loop file of the disk image, in the section on the memory card, in RAM, in the directory or in the user version. By default, the installation in the file is selected. The user-defined installation type skips the step of creating the disk image file and the file system. This allows installation on pre-prepared media. For example, it can be an image (or a partition) with a specific file system. As the installation path in this case, you can specify any possible media (file, memory card partition or directory), the type of media is determined automatically. Care must be taken when installing in this mode. In this case, no information from the existing image (section, directory) is deleted, and the installation is carried out on top of the existing data, which can lead to conflicts during installation. When installed in memory, a virtual disk of a given volume is created in the device's RAM using the tmpfs file system.

- *Properties -> Installation path*

The installation path indicates the path to the file, block device, or directory, depending on the installation type selected. By default, the path to the image file on the memory card is specified, if the path to the card is different from /mnt/sdcard, then you need to correct it to the correct path. During installation, an image file will be created, the size of which is set by the Image size (MB) parameter. When installing the system on a memory card partition, specify the partition path, such as /dev/block/mmcblk1p1. The list of available sections can be obtained by calling the system information from the menu item Status. You can pre-divide the map into several sections, using one section for the GNU/Linux system and leaving the other available for Android. The partition on which the GNU/Linux system is installed cannot be used for Android or anything else. The third option is to install in one of the directories of the Android system. This option can be used if you already have a mounted partition with the ext2/ext3/ext4 file system for some needs, and you want to use an existing file system to deploy the GNU/Linux image.

- *Properties -> Image size (MB)*

The parameter specifies the disk image file size in megabytes and is active only if the image file or RAM is installed. The recommended minimum disk image size without a graphical interface is 512 MB, and with a graphical interface - 1024 MB (for LXDE). When installing Linux into an image on a memory card with the FAT32 file system, the image size should not exceed 4095 MB.

- *Properties -> File system*

This setting determines which file system will create a new image or partition on the memory card. If the parameter is set to Autodetect, the most suitable and supported file system will be selected. This parameter is ignored when installing to the directory.

- *Properties -> User name*

The parameter specifies the name for the user in the Linux system. It should be remembered that there are a number of reserved names in GNU/Linux distributions that are not recommended to be used as a username. You can specify the "root" name as the username.

- *Properties -> DNS server*

This parameter allows you to specify the IP address of the DNS server of the network, for example, 8.8.8.8. If multiple addresses are required, they can be separated by a space or one of the characters ",;". If the field is left empty, the DNS parameters are automatically determined each time the container is started.

- *Properties -> Localization*

This parameter allows you to specify the localization language of the system.

- *Properties -> Desktop environment*

You can select one of the suggested desktop environments. During installation or reconfiguration of the GNU/Linux system, user profile settings will be performed to run the selected desktop environment. If "Other" is selected, the configuration will not be performed. You can select this option if you want to configure the desktop environment to start manually.

- *Properties -> Select components*

This parameter allows you to mark the necessary components for installation, such as SSH server, VNC server, desktop environment, X server, etc. If some components were not selected during installation, the launch of the corresponding services will not be available. Installation and configuration of any components can be done manually with standard tools of a particular distribution.

- *Properties -> Chroot directory*

Specifies the directory where the container will be mounted and chroot executed. When working with multiple profiles, you can specify different chroot directories for each profile, so you can run multiple containers at the same time.

- *Properties -> SSH*

Setting the parameter allows the SSH server to start when the container starts.

- *Properties -> SSH settings*

Opens the SSH server settings window.

- *Properties -> GUI*

Setting the parameter allows the desktop environment to start when the system starts through the selected graphics subsystem (VNC, external X-server, frame buffer).

- *Properties -> Graphics subsystem*

You can select one of three graphics subsystems to run the desktop environment: VNC, X Server, Framebuffer. Selecting the VNC subsystem allows you to run the graphical user interface through a VNC server, to which you can connect through a third-party VNC client. Selecting the X Server subsystem allows you to run the graphical user interface through an external X server. Selecting the Framebuffer subsystem allows you to display the graphical user interface directly (bypassing Android) through the video driver. This mode is not supported on all devices.

- *Properties -> GUI settings*

Opens the settings window of the selected graphics subsystem.

- *Properties -> Custom scripts*

Allows you to automatically run any scripts inside the GNU/Linux system when it starts. When starting and stopping the system, the script will be passed start or stop, respectively, as a parameter.

- *Properties -> List of scripts*

Opens a list of custom scripts for autoplay. The list can be edited using the context menu.

- *Properties -> Custom mounts*

Allows you to mount one of the directories, images or sections of the Android system in the container.

- *Properties -> Mount points*

Opens a list of custom scripts for autoplay. The list can be edited using the context menu. You can specify a directory, such as /mnt/sdcard, to connect to an external memory card system to be run, or you can specify a block device, such as /dev/block/mmcblk1p2, to mount one of the card partitions on the system to be run.
