---
layout: post
title: RPC as native JS functions
description: Implementing Remote Procedure Call (RPC) as native JavaScript functions for seamless client-server communication.
date: 2024-04-14 12:00:00 +0000
categories: [javascript, rpc]
comments: true
---

RPC, short for Remote Procedure Call, is an efficient way to connect your frontend directly with backend functions. Rather than using traditional REST APIs with multiple endpoints, RPC lets you invoke server functionality using a concise and unified interface. In modern web development, this approach not only simplifies code but also leads to more modular and maintainable applications.

With RPC as a native JavaScript function, you can seamlessly manage different types of data transfers, whether you're sending JSON objects, plain text, or even files. This post explores the key concepts behind native RPC implementation, offers examples for both client and server, and provides usage examples to demonstrate how the design can fit into real-world applications.

<!--more-->

## RPC client

The function accepts parameters in several formats: String, Object, Blob or File. By default, RPC sends requests to URLs with the pattern `/api/rpc/:method` using the HTTP `POST` method. The type of the request is determined by the parameter format:

- **application/json** – for JavaScript objects.
- **application/octet-stream** – for file transfers.
- **text/plain** – for simple text parameters.

```js
/**
 * Create an RPC client.
 *
 * @param {string} url URL of the RPC server.
 * @param {object} [options] Fetch options.
 * @param {string} [options.method="POST"] HTTP method.
 * @param {object} [options.headers] HTTP headers.
 * @returns {Proxy}
 */
function rpc(url, options = {}) {
  const { method = 'POST', headers = {} } = options;
  const target = {};
  Object.seal(target);
  const handler = {
    get: (_obj, prop) => async (params) => {
      const reqHeaders = new Headers(headers);
      if (!reqHeaders.has('content-type')) {
        if (params instanceof Blob) {
          reqHeaders.set('content-type', 'application/octet-stream');
        }
        else if (typeof params === 'object') {
          reqHeaders.set('content-type', 'application/json');
          params = JSON.stringify(params);
        }
        else if (typeof params === 'string') {
          reqHeaders.set('content-type', 'text/plain');
        }
      }
      const res = await fetch(`${url || ''}/${prop}`, {
        ...options,
        method,
        headers: reqHeaders,
        body: params,
      });
      if (!res.ok) {
        throw Error(res.statusText);
      }
      const contentType = res.headers.get('content-type') || '';
      if (/^application\/json/u.test(contentType)) {
        return await res.json();
      }
      if (/^application\/octet-stream/u.test(contentType)) {
        return await res.blob();
      }
      return await res.text();
    },
  };
  return new Proxy(target, handler);
}
```

## RPC server

The following example outlines a simple Node.js server API implementation for RPC:

```js
// server.mjs
import { createServer } from 'node:http';
import { basename, dirname } from 'node:path';
import { parse } from 'node:url';
import { Readable } from 'node:stream';

const { PORT = 3000, HOST = '127.0.0.1' } = process.env;

// RPC methods
const handlers = {
  async echo(data) {
    return data;
  },
};

// HTTP server
const server = createServer((req, res) => {
  const pathname = parse(req.url).pathname;
  const dir = dirname(pathname);
  const method = basename(pathname);
  const handler = handlers[method];
  if (req.method === 'POST' && dir === '/api/rpc' && handler) {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', async () => {
      let params;
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'];
        if (/^application\/json/u.test(contentType)) {
          params = JSON.parse(buffer.toString('utf8'));
        }
        else if (/^application\/octet-stream/u.test(contentType)) {
          params = buffer;
        }
        else {
          params = buffer.toString('utf8');
        }
        const data = await handler(params);
        if (data instanceof Readable) {
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          data.on('error', () => res.end());
          return data.pipe(res);
        }
        if (Buffer.isBuffer(data)) {
          res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
          return res.end(data);
        }
        if (typeof data === 'object') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(data));
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`${data}`);
      }
      catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`${err.message}\n`);
      }
    });
  }
  else {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad Request\n');
  }
},
).listen(PORT, HOST, function () {
  const addr = this.address();
  console.log(`Server running at http://${addr.address}:${addr.port}`);
});
```

Start the server:

```sh
node server.mjs
```

## Usage example

The example below demonstrates how to create an API endpoint that utilizes the RPC abstraction with custom settings. It also shows how to interact with various methods provided by the RPC server.

```js
let token = '';
// Create an API endpoint using RPC with custom settings
const api = rpc('/api/rpc', {
  method: 'POST',
  headers: {
    // Dynamically retrieves the Authorization header
    get Authorization() {
      return token && `Bearer ${token}`;
    }
  },
});
// Call a backend function with a text parameter
api.echo('Hello World!').then(data => {
  console.log('text', data);
});
// Call a backend function with SON parameters
api.echo({ say: 'hello' }).then(data => {
  console.log('json', data);
});
// Create, upload, and download a file
const blob = new Blob(['Hello World!']);
const file = new File([blob], 'demo.txt');
api.echo(file).then(data => {
  console.log('file', data);
});
```

## Summary

Implementing RPC as a native JS function reduces the overhead of traditional API design by simplifying client-server communications. This approach leverages JavaScript's dynamic nature through proxies and the native fetch API, resulting in a flexible, maintainable, and scalable architecture. The provided examples illustrate how to handle various data types and support operations like file transfers seamlessly.

By integrating RPC into your projects, you can create more efficient and streamlined applications, reducing the complexity of your codebase while enhancing the overall performance and user experience.

Happy coding!
