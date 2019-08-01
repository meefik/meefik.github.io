---
layout: post
title: Запуск дистрибутива BackTrack
date: 2012-10-05 18:00:00 +0300
categories: [linuxdeploy]
comments: true
---

Linux Deploy поддерживает запуск дистрибутива [BackTrack](http://ru.wikipedia.org/wiki/Backtrack) под Android. Подготовленный образ этого дистрибутива можно скачать с сайта проекта [Linux-on-Android](http://sourceforge.net/projects/linuxonandroid/).

### Инструкция

- Скачать [образ](http://downloads.sourceforge.net/project/linuxonandroid/Backtrack/Image/backtrack-v10-image.zip), распаковать и скопировать его на SD карту.
- В параметрах указать дистрибутив - Ubuntu, версия дистрибутива - lucid, тип установки - файл образа, указать путь к образу (например, /mnt/sdcard/backtrack.img), имя пользователя - backtrack или root, окружение рабочего стола - GNOME
- Запустить переконфигурацию (Параметры -> Переконфигурировать).
- Запустить систему кнопкой СТАРТ.
- Подключиться к системе по VNC. Пароль для доступа к системе после переконфигурации будет: changeme

