---
layout: post
title: Запуск дистрибутива OpenPandora
date: 2013-08-25 18:00:00 +0300
categories: [linuxdeploy]
comments: true
---

Через Linux Deploy под Android можно запустить дистрибутив [OpenPandora](http://www.openpandora.org/).

<!--more-->

### Инструкция

- В приложении Linux Deploy 1.4.1+ создать новый профиль и в параметрах указать следующее: Дистрибутив - RootFS; URL-адрес зеркала - http://www.openpandora.org/firmware/pandora-rootfs.tar.bz2; Тип установки - Файл; Путь установки - путь к будущему образу (например, /mnt/sdcard/pandora.img); Размер образа (МБ) - 1000 (можно больше); Имя пользователя - android, Окружение рабочего стола - Xfce; Установить GUI - нет. Остальные параметры менять не нужно.

- Запустить установку через Параметры -> Установить. В результате должен быть создан файл образа диска на карте памяти и в него распакован архив rootfs.

- Запустить SSH сервер (из консоли Android, можно использовать терминал ConnectBot):
```sh
linuxdeploy shell "/etc/init.d/dropbear start"
```
Теперь можно подключиться по SSH, логин - android, пароль - changeme, порт 22.

- Остановить SSH сервер:
```sh
linuxdeploy shell "/etc/init.d/dropbear stop"
```

- Настройка автоматического запуска/остановки SSH через Android-интерфейс Linux Deploy (кнопками СТАРТ/СТОП):
```sh
linuxdeploy shell "cp /etc/init.d/dropbear /etc/init.d/ssh"
```

**Комментарий:** Чтобы из консоли Android была доступна команда linuxdeploy нужно в настройках разрешить создавать в системе символьную ссылку (Настройки -> Создать симлинк) и обновить рабочее окружение (Настройки -> Обновить окружение). Однако это необязательное требование и можно вызывать команду linuxdeploy по полному пути ENV_DIR/bin/linuxdeploy, где ENV_DIR - каталог рабочего окружения, по умолчанию /data/data/ru.meefik.linuxdeploy/linux.

