---
layout: post
title: Launch Angstrom on Android
description: Running the Ångström distribution on Android using Linux Deploy.
date: 2013-08-06 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

You can run the <a href="https://en.wikipedia.org/wiki/%C3%85ngstr%C3%B6m_distribution">Ångström</a> distribution on Android using Linux Deploy.

<!--more-->

### Playbook

- Create a system image (rootfs) in tar.gz format on the website [narcissus.angstrom-distribution.org](http://narcissus.angstrom-distribution.org/) and get a link to the archive.

- In the Linux Deploy 1.4.1+ application, create a new profile and specify the following in the parameters:
  - *Distribution* - RootFS;
  - *Mirror URL* - the previously received link;
  - *Installation type* - File;
  - *Installation path* - the path to the image file (for example, `/sdcard/angstrom.img`);
  - *Image size (MB)* - 100 (possible more);
  - *User name* - android;
  - *Desktop environment* - XTerm.

- Start the installation via "Properties" -> "Install". As a result, a disk image file must be created on the memory card and the rootfs archive unpacked into it.

- Install the required packages and perform the basic configuration. To do this, from any Android terminal, perform (through the ConnectBot program or another terminal, perform from the root):
```sh
linuxdeploy shell "opkg update"
linuxdeploy shell "opkg install initscripts sysvinit sysvinit-pidof shadow bash \
    localedef glibc-localedata-en-us glibc-localedata-ru-ru tzdata dropbear sudo \
    xserver-xorg-xvfb x11vnc xinit xterm"
linuxdeploy configure
```

- Start SSH Server:
```sh
linuxdeploy shell "/etc/init.d/dropbear start"
```
Now you can connect via SSH: login - android, password - `changeme`, port `22`.

- Stop SSH Server:
```sh
linuxdeploy shell "/etc/init.d/dropbear stop"
```

- Start VNC Server:
```sh
linuxdeploy shell
xinit /bin/su - android -c 'export DISPLAY=:0; ~/.vnc/xstartup' -- /usr/bin/Xvfb :0 -screen 0 800x400x16 -nolisten tcp -ac &
su - android -c 'x11vnc -forever -display :0 -wait 10' &
```
Now you can connect via VNC: password - `changeme`, port `5900`.

- Stop VNC Server:
```sh
pkill -9 Xvfb
```

- Configuring automatic SSH start/stop via Linux Deploy (START/STOP buttons):
```sh
linuxdeploy shell "cp /etc/init.d/dropbear /etc/init.d/ssh"
```

- Configuring automatic start/stop of VNC via Linux Deploy (START/STOP buttons):
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

**Notice:** In order for the linuxdeploy command to be available from the Android console, you need to allow creating a symbolic link in the system ("Settings" -> "Create a simlink") and updating the working environment ("Settings" -> "Update ENV") in the settings. However, this is an optional requirement, and you can call the `linuxdeploy` command using the full path `ENV_DIR/bin/linuxdeploy`, where `ENV_DIR` is the directory of the working environment, by default `/data/data/ru.meefik.linuxdeploy/linux`.
