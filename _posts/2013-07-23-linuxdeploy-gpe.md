---
layout: post
title: GPE desktop environment setup
description: Installing and configuring GPE desktop environment on Linux Deploy.
image: /assets/images/linuxdeploy-debian-gpe.png
date: 2013-07-23 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Installing and configuring a desktop environment that is not on the Linux Deploy settings list, using <a href="https://en.wikipedia.org/wiki/GPE_Palmtop_Environment">GPE</a> as an example.

![linuxdeploy](/assets/images/linuxdeploy-debian-gpe.png "Debian и GPE"){: .center}

<!--more-->

This requires an installed system, possibly without a desktop environment (in this case Debian Wheezy). Next, you need to connect to the system via SSH and install the environment:

```sh
sudo apt-get update
sudo apt-get install tightvncserver x11-xserver-utils xfonts-base \
                     gpe --no-install-recommends -yq
sudo apt-get clean
```

After that, you need to configure autostart:

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

After this operation, the VNC server and GPE will be installed, and autostart will be configured at the start of the VNC. VNC password will be: `changeme`
