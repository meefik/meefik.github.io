---
layout: post
title: Announcement of Linux Deploy 2.0
date: 2015-12-08 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Готовится к выходу следующая версия Linux Deploy, которая будет включать много новых интересных функций. Вот основные из них:

* работа с контейнерами без прав суперпользователя (на базе [proot](http://proot.me)), в том числе эмуляция архитектуры без необходимости поддержки модуля [binfmt_misc](https://en.wikipedia.org/wiki/Binfmt_misc) на уровне ядра;
* модульная архитектура на основе подключаемых компонентов;
* обновленный интерфейс приложения для Android;
* встроенный в Android-приложение интерфейс управления через telnet и веб-интерфейс;
* расширенный CLI для управления контейнерами из командной строки;
* CLI с поддержкой различных платформ на базе ядра Linux, не только Android;
* репозиторий готовых контейнеров (конфигурации контейнеров и rootfs-архивы к ним).

<!--more-->

Уже сейчас доступен для тестирования [интерфейс командной строки Linux Deploy 2.0](https://github.com/meefik/linuxdeploy-cli), который существенно изменился. Теперь он позволяет создавать, настраивать и полностью управлять контейнерами через команду linuxdeploy. Каждый контейнер имеет конфигурационный файл, содержащий в себе все параметры развертывания и запуска конкретного дистрибутива. Можно работать с несколькими конфигурациями, переключаясь между ними при необходимости. Linux Deploy теперь имеет модульную архитектуру, состоящую из отдельных компонентов, написанных на Bash-совместимом языке сценариев Ash. Компоненты связаны между собой зависимостями и подключаются в заданном порядке, есть защита от циклических зависимостей. Каждый компонент имеет пять базовых функций, которые являются обработчиками действий: установка, конфигурация, запуск, остановка, справка. Компоненты имеют древовидную структуру и располагаются в корневом каталоге, который задается в переменной окружения INCLUDE_DIR. Каждый компонент представляет собой каталог, в котором содержатся необходимые компоненту файлы. Основных файлов два: deploy.conf - конфигурация компонента, deploy.sh - функции компонента.

Компоненты разделены на несколько групп, отвечающих за какой-то определенный функционал. Например, группа компонентов bootstrap отвечает за подготовку rootfs и развертывание дистрибутива. Группа компонентов core включает основные настройки дистрибутивов и базовые функции для работы с контейнерами. Есть еще группы для поддержки различных систем инициализации (init), графических подсистем (graphics) и окружений рабочего стола (desktop), а также коллекция компонентов для установки и запуска различного программного обеспечения. Комбинируя компоненты можно собрать собственную версию дистрибутива с необходимым набором программ.

Допустим, мы хотим создать контейнер с Arch Linux в базовой комплектации. Чтобы создать контейнер, первым делом, нужно задать его параметры, для этого следует использовать команду config:
```
linuxdeploy -p arch config --target-path='linux.img' --chroot-dir='/mnt' \
    --target-type='file' --disk-size='2000' --fs-type='auto' \
    --source-path='http://mirrors.kernel.org/archlinux/' --distrib='archlinux' --arch='i686' \
    --user-name='android' --include='bootstrap'
```

Дамп получившегося конфигурационного файла можно получить командой:
```
linuxdeploy -p arch config -x

TARGET_PATH="linux.img"
CHROOT_DIR="/mnt"
TARGET_TYPE="file"
DISK_SIZE="2000"
FS_TYPE="auto"
SOURCE_PATH="http://mirrors.kernel.org/archlinux/"
DISTRIB="archlinux"
ARCH="i686"
USER_NAME="android"
INCLUDE="bootstrap"
```

Когда базовые параметры установлены, можно запускать установку командой deploy:
```
linuxdeploy -p arch deploy
```

Эта команда без параметров запускает установку и конфигурацию всех подключенных через параметр INCLUDE компонентов, в данном случае это bootstrap. После завершения процесса развертывания и конфигурации можно подключиться к контейнеру командой shell:
```
linuxdeploy -p arch shell -u root
```
Возможно, нам понадобится в последствии установить какие-то дополнительные компоненты без переустановки базовой системы, тогда можно воспользоваться следующей командой, например, для установки ssh-сервера:
```
linuxdeploy -p arch deploy -n bootstrap extra/ssh
```
Здесь опция "-n bootstrap" исключает из установки компоненты группы bootstrap, от которых зависит компонент extra/ssh. Аналогичным образом будут работать следующие команды, однако компонент extra/ssh будет сохранен в конфигурации контейнера:
```
linuxdeploy -p arch config --include='${INCLUDE} extra/ssh'
linuxdeploy -p arch deploy -n bootstrap
```
Здесь переменная ${INCLUDE} берется из текущей конфигурации и в данном случае содержит "bootstrap". Развернутый контейнер можно экспортировать как rootfs-архив:
```
linuxdeploy -p arch export rootfs.tar.gz
```
Иногда нужно импортировать дистрибутив из rootfs-архива, для этого можно воспользоваться такими командами:
```
linuxdeploy -p arch config --source-path='rootfs.tar.gz'
linuxdeploy -p arch deploy bootstrap/rootfs
```
Список созданных конфигураций можно посмотреть через команду conf:
```
linuxdeploy -p arch config

arch            archlinux  i686       latest     bootstrap extra/ssh
centos          centos     i386       7          bootstrap init
debian          debian     i386       jessie     bootstrap graphics desktop
fedora          fedora     i386       21         bootstrap
gentoo          gentoo     i686       latest     bootstrap
kali            kalilinux  i386       sana       bootstrap
opensuse        opensuse   i586       13.2       bootstrap
slackware       slackware  x86        latest     bootstrap
ubuntu          ubuntu     i386       wily       bootstrap
```
Список доступных компонентов можно посмотреть через команду conf. Каждый компонент имеет совместимость со всеми или только некоторыми дистрибутивами. Список подключенных (через INCLUDE) и совместимых с текущей конфигурацией компонентов с их зависимостями можно получить командой:
```
linuxdeploy -p arch config -l

bootstrap                      Installer of Linux distibution
bootstrap/debian               Bootstrap for Debian GNU/Linux
bootstrap/rootfs               Prepare and import RootFS
core                           Core components
core/aid                       Android users and groups
core/emulator                  CPU emulation
core/hostname                  Hostname
core/hosts                     Hosts file
core/locale                    Localization
core/mnt                       Mount points configuration
core/motd                      Message after a successful login
core/net                       Network configuration
core/profile                   User and its environment
core/proot                     PRoot configuration
core/su                        SU command
core/sudo                      Sudoers file
core/timezone                  Time zone
core/unchroot                  Break chroot
```
Список всех компонентов:
```
linuxdeploy config -la
```
Список зависимостей для конкретного компонента:
```
linuxdeploy -p arch config -l extra/ssh
```
Запуск/остановка текущей конфигурации со всеми компонентами делается командами start и stop, например:
```
linuxdeploy -p arch start
```
Справку по всем подключенным компонентам можно получить командой help, информацию о конкретном компоненте можно получить так:
```
linuxdeploy help extra/ssh

Name: extra/ssh
Description: Secure shell (SSH) server
Target: debian:*:* ubuntu:*:* kalilinux:*:* archlinux:*:* fedora:*:* opensuse:*:* gentoo:*:* slackware:*:*
Depends: extra
Help:

   --ssh-port=PORT
     Port of SSH server.

   --ssh-args=STR
     Defines other sshd options, separated by a space.

```
На данный момент идет тестирование и отладка CLI, удалось добиться установки без прав суперпользователя дистрибутивов Debian (wheezy), Ubuntu (precise), Kali Linux (moto), Arch Linux, Gentoo и Slackware.
