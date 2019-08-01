---
layout: post
title: Запуск дистрибутива Angstrom
date: 2013-08-06 18:00:00 +0300
categories: [linuxdeploy]
comments: true
---

Через Linux Deploy под Android можно запустить дистрибутив <a href="http://ru.wikipedia.org/wiki/%C3%85ngstr%C3%B6m">Angstrom</a>.

<!--more-->

### Инструкция

- Создать образ системы (rootfs) в формате tar.gz на сайте [narcissus.angstrom-distribution.org](http://narcissus.angstrom-distribution.org/) и получить ссылку на архив.

- В приложении Linux Deploy 1.4.1+ создать новый профиль и в параметрах указать следующее: Дистрибутив - RootFS; URL-адрес зеркала - полученная ранее ссылка; Тип установки - Файл; Путь установки - путь к будущему образу (например, /mnt/sdcard/angstrom.img); Размер образа (МБ) - 100 (можно больше); Имя пользователя - android, Окружение рабочего стола - XTerm. Остальные параметры менять не нужно.

- Запустить установку через Параметры -> Установить. В результате должен быть создан файл образа диска на карте памяти и в него распакован архив rootfs.

- Установить необходимые пакеты и выполнить базовую конфигурацию. Для этого из любого Android-терминала выполнить (через программу ConnectBot или другой терминал, выполнять от рута):
```sh
linuxdeploy shell "opkg update"
linuxdeploy shell "opkg install initscripts sysvinit sysvinit-pidof shadow bash \
    localedef glibc-localedata-en-us glibc-localedata-ru-ru tzdata dropbear sudo \
    xserver-xorg-xvfb x11vnc xinit xterm"
linuxdeploy configure
```

- Запустить SSH сервер:
```sh
linuxdeploy shell "/etc/init.d/dropbear start"
```
Теперь можно подключиться по SSH: логин - android, пароль - changeme, порт 22.

- Остановить SSH сервер:
```sh
linuxdeploy shell "/etc/init.d/dropbear stop"
```

- Запустить VNC сервер:
```sh
linuxdeploy shell
xinit /bin/su - android -c 'export DISPLAY=:0; ~/.vnc/xstartup' -- /usr/bin/Xvfb :0 -screen 0 800x400x16 -nolisten tcp -ac &
su - android -c 'x11vnc -forever -display :0 -wait 10' &
```
Теперь можно подключиться по VNC: пароль - changeme, порт 5900.

- Остановить VNC сервер:
```sh
pkill -9 Xvfb
```

- Настройка автоматического запуска/остановки SSH через Linux Deploy (кнопками СТАРТ/СТОП):
```sh
linuxdeploy shell "cp /etc/init.d/dropbear /etc/init.d/ssh"
```

- Настройка автоматического запуска/остановки VNC через Linux Deploy (кнопками СТАРТ/СТОП):
```sh
linuxdeploy shell
cat << EOF > /usr/bin/vncserver
#!/bin/sh
[ $# -eq 0 ] && exit 1
VNC_DISPLAY=$1
shift
while true
do
    case $1 in
    -depth)
        VNC_DEPTH=$2; shift 2; continue
    ;;
    -geometry)
        VNC_GEOMETRY=$2; shift 2; continue
    ;;
    -dpi)
        VNC_DPI=$2; shift 2; continue
    ;;
    *)
        break
    ;;
    esac
done
if [ -n "$VNC_DEPTH" -a -n "$VNC_GEOMETRY" -a -n "$VNC_DPI" ]
then
    Xvfb ${VNC_DISPLAY} -screen 0 ${VNC_GEOMETRY}x${VNC_DEPTH} -dpi ${VNC_DPI} -nolisten tcp -ac &
    x11vnc -forever -display ${VNC_DISPLAY} -wait 10 &
    sleep 1
    DISPLAY=${VNC_DISPLAY} ~/.vnc/xstartup &
else
    pkill -9 Xvfb
fi
EOF
chmod 755 /usr/bin/vncserver
```

**Комментарий:** Чтобы из консоли Android была доступна команда linuxdeploy нужно в настройках разрешить создавать в системе символьную ссылку (Настройки -> Создать симлинк) и обновить рабочее окружение (Настройки -> Обновить окружение). Однако это необязательное требование и можно вызывать команду linuxdeploy по полному пути ENV_DIR/bin/linuxdeploy, где ENV_DIR - каталог рабочего окружения, по умолчанию /data/data/ru.meefik.linuxdeploy/linux.

