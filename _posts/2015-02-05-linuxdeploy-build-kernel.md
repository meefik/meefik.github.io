---
layout: post
title: Сборка ядра Linux и модулей для Android
date: 2015-02-05 00:50:00 +0300
categories: [android]
comments: true
---

Дистрибутивы, запускаемые через Linux Deploy, работают с ядром Android (модифицированное ядро Linux), а потому изменить конфигурацию ядра или подключить новые модули можно только путем пересборки этого ядра, либо сборки модулей под данную версию ядра.

<!--more-->

### Инструкция

* Скачать и подготовить [Android NDK](https://developer.android.com/tools/sdk/ndk/):
```sh
wget http://dl.google.com/android/ndk/android-ndk-r9d-linux-x86.tar.bz2
tar -jxf android-ndk-r9d-linux-x86.tar.bz2
export ARCH=arm
export CROSS_COMPILE=$(pwd)/android-ndk-r9d/toolchains/arm-linux-androideabi-4.6/prebuilt/linux-x86/bin/arm-linux-androideabi-
```

* Скачать и подготовить [Android SDK](http://developer.android.com/sdk/), понадобятся утилиты adb и fastboot:
```sh
wget http://dl.google.com/android/android-sdk_r13-linux_x86.tgz
tar -zxf android-sdk_r13-linux_x86.tgz
android-sdk-linux_x86/tools/android update sdk -u -t platform-tool
export PATH=$PATH:$(pwd)/android-sdk-linux_x86/platform-tools
```

* Получить исходники ядра данного устройства (в нашем случае это tinykernel-flo для Nexus 7 (2013), либо скачать аналогичную версию с [kernel.org](https://www.kernel.org/pub/linux/kernel/)):
```
git clone -b tiny-jb-mr2 https://github.com/meefik/tinykernel-flo
cd tinykernel-flo
```

* Получить файл конфигурации ядра с устройства (ядро должно быть собрано с поддержкой данной возможности):
```sh
adb shell cat /proc/config.gz | gzip -d > .config
```
либо из boot.img (как извлечь boot описано ниже):
```sh
scripts/extract-ikconfig boot.img > .config
```

* Если получить файл конфигурации ядра не получилось, то можно воспользоваться предварительной конфигурацией из поставки ядра (список конфигураций arch/arm/configs):
```sh
make flo_defconfig
```

* Узнать точную версию ядра устройства:
```sh
adb shell cat /proc/version
```
Рузультат команды:
```sh
Linux version 3.4.0-g03485a6 (android-build@vpbs1.mtv.corp.google.com) (gcc version 4.7 (GCC) )
 #1 SMP PREEMPT Tue Mar 18 15:02:27 PDT 2014
```
В данном случае полной версией ядра будет строка "3.4.0-g03485a6".

* Установить локальную версию ядра (то что отображается после основной версии 3.4.0):
```sh
echo "-g03485a6" > .scmversion
```

* Изменить конфигурацию ядра в файле .config или командой:
```sh
make menuconfig
```
В нашем случае в файл .config изменены следующие строки (включена поддержка модулей и включен модуль binfmt_misc):
```sh
CONFIG_MODULES=y
CONFIG_BINFMT_MISC=m
```

* Запустить сборку ядра:
```sh
make
```
либо только модулей:
```sh
make modules
```

* Скачать утилиты для работы с загрузочным образом (boot.img):
```
git clone https://github.com/meefik/binary-tools-android.git
cd binary-tools-android
```

* Получить загрузочный образ с устройства (ядро хранится на специальном boot разделе):
```
adb shell su -с 'dd if=/dev/block/platform/msm_sdcc.1/by-name/boot' > boot.img
```
Путь может отличаться на других устройствах, определить его можно командой:
```sh
adb shell su -c 'ls /dev/block/platform/*/by-name/boot'
```

* Получить информацию об образе:
```sh
./boot_info boot.img 
```
Результат выглядит так:
```sh
Page size: 2048 (0x00000800)
Kernel size: 6722240 (0x006692c0)
Ramdisk size: 492556 (0x0007840c)
Second size: 0 (0x00000000)
Board name: 
Command line: 'console=ttyHSL0,115200,n8 androidboot.hardware=flo user_debug=31 msm_rtb.filter=0x3F ehci-hcd.park=3'
Base address: 2149580800 (0x80200000)
```

* Извлечь kernel и ramdisk из boot.img, заменить ядро и запаковать обратно:
```sh
./unmkbootimg boot.img
./mkbootimg --kernel ../tinykernel-flo/arch/arm/boot/zImage \
    --ramdisk initramfs.cpio.gz \
    --base 0x80200000 \
    --cmdline 'console=ttyHSL0,115200,n8 androidboot.hardware=flo user_debug=31 msm_rtb.filter=0x3F ehci-hcd.park=3' \
    -o new_boot.img
```

* Прошить устройство новым ядром:
```sh
adb reboot bootloader
fastboot flash boot new_boot.img
```

* Загрузить модуль на устройстве:
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

* Следует учесть, что vermagic модуля должен полностью соответствовать версии ядра (с точностью до символа), иначе загрузить новый модуль не удастся. Необходимо узнать vermagic модуля и сравнить его с уже присутствующими на устройстве модулями:
```sh
modinfo binfmt_misc.ko
```
Результат выглядит примерно так:
```sh
filename:       /path/to/kernel/fs/binfmt_misc.ko
license:        GPL
depends:        
intree:         Y
vermagic:       3.4.0-g03485a6 SMP preempt ARMv7 
```

