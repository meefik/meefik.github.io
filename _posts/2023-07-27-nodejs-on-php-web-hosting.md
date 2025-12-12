---
layout: post
title: Running Node.js server on PHP web hosting
description: A guide to running a Node.js application on a typical PHP web hosting environment using a reverse proxy.
image: /assets/images/nodejs-via-php.png
date: 2023-07-27 12:00:00 +0000
categories: [nodejs, php]
comments: true
---

What if you really want a Node.js web server, but hosting is only available in PHP? Run Node.js on PHP web hosting! Bonus - web hosting is cheaper than VPS.

A typical web hosting stack is Linux + Apache + MySQL + PHP (LAMP). It does not have root rights and there is no way to replace the web server (Apache) with something else (Node.js). Sometimes there is access to the server via SSH, but it may not be.

What we will need:

- Web hosting with Apache and PHP.
- Ability to upload any files to the server.
- Ability to change Apache rules via `mod_rewrite`.
- Ability to run arbitrary scripts on the server via `cron`.

![nodejs-via-php](/assets/images/nodejs-via-php.png "Node.js via PHP")

<!--more-->

## Bootstrap for Node.js

Create a new directory `~/app` in the user's home directory. Load the Node.js project into it, along with the `package.json` file. In the same directory, create a `run.sh` script to run the Node application. Change permissions to 755 (rwxr-xr-x) for it. The script code is below:

```sh
#!/bin/sh

set -ex

APP_DIR="${HOME}/app"
NODE_VER="node-v20.5.0-linux-x64"
NODE_URL="https://nodejs.org/dist/latest/${NODE_VER}.tar.gz"

cd "${APP_DIR}"

if [ ! -e "${APP_DIR}/${NODE_VER}/bin/node" ]
then
  wget -O - "${NODE_URL}" | tar xpz
fi

export PATH="${PATH}:${APP_DIR}/${NODE_VER}/bin"
export NODE_ENV="production"

if [ ! -e "${APP_DIR}/node_modules" ]
then
  npm install
fi

if [ -e "${APP_DIR}/run.pid" ]
then
  pid=$(cat "${APP_DIR}/run.pid")
  [ ! -e "/proc/${pid}" ] || exit 0
fi

echo $$ > "${APP_DIR}/run.pid"

exec node server.js
```

And this is an example of the `server.js` file:

```js
const http = require('node:http');
const express = require('express');

const { PORT = 3000, HOST = '127.0.0.1' } = process.env;

const app = express();
app.enable('trust proxy');

app.get('/api/hello', function(req, res, next) {
  res.send('Hello from Node.js');
});

http.Server(app).listen(PORT, HOST, function () {
  const address = this.address();
  console.log(`Listening on ${address.address}:${address.port}`);
});
```

You also need to create a `package.json` file, where you need to add the modules used by Node to the "dependencies" section:

```json
{
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

## Reverse proxy in PHP

There is a good project [no.php](https://github.com/michaelfranzl/no.php). This is transparent reverse proxy written in PHP that allows you to not have to write PHP any more.

From the project repository, you need to take the `no.php` file and save it to the `~/app` directory under the name `proxy.php`. In this file, two variables need to be replaced:

- $backend_url = "http://127.0.0.1:3000"
- $uri_rel = "proxy.php"

Port `3000` is the port that the Node.js web server is listening on.

## Rewrite rule for Apache

Now we need to have all requests to the web server handled by the `proxy.php` script. To do this, place the `.htaccess` file with the following content in the root public directory of the web server:

```
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule . proxy.php [L]
```

## Cron for run it

You can run the `run.sh` file through a `cron` job. The `cron` setting is usually available on all web hostings. An example of setting up a cron job to run a task every minute:

```
* * * * * /path/to/run.sh
```

It is important to correctly specify the full path to the `run.sh` file. If the script is already running, then it will not run again.
