---
layout: post
title: "Реализация WebSocket-сервера на SH"
date: 2016-08-04 12:00:00 +0300
comments: true
categories: websocket busybox sh
---

[Websocket.sh](https://github.com/meefik/websocket.sh) - кроссплатформенная реализация [WebSocket](https://tools.ietf.org/html/rfc6455) сервера на SH. Для работы требуется только busybox, вместо bash можно использовать ash. Может использоваться во встраиваемых системах.

### Bash-оболочка через веб-браузер

Для демонстрации работы websocket.sh подготовлен простой сценарий (файл /cgi-bin/terminal), позволяющий получить доступ к shell из браузера. Для этого сначала нужно запустить httpd (из пакета busybox) в директории с websocket.sh.

Для запуска примера работы через библиотеку [JQuery Terminal Emulator](http://terminal.jcubic.pl), позволяющая реализовать выполнение простых команд и отображение резульата выполнения, нужно выполнить:
```sh
cd jquery.terminal
WS_SHELL="sh" httpd -p 8080
```

Для запуска примера работы через библиотеку [xterm.js](https://github.com/sourcelair/xterm.js), благодаря которой можно получить полноценный терминал в браузере, нужно выполнить:
```sh
cd xterm.js
telnetd -p 5023 -l /bin/bash -f /etc/issue
WS_SHELL="telnet 127.0.0.1 5023" httpd -p 8080
```

После этого достаточно открыть страницу в браузере [http://localhost:8080/cgi-bin/terminal](http://localhost:8080/cgi-bin/terminal), где должна отобразиться командная строка терминала. Чтобы корректно обрабатывалось изменение размера терминала в зависимости от размера окна (в xterm.js), нужно чтобы в файле issue присутствовал символ "\l". Или просто ввести команду tty в браузере для отображения текущего устройства pty.

### Ручной запуск

Можно обойтись без httpd, запустив websocket.sh вручную, однако при перезагрузке страницы браузера скрипт придется запускать заново:
```sh
WS_SHELL="sh" nc -l -p 5000 -e websocket.sh
```
Здесь используется версия NetCat из пакета busybox, имеющая параметр -e. Также, возможно, в самом скрипте потребуется указать другой путь к интерпретатору, например, так:
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
    // decode utf-8 chars
    data = decodeURIComponent(escape(data));
    console.log('Received data: ', data);
}
ws.onclose = function() {
    console.log('Connection closed.');
}
// send command: ls /
var data = 'ls /';
// encode utf-8 chars
data = unescape(encodeURIComponent(data));
// convert string to base64
data = btoa(data);
ws.send(data);
```

Прослойка websocket.sh создавалась для Linux Deploy, чтобы получить возможность управлять контейнерами из браузера, однако может быть использована и для других целей.

