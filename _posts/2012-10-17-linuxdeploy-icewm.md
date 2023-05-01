---
layout: post
title: IceWM desktop environment setup
date: 2012-10-17 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Установка и настройка окружения рабочего стола, которого нет в списке настроек программы Linux Deploy, на примере <a href="https://en.wikipedia.org/wiki/IceWM">IceWM</a>.

<!--more-->

Для этого нужна установленная система, можно без окружения рабочего стола (в данном случае Debian Wheezy). Далее нужно подключиться к системе по SSH и выполнить установку окружения:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     icewm xterm menu shared-mime-info \
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
echo 'icewm-session &' >> ~/.vnc/xstartup
chmod 755 ~/.vnc/xstartup
```

После этих опрерация будет установлены VNC сервер и IceWM, а также настроен автозапуск при старте VNC. Пароль к VNC будет: changeme
