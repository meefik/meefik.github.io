---
layout: post
title: "Реализация WebSocket-сервера на SH"
date: 2016-08-04 12:00:00 +0300
comments: true
categories: websocket busybox sh
---

[Websocket.sh](https://github.com/meefik/websocket.sh) - кроссплатформенная реализация [WebSocket](https://tools.ietf.org/html/rfc6455) сервера на SH. Для работы требуется только busybox, вместо bash можно использовать ash. Может использоваться во встраиваемых системах.

### Bash-оболочка через веб-браузер

Для демонстрации работы websocket.sh подготовлен простой сценарий (файл /cgi-bin/terminal), позволяющий получить доступ к shell из браузера. Для этого сначала нужно запустить httpd (из пакета busybox) в директории с websocket.sh:
```sh
httpd -p 8080
```
После этого открыть страницу в браузере [http://localhost:8080/cgi-bin/terminal](http://localhost:8080/cgi-bin/terminal), где должна отобразиться командная строка терминала.

### Ручной запуск

Можно обойтись без httpd, запустив websocket.sh вручную, однако при перезагрузке страницы браузера скрипт придется запускать заново:
```sh
WS_SHELL="bash -i" nc -l -p 5000 -e websocket.sh
```
Здесь используется версия NetCat из пакета busybox, имеющая параметр -e. Вместо "bash -i" можно использовать "ash -i". Также, возможно, в самом скрипте потребуется указать другой путь к интерпретатору, например, так:
```sh
#!/bin/busybox ash
...
```
Теперь из браузера можно подключиться к серверу по порту 5000 через WebSocket:
```js
var port = 5000;
var ws = new WebSocket('ws://' + location.hostname + ':' + port);
ws.onmessage = function(msg) {
    // convert base64 to string
    var data = atob(msg.data);
    // decoding utf-8 chars
    data = decodeURIComponent(escape(data));
    console.log('Received data: ', data);
}
ws.onclose = function() {
    console.log('Connection closed.');
}
// send command: ls /
var data = 'ls /';
ws.send(btoa(data));
```

Прослойка websocket.sh создавалась для Linux Deploy, чтобы получить возможность управлять контейнерами из браузера, однако может быть использована и для других целей.

