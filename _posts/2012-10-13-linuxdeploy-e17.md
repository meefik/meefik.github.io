---
layout: post
title: E17 desktop environment setup
description: Installing and configuring the Enlightenment E17 desktop environment on Linux Deploy.
date: 2012-10-13 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Installing and configuring the desktop environment, which is not in the list of Linux Deploy program settings, on the example of <a href="https://en.wikipedia.org/wiki/Enlightenment_(software)">Enlightenment</a>.

<!--more-->

This requires an installed system, possibly without a desktop environment (in this case Debian Wheezy). Next, you need to connect to the system via SSH and install the environment:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     e17 --no-install-recommends -yq
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
echo 'enlightenment_start &' >> ~/.vnc/xstartup
chmod 755 ~/.vnc/xstartup
```

After this operation, the VNC server and Enlightenment E17 will be installed, and autostart will be configured at the start of the VNC. VNC password will be: `changeme`
