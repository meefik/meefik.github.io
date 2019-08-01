---
layout: post
title: Настройка окружения рабочего стола GPE
date: 2013-07-23 18:00:00 +0300
categories: [linuxdeploy]
comments: true
---

Установка и настройка окружения рабочего стола, которого нет в списке настроек программы Linux Deploy, на примере <a href="http://ru.wikipedia.org/wiki/GPE_Palmtop_Environment">GPE</a>.

![linuxdeploy](/assets/images/linuxdeploy-debian-gpe.png "Debian и GPE"){: .center}

<!--more-->

Для этого нужна установленная система, можно без окружения рабочего стола (в данном случае Debian Wheezy). Далее нужно подключиться к системе по SSH и выполнить установку окружения:
```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     gpe --no-install-recommends -yq
sudo apt-get clean
```
После этого нужно настроить автозапуск:
```sh
mkdir ~/.vnc
chmod 755 ~/.vnc
echo "MPTcXfgXGiY=" | base64 -d > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd
cat << EOF > ~/.vnc/xstartup
XAUTHORITY=\$HOME/.Xauthority
LANG=ru_RU.UTF-8
export XAUTHORITY LANG
echo \$\$ > /tmp/xsession.pid
matchbox-session
EOF
chmod 755 ~/.vnc/xstartup
```
После этих опрерация будет установлены VNC сервер и GPE, а также настроен автозапуск при старте VNC. Пароль к VNC будет: changeme

