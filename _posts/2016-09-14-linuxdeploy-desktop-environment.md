---
layout: post
title: Окружение рабочего стола в Linux Deploy
date: 2016-09-14 12:30:00 +0300
categories: [linuxdeploy]
comments: true
---

Linux Deploy поддерживает автоматическую установку и настройку нескольких наиболее распространенных окружений рабочего стола. В версии [LD 2.0](https://github.com/meefik/linuxdeploy/releases) оставлена поддержка окружений XTerm (терминал на весь экран), LXDE, Xfce и MATE. Эти окружения есть почти во всех поддерживаемых LD дистрибутивах, они не сильно требовательны к ресурсам и могут работать без графического ускорения. Однако запустить другие окружения рабочего стола можно вручную. Для этого нужно в настройках LD выбрать окружение рабочего стола "Другое" и выполнить команду "Конфигурировать". После этого нужно подключиться к контейнеру, установить пакеты нужного окружения рабочего стола, и под пользователем (по умолчанию - android) отредактировать файл ~/.xsession, прописав команду запуска рабочего окружения.

<!--more-->

Установку и настройку различных рабочих окружений можно выполнить следующим образом (на примере дистрибутива Debian/Ubuntu):

### 1. GNOME

Установка:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils gnome-core
```

Файл ~/.xsession:
```sh
XKL_XMODMAP_DISABLE=1
export XKL_XMODMAP_DISABLE
if [ -n "`gnome-session -h | grep '\-\-session'`" ]
then
   gnome-session --session=gnome
else
   gnome-session
fi
```

### 2. KDE

Установка:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils kde-standard
```

Файл ~/.xsession:
```sh
startkde
```

### 3. E17

Установка:
```sh
apt-get install desktop-base dbus-x11 x11-xserver-utils xfonts-base xfonts-utils e17
```

Файл ~/.xsession:
```sh
enlightenment_start
```

### 4. Cinnamon

Установка:
```sh
apt-get install desktop-base x11-xserver-utils xfonts-base xfonts-utils cinnamon
```

Файл ~/.xsession:
```sh
XKL_XMODMAP_DISABLE=1
export XKL_XMODMAP_DISABLE
cinnamon
```

