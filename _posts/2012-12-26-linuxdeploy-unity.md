---
layout: post
title: Unity desktop environment setup
description: Installing and configuring Unity desktop environment on Linux Deploy.
date: 2012-12-26 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Installing and configuring the desktop environment, which is not in the list of Linux Deploy program settings, using the example of [Unity](https://en.wikipedia.org/wiki/Unity_(user_interface)).

<!--more-->

To do this, you need the installed Ubuntu 12.04 LTS system, you can without the desktop environment. Next, you need to connect to the system via SSH and install the environment:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     gnome-core unity-2d unity-common unity-lens-files \
                     unity-lens-applications unity-lens-music \
                     --no-install-recommends -yq
sudo apt-get clean
```

After that, you need to configure autostart:

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

After this operation, the VNC server and Unity will be installed, and autostart will be configured at the start of the VNC. VNC password will be: `changeme`
