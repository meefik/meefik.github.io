---
layout: post
title: "Настройка окружения рабочего стола Unity"
date: 2012-12-26 18:00:00 +0300
comments: true
categories: linuxdeploy gui unity
---

Установка и настройка окружения рабочего стола, которого нет в списке настроек программы Linux Deploy, на примере [Unity](http://ru.wikipedia.org/wiki/Unity_(оболочка_рабочего_стола)).

<!--more-->

Для этого нужна установленная система Ubuntu 12.04 LTS, можно без окружения рабочего стола. Далее нужно подключиться к системе по SSH и выполнить установку окружения:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     gnome-core unity-2d unity-common unity-lens-files \
                     unity-lens-applications unity-lens-music \
                     --no-install-recommends -yq
sudo apt-get clean
```

После этого нужно настроить автозапуск:

```sh
mkdir ~/.vnc
chmod 755 ~/.vnc
echo "MPTcXfgXGiY=" | base64 -d > ~/.vnc/passwd
chmod 600 ~/.vnc/passwd
echo 'XAUTHORITY=$HOME/.Xauthority' > ~/.vnc/xstartup
echo 'export XAUTHORITY' >> ~/.vnc/xstartup
echo 'gnome-session --session=ubuntu-2d &' >> ~/.vnc/xstartup
chmod 755 ~/.vnc/xstartup
```

После этих опрерация будет установлены VNC сервер и Unity, а также настроен автозапуск при старте VNC. Пароль к VNC будет: changeme

