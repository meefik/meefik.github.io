---
layout: post
title: OpenWRT с OpenVPN на роутере TL-WR841N
date: 2018-04-21 11:00:00 +0300
categories: [openwrt]
comments: true
---

Проблема роутера TL-WR841N (v9 в моем случае) в том, что там всего 4 МБ flash-памяти и после прошивки OpenWRT остается всего около 300 КБ для личного пользования, чего не хватает для установки OpenVPN. Решение этой проблемы есть в посте [OpenWrt + VPNclient для роутера с 4mb ROM](https://habrahabr.ru/post/211174/), но прошло несколько лет и скрипты требуют изменений.

<!--more-->

### Опишу по шагам как заставить работать OpenVPN клиент на этом роутере

**1)** Файлы клиента OpenVPN нужно положить в директорию /etc/openvpn/ на роутере. Для этого нужно запаковать файлы ca.crt, client.conf, client.crt, client.key и ta.key в архив tar и отправить на роутер через scp:

```
scp openvpn_client.tar root@192.168.1.1:/tmp/openvpn_client.tar
```

После этого зайти на роутер по SSH и распаковать архив в директорию /etc/openvpn/:

```
mkdir /etc/openvpn
tar xf /tmp/openvpn_client.tar -C /etc/openvpn
```

**2)** Настройки клиента OpenVPN на роутере в файле /etc/openvpn/client.conf:

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

**3)** Установка модуля tun из репозитория OpenWRT:

```
opkg update
opkg install kmod-tun
```

**4)** Создать скрипт автозапуска /etc/init.d/openvpn:

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

**5)** Отредактировать в файле /etc/profile переменную PATH и добавить LD_LIBRARY_PATH:

```
export PATH=/usr/sbin:/usr/bin:/sbin:/bin:/tmp/usr/sbin
export LD_LIBRARY_PATH=/tmp/usr/lib
```

**6)** Включить автозапуск скрипта openvpn:

```
chmod +x /etc/init.d/openvpn
/etc/init.d/openvpn enable
```

**7)** Далее нужно зайти в веб-интерфейс OpenWRT в раздел “Network -> Interfaces” и добавить новый интерфейс кнопкой “Add new interface...”. После чего указать следующие параметры:

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

**8)** В веб-интерфейсе перейти в раздел “Network -> Firewall -> Zones” и там нажать кнопку “Edit” напротив строчки с именем “vpn”. На странице редактирования зоны нужно указать следующие параметры:

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

**9)** Теперь можно перезагрузить роутер, VPN должен заработать для всех клиентов локальной сети.

