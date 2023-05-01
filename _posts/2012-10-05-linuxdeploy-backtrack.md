---
layout: post
title: Launch BackTrack on Android
date: 2012-10-05 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy поддерживает запуск дистрибутива [BackTrack](https://en.wikipedia.org/wiki/BackTrack) под Android. Подготовленный образ этого дистрибутива можно скачать с сайта проекта [Linux-on-Android](https://sourceforge.net/projects/linuxonandroid/).

### Инструкция

- Скачать [образ](https://downloads.sourceforge.net/project/linuxonandroid/Backtrack/Image/backtrack-v10-image.zip), распаковать и скопировать его на SD карту.
- В параметрах указать дистрибутив - Ubuntu, версия дистрибутива - lucid, тип установки - файл образа, указать путь к образу (например, /mnt/sdcard/backtrack.img), имя пользователя - backtrack или root, окружение рабочего стола - GNOME
- Запустить переконфигурацию (Параметры -> Переконфигурировать).
- Запустить систему кнопкой СТАРТ.
- Подключиться к системе по VNC. Пароль для доступа к системе после переконфигурации будет: changeme

