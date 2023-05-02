---
layout: post
title: WebSocket implementation for UNIX shell
date: 2016-08-04 12:00:00 +0000
categories: [bash]
comments: true
---

[Websocket.sh](https://github.com/meefik/websocket.sh) is a cross-platform implementation of [WebSocket](https://tools.ietf.org/html/rfc6455) server on bash. Only busybox is required to work, instead of bash, you can use ash. Can be used in embedded systems.

![websocket.sh](/assets/images/websocket-sh.png "websocket.sh + xterm.js")

<!--more-->

### Bash wrapper via web browser

To demonstrate the work websocket.sh prepared a simple script (file `/cgi-bin/terminal`), allowing you to access the shell from the browser. To do this, first you need to run `httpd` (from `busybox`) in the directory with `websocket.sh`.

To run an example of work through the [JQuery Terminal Emulator](http://terminal.jcubic.pl) library, which allows you to implement the execution of simple commands and display the result of execution, you need to perform:

```sh
cd jquery.terminal
WS_SHELL="sh" httpd -p 8080
```

To run an example of work through the [xterm.js](https://github.com/sourcelair/xterm.js) library, thanks to which you can get a full-fledged terminal in the browser, you need to perform:

```sh
cd xterm.js
telnetd -p 5023 -l /bin/bash -f /etc/issue
WS_SHELL="telnet 127.0.0.1 5023" httpd -p 8080
```

After that, it is enough to open the page in the browser <http://localhost:8080/cgi-bin/terminal>, where the terminal command line should be displayed. In order to correctly process the change in the size of the terminal depending on the size of the window (in xterm.js), you need to have the "\l" symbol in the issue file. Or simply type tty in the browser to display the current `pty` device.

### Manual start

You can do it without `httpd` by running `websocket.sh` manually, but when you reload the browser page, the script will have to be run again:

```sh
WS_SHELL="cat" nc -l -p 5000 -e websocket.sh
```

This uses the NetCat version from `busybox`, which has the "-e" parameter. You may also need to specify a different path to the interpreter in the script itself, for example, as follows:

```sh
#!/bin/busybox ash
...
```

Now from the browser you can connect to the server on port 5000 via WebSocket:

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

The `websocket.sh` layer was created for Linux Deploy to be able to manage containers from the browser, but it can also be used for other purposes.
