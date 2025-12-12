---
layout: post
title: OpenWRT with OpenVPN on TL-WR841N router
description: A step-by-step guide to setting up OpenWRT with OpenVPN on a TL-WR841N router with only 4MB of ROM.
date: 2018-04-21 12:00:00 +0000
categories: [openwrt]
comments: true
---

The problem with the TL-WR841N router (v9 in my case) is that there's only 4MB of flash memory and after the OpenWRT firmware, there's only about 300KB left for personal use, which is not enough to install OpenVPN. The solution to this problem is in the post [OpenWrt + VPNclient for a router with 4mb ROM](https://habr.com/ru/articles/211174/), but several years have passed and scripts require changes.

<!--more-->

### I will describe in steps how to make OpenVPN client work on this router

**1)** OpenVPN client files should be placed in the `/etc/openvpn/` directory on the router. To do this, pack the files `ca.crt`, `client.conf`, `client.crt`, `client.key` and `ta.key` into the tar archive and send them to the router via `scp`:

```sh
scp openvpn_client.tar root@192.168.1.1:/tmp/openvpn_client.tar
```

After that, go to the router via SSH and unpack the archive to the `/etc/openvpn/` directory:

```sh
mkdir /etc/openvpn
tar xf /tmp/openvpn_client.tar -C /etc/openvpn
```

**2)** Settings of the OpenVPN client on the router in the file `/etc/openvpn/client.conf`:

```
client
dev tun
proto udp
remote your-server.com 1194
resolv-retry infinite
nobind
persist-key
persist-tun
ca /etc/openvpn/ca.crt
cert /etc/openvpn/client.crt
key /etc/openvpn/client.key
remote-cert-tls server
tls-auth /etc/openvpn/ta.key 1
cipher AES-256-CBC
verb 3
```

**3)** Installing the `tun` module from the OpenWRT repository:

```sh
opkg update
opkg install kmod-tun
```

**4)** Create autorun script `/etc/init.d/openvpn`:

```sh
#!/bin/sh /etc/rc.common

START=99

. /etc/profile

install_pkg() {
  # install pkg
  cd /tmp
  tar xzf $(opkg download $1 |grep Downloaded |cut -d\  -f4 |sed '$s/.$//')
  tar xzf data.tar.gz
  # delete unnecessary things (save space)
  rm -f *.ipk control.tar.gz data.tar.gz debian-binary
}

install() {
  command opkg update || exit 1
  install_pkg openvpn-openssl
  install_pkg libopenssl
  install_pkg liblzo
}

start () {
  if [ -z "$(which openvpn)" ]
  then
    sleep 10
    install
  fi
  command openvpn --writepid /tmp/run/ovpn.pid --daemon --config /etc/openvpn/client.conf
}

stop() {
  PIDOF=$(ps |egrep openvpn |egrep  -v grep |awk '{print $1}')
  kill ${PIDOF}
}
```

**5)** Edit the `PATH` variable in the `/etc/profile` file and add `LD_LIBRARY_PATH`:

```sh
export PATH=/usr/sbin:/usr/bin:/sbin:/bin:/tmp/usr/sbin
export LD_LIBRARY_PATH=/tmp/usr/lib
```

**6)** Enable `openvpn` script autostart:

```sh
chmod +x /etc/init.d/openvpn
/etc/init.d/openvpn enable
```

**7)** Next, you need to go to the OpenWRT web interface in the "Network -> Interfaces" section and add a new interface with the "Add new interface..." button. Then specify the following parameters:

_General Setup_
```
Protocol: Unmanaged
```

_Advanced Settings_
```
Bring up on boot: checked
Use builtin IPv6-management: unchecked
```

_Physical Settings_
```
Custom Interface: tun0
```

_Firewall Settings_
```
Create / Assign firewall-zone -> unspecified -or- create: vpn
```

**8)** In the web interface, go to the "Network -> Firewall -> Zones" section and click the "Edit" button next to the line with the name "vpn". On the zone editing page, specify the following parameters:

_General Settings_
```
Input: reject
Output: accept
Forward: reject
Masquerading: checked
MSS clamping: checked
Covered networks: vpn
```

_Inter-Zone Forwarding_
```
Allow forward from source zones: lan
```

**9)** Now you can reboot the router, the VPN should work for all customers of the local network.
