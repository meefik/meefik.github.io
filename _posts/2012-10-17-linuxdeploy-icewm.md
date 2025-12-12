---
layout: post
title: IceWM desktop environment setup
description: Installing and configuring IceWM desktop environment on Linux Deploy.
date: 2012-10-17 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Installing and configuring a desktop environment that is not on the Linux Deploy settings list, using <a href="https://en.wikipedia.org/wiki/IceWM">IceWM</a> as an example.

<!--more-->

This requires an installed system, possibly without a desktop environment (in this case Debian Wheezy). Next, you need to connect to the system via SSH and install the environment:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     icewm xterm menu shared-mime-info \
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
echo 'icewm-session &' >> ~/.vnc/xstartup
chmod 755 ~/.vnc/xstartup
```

After this operation, the VNC server and IceWM will be installed, and autostart will be configured at the start of the VNC. VNC password will be: `changeme`
