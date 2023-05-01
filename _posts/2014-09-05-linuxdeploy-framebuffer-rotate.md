---
layout: post
title: Screen rotation in framebuffer mode
date: 2014-09-05 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Ниже приводится решение для правильного поворота экрана в режиме фрейм-буфера. Т.е. чтобы была повернута картинка на 90 градусов (ландшафтная ориентация) и драйвер сенсорного экрана обрабатывал это поворот корректно. Решение опробовано на Samsung Galaxy S2 (i9100), тачскрин MXT224 (узнать модель тачскрина можно командой: cat /sys/devices/virtual/sec/sec_touchscreen/tsp_touchtype), Ubuntu 13.04 Raring Ringtail и Debian 7.0/wheezy.

Что работает:

* позиционирование курсора к месту нажатия;
* обработка удерживания (эмуляция удерживания левой кнопки мыши);
* обработка двойного нажатия одним пальцем (эмуляция левой кнопки мыши);
* обработка нажатия двумя пальцами (эмуляция правой кнопки мыши);
* поворот координат сенсорного экрана.

<!--more-->

Для этого нужно выполнить следующие шаги:

* Установить дистрибутив через Linux Deploy (Debian или Ubuntu) и подключиться к консоли под пользователем root (например, по SSH).

* Доставить необходимые пакеты:
```sh
apt-get install build-essential wget unzip xorg-dev libmtdev-dev
```

* Загрузить [исходный код](https://github.com/meefik/xorg-input-mtev) модифицированного драйвера mtev для Xorg:
```sh
wget https://github.com/meefik/xorg-input-mtev/archive/master.zip --no-check-certificate
unzip master.zip
```

* Запустить сборку драйвера:
```sh
cd ./xorg-input-mtev-master/
make
```

* Скопировать драйвер в каталог модулей Xorg:
```sh
cp obj/mtev.so /usr/lib/xorg/modules/input/mtev_drv.so
```

* Отредактировать файл /etc/X11/xorg.conf:
```
    Section "ServerLayout"
        Identifier "Layout0"
        Screen "Screen0"
        InputDevice "touchscreen" "CorePointer"
    EndSection

    Section "InputDevice"
        Identifier "touchscreen"
        Option "Device" "/dev/input/event2" #linuxdeploy
        Driver "mtev"
        Option "Rotation" "1"
    EndSection

    Section "Device"
        Identifier "Card0"
        Driver "fbdev"
        Option "fbdev" "/dev/graphics/fb0" #linuxdeploy
        Option "Rotate" "CW"
    EndSection

    Section "Screen"
        Identifier "Screen0"
        Device "Card0"
        DefaultDepth 24
        SubSection "Display"
            Depth 24
        EndSubSection
    EndSection
```

* Запустить GNU/Linux через Linux Deploy в режиме фрейм-буфера (Параметры -> Графическая подсистема -> Framebuffer). Для набора текста можно использовать виртуальную клавиатуру [florence](http://packages.debian.org/wheezy/florence).

