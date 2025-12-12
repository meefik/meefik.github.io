---
layout: post
title: Building the Linux Kernel and Modules for Android
description: Instructions for building the Linux kernel and modules for Android devices.
date: 2015-02-05 12:00:00 +0000
categories: [android, android]
comments: true
---

Distributions running through Linux Deploy work with the Android kernel (a modified Linux kernel), and therefore you can change the configuration of the kernel or connect new modules only by rebuilding this kernel, or assembling modules for this version of the kernel.

<!--more-->

### Playbook

- Download and prepare [Android NDK](https://developer.android.com/tools/sdk/ndk/):
```sh
wget http://dl.google.com/android/ndk/android-ndk-r9d-linux-x86.tar.bz2
tar -jxf android-ndk-r9d-linux-x86.tar.bz2
export ARCH=arm
export CROSS_COMPILE=$(pwd)/android-ndk-r9d/toolchains/arm-linux-androideabi-4.6/prebuilt/linux-x86/bin/arm-linux-androideabi-
```

- Download and prepare the [Android SDK](http://developer.android.com/sdk/), you will need the `adb` and `fastboot` utilities:
```sh
wget http://dl.google.com/android/android-sdk_r13-linux_x86.tgz
tar -zxf android-sdk_r13-linux_x86.tgz
android-sdk-linux_x86/tools/android update sdk -u -t platform-tool
export PATH=$PATH:$(pwd)/android-sdk-linux_x86/platform-tools
```

- Get the source code of this device (in our case it is [tinykernel-flo](https://github.com/tiny4579/tinykernel-flo) for Nexus 7 (2013), or download a similar version from [kernel.org](https://www.kernel.org/pub/linux/kernel/)):
```
git clone -b tiny-jb-mr2 https://github.com/tiny4579/tinykernel-flo
cd tinykernel-flo
```

- Get the kernel configuration file from the device (the kernel must be assembled with support for this feature):
```sh
adb shell cat /proc/config.gz | gzip -d > .config
```
or from `boot.img` (how to extract boot is described below):
```sh
scripts/extract-ikconfig boot.img > .config
```

- If you can't get the kernel configuration file, you can use the preconfiguration from the kernel delivery (`arch/arm/configs` list of configurations):
```sh
make flo_defconfig
```

- Find out the exact version of the device kernel:
```sh
adb shell cat /proc/version
```
The result looks like this:
```sh
Linux version 3.4.0-g03485a6 (android-build@vpbs1.mtv.corp.google.com) (gcc version 4.7 (GCC) )
 #1 SMP PREEMPT Tue Mar 18 15:02:27 PDT 2014
```
In this case, the full version of the kernel will be the string "3.4.0-g03485a6".

- Install the local version of the kernel (what is displayed after the main version 3.4.0):
```sh
echo "-g03485a6" > .scmversion
```

- Change the kernel configuration in the `.config` file or by:
```sh
make menuconfig
```
In our case, the following lines were changed in the `.config` file (module support is enabled and the `binfmt_misc` module is enabled):
```sh
CONFIG_MODULES=y
CONFIG_BINFMT_MISC=m
```

- Start building kernel:
```sh
make
```
or modules only:
```sh
make modules
```

- Download utilities for working with boot image `boot.img`:
```
git clone https://github.com/meefik/binary-tools-android.git
cd binary-tools-android
```

- Get a boot image from the device (the kernel is stored on a special boot section):
```
adb shell su -с 'dd if=/dev/block/platform/msm_sdcc.1/by-name/boot' > boot.img
```
The path may be different on other devices, you can define it with the command:
```sh
adb shell su -c 'ls /dev/block/platform/*/by-name/boot'
```

- Get information about the image:
```sh
./boot_info boot.img 
```
The result looks like this:
```sh
Page size: 2048 (0x00000800)
Kernel size: 6722240 (0x006692c0)
Ramdisk size: 492556 (0x0007840c)
Second size: 0 (0x00000000)
Board name: 
Command line: 'console=ttyHSL0,115200,n8 androidboot.hardware=flo user_debug=31 msm_rtb.filter=0x3F ehci-hcd.park=3'
Base address: 2149580800 (0x80200000)
```

-  Extract `kernel` and `ramdisk` from `boot.img`, replace kernel and pack back:
```sh
./unmkbootimg boot.img
./mkbootimg --kernel ../tinykernel-flo/arch/arm/boot/zImage \
    --ramdisk initramfs.cpio.gz \
    --base 0x80200000 \
    --cmdline 'console=ttyHSL0,115200,n8 androidboot.hardware=flo user_debug=31 msm_rtb.filter=0x3F ehci-hcd.park=3' \
    -o new_boot.img
```

- Flash the device with the new kernel:
```sh
adb reboot bootloader
fastboot flash boot new_boot.img
```

- Download the module on the device:
```sh
adb push ../tinykernel-flo/fs/binfmt_misc.ko /storage/sdcard0/binfmt_misc.ko
adb shell
su
mount -o rw,remount /system
mkdir /system/lib/modules
cp /storage/sdcard0/binfmt_misc.ko /system/lib/modules/binfmt_misc.ko
chmod 644 /system/lib/modules/binfmt_misc.ko
insmod /system/lib/modules/binfmt_misc.ko
exit
exit
```

- It should be noted that the `vermagic` of the module must fully comply with the kernel version (to the nearest character), otherwise it will not be possible to load the new module. You need to find out the vermagic of the module and compare it with the modules already present on the device:
```sh
modinfo binfmt_misc.ko
```
The result looks something like this:
```sh
filename:       /path/to/kernel/fs/binfmt_misc.ko
license:        GPL
depends:        
intree:         Y
vermagic:       3.4.0-g03485a6 SMP preempt ARMv7 
```
