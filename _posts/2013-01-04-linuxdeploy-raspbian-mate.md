---
layout: post
title: Запуск дистрибутива Raspbian MATE
date: 2013-01-04 18:00:00 +0300
categories: [linuxdeploy]
comments: true
---

Дистрибутив <a href="http://www.raspbian.org/RaspbianMate">Raspbian MATE</a> основан на Debian и разрабатывается для Raspberry Pi, в качестве окружения рабочего стола используется <a href="http://mate-desktop.org/">MATE</a>. Этот дистрибутив можно запустить под Android через Linux Deploy.

![linuxdeploy](/assets/images/linuxdeploy-raspbian-mate.png "Rapsbian MATE"){: .center}

<!--more-->

### Инструкция

- Скачать образ с <a href="http://www.raspbian.org/PiscesMATEImages">официального сайта</a>: <a href="http://archive.raspbian.org/assets/images/rpi_pisces_mate_r2.zip">rpi_pisces_mate_r2.zip</a>

- Извлечь из полного образа образ третьего раздела (выполнять из-под Linux):
```sh
kpartx -v -a rpi_pisces_mate_r2.img
dd if=/dev/mapper/loop0p3 of=/tmp/rpi_pisces_mate.img bs=1M
```

- Скопировать файл rpi_pisces_mate.img на карту памяти устройства.

- В приложении Linux Deploy создать новый профиль и в параметрах указать: Дистрибутив - Debian; Версия дистрибутива - wheezy; Тип установки - Файл; Путь установки - путь к файлу rpi_pisces_mate.img; Имя пользователя - raspbian; Окружение рабочего стола - Другое. Выполнить переконфигурацию (Параметры -> Переконфигировать).

- Запустить GNU/Linux кнопкой СТАРТ из главного окна приложения. Подключиться по SSH: логин - raspbian, пароль - changeme.

- Настроить автозапуск окружения рабочего стола по VNC:
```sh
cat << EOF > ~/.vnc/xstartup
XAUTHORITY=\$HOME/.Xauthority
LANG=ru_RU.UTF-8
export XAUTHORITY LANG
echo \$\$ > /tmp/xsession.pid
mate-session
EOF
chmod 755 ~/.vnc/xstartup
```

- Перезапустить GNU/Linux через интерфейс программы. Подключиться по VNC, пароль - changeme. Должен открыться рабочий стол MATE.

