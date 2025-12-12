---
layout: post
title: WebSocket implementation for UNIX shell
description: Cross-platform WebSocket server implementation in Unix shell using BusyBox.
image: /assets/images/websocket-sh.png
date: 2016-08-04 12:00:00 +0000
categories: [bash]
comments: true
---

[Websocket.sh](https://github.com/meefik/websocket.sh) is a cross-platform implementation of [WebSocket](https://tools.ietf.org/html/rfc6455) server on bash. Only busybox is required to work, instead of bash, you can use ash. Can be used in embedded systems.

![websocket.sh](/assets/images/websocket-sh.png "websocket.sh + xterm.js")

<!--more-->

### Bash wrapper via web browser

To demonstrate how `websocket.sh` works, an example has been prepared that allows you to access the shell from the browser. To do this, you first need to run `httpd` (from `busybox`) in the directory where `websocket.sh` is located.

To run an example of work through the [JQuery Terminal](http://terminal.jcubic.pl) library, which allows you to implement the execution of simple commands and display the result of execution, you need to perform:

```sh
cd jquery.terminal
WS_SHELL="busybox sh" busybox httpd -p 8080 -f
```

To run an example of work through the [xterm.js](https://github.com/sourcelair/xterm.js) library, thanks to which you can get a full-fledged terminal in the browser, you need to perform:

```sh
cd xterm.js
busybox telnetd -p 5023 -l /bin/sh -f ./issue
WS_SHELL="busybox telnet 127.0.0.1 5023" busybox httpd -p 8080 -vv -f
```

After that, it is enough to open the page <http://localhost:8080> in the browser, where the terminal command line should be displayed. In order to correctly handle the change of the terminal size depending on the window size (in xterm.js), you need to have the "\l" symbol in the "issue" file. Or just type tty in your browser to see the current `pty` device.

### Manual start

You can do this without `httpd` by running `websocket.sh` manually, but when you reload the browser page, the script will have to be run again:

```sh
WS_SHELL="cat" busybox nc -ll -p 5000 -e ./websocket.sh
```

This uses the NetCat version from `busybox`, which has the "-e" parameter. You may also need to specify a different path to the interpreter in the script itself, for example, as follows:

```sh
#!/bin/busybox ash
...
```

Now you can connect to the WebSocket server on port `5000` from the browser:

```js
var wsPort = 5000;
var ws = new WebSocket('ws://' + location.hostname + ':' + wsPort);
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

The `websocket.sh` layer was created for [Linux Deploy](/linuxdeploy) to be able to manage containers from the browser, but it can also be used for other purposes as well.
