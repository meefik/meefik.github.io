---
layout: post
title: Реализация WebSocket-сервера на bash
date: 2016-08-04 12:00:00 +0300
categories: [bash]
comments: true
---

[Websocket.sh](https://github.com/meefik/websocket.sh) - кроссплатформенная реализация [WebSocket](https://tools.ietf.org/html/rfc6455) сервера на bash. Для работы требуется только busybox, вместо bash можно использовать ash. Может использоваться во встраиваемых системах.

![websocket.sh](/assets/images/websocket-sh.png "websocket.sh + xterm.js")

<!--more-->

### Bash-оболочка через веб-браузер

Для демонстрации работы websocket.sh подготовлен простой сценарий (файл /cgi-bin/terminal), позволяющий получить доступ к shell из браузера. Для этого сначала нужно запустить httpd (из пакета busybox) в директории с websocket.sh.

Для запуска примера работы через библиотеку [JQuery Terminal Emulator](http://terminal.jcubic.pl), позволяющая реализовать выполнение простых команд и отображение результата выполнения, нужно выполнить:
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
WS_SHELL="cat" nc -l -p 5000 -e websocket.sh
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
ws.onmessage = function(ev) {
  var textDecoder = new TextDecoder();
  var fileReader = new FileReader();
  fileReader.addEventListener('load', function () {
    var str = textDecoder.decode(fileReader.result);
    console.log('Received data: ', str);
  });
  fileReader.readAsArrayBuffer(ev.data);
}
ws.onopen = function() {
  ws.send('hello');
}
```

Прослойка websocket.sh создавалась для Linux Deploy, чтобы получить возможность управлять контейнерами из браузера, однако может быть использована и для других целей.

