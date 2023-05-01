---
layout: post
title: Launch Bodhi Linux on Android
date: 2013-01-02 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Linux Deploy поддерживает запуск дистрибутива [Bodhi Linux](https://www.bodhilinux.com) под Android.

![linuxdeploy](/assets/images/linuxdeploy-bodhilinux-e17.png "Bodhi Linux и E17"){: .center}

<!--more-->

### Инструкция

- Получить ссылку на <a href="http://sourceforge.net/projects/bodhilinux/files/ARMHF/rootfs/">rootfs архив Bodhi Linux</a>.

- В приложении Linux Deploy создать новый профиль и в параметрах указать следующее: Дистрибутив - RootFS; URL-адрес зеркала - полученная ранее ссылка (например, http://netcologne.dl.sourceforge.net/project/bodhilinux/ARMHF/rootfs/bodhi-rootfs-20130124.tar.gz); Тип установки - Файл; Путь установки - путь к будущему файлу образа (например, /mnt/sdcard/bodhi.img); Имя пользователя - android; Окружение рабочего стола - Другое. Выполнить установку (Параметры -> Установить). На данном этапе создается новый образ системы в который распаковывается архив rootfs.

- После завершения установки снова зайти в параметры Linux Deploy и изменить следующее: Дистрибутив - Debian; Версия дистрибутива - wheezy; Архитектура - armhf; Окружение рабочего стола - Другое. Выполнить переконфигурацию (Параметры -> Переконфигурировать). На данном этапе выполняется установка GUI (SSH сервер, VNC сервер).

- Запустить Linux кнопкой СТАРТ из главного окна приложения. Подключиться по SSH: логин - android, пароль - changeme.

- Через SSH терминал настроить автозапуск окружения рабочего стола:
```sh
    cat << EOF > ~/.vnc/xstartup
    XAUTHORITY=\$HOME/.Xauthority
    LANG=ru_RU.UTF-8
    export XAUTHORITY LANG
    echo \$\$ > /tmp/xsession.pid
    enlightenment_start
    EOF
    chmod 755 ~/.vnc/xstartup
```

- Доставить недостающие пакеты:
```sh
    sudo apt-get install locales openssh-server -yq
```

- Перезапустить GNU/Linux через интерфейс программы. Подключиться по VNC, пароль - changeme. Должен открыться рабочий стол среды [E17](https://en.wikipedia.org/wiki/Enlightenment_(software)).

