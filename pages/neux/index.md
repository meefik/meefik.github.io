---
permalink: /neux
layout: page
title: NEUX library
comments: false
footer: false
---

[NEUX](https://github.com/meefik/neux) is a nifty ecosystem for user experience development. The JS frontend library has features and tools are suitable for building small single-page applications (SPA) or isolated UI components.

Here are the main concepts behind NEUX:

- Minimum interaction with the library during development, more native JS code.
- Instead of HTML templates and JSX, defining views as nested JS objects with a set of attributes that are completely equivalent to the attributes of native HTML elements.
- Support for modern two-way reactivity.
- Availability of standard components to implement the basic SPA functionality:
  - routing,
  - localization,
  - synchronization of states with persistent storage,
  - calling remote procedures on the backend.
- Small library size ~ 8kb (4kb gzipped).

![neux](/assets/images/neux.png "NEUX")

## Content

1. [Installation](#installation)
2. [States](#states)
3. [Views](#views)
4. [Components](#components)
5. [Localization](#localization)
6. [Routing](#routing)
7. [Remote procedure call](#remote-procedure-call)
8. [State synchronization](#state-synchronization)
9. [Use with Tailwind CSS](#use-with-tailwind-css)

## Installation

When using bundlers, you need to install the library from NPM:

```sh
npm install neux
```

And import it into your project:

```js
import { 
  createState,
  createView,
  createL10n,
  createRouter,
  createSync,
  createRPC
} from 'neux'
// use the library here...
```

Also, you can use it from the browser:

```html
<script src="https://unpkg.com/neux@latest/dist/neux.min.js"></script>
<script>
  const { 
    createState,
    createView,
    createL10n,
    createRouter,
    createSync,
    createRPC
  } = NEUX;
  // use the library here...
</script>
```

## States

The state is a proxy for objects. States are used to track changes and distribute them to related views and other state fields.

An example with comments:

```js
const state = createState({
  counter: 1,
  multiplier: 2,
  tasks: [
    { text: 'Item 1' },
    { text: 'Item 2', checked: true }
  ],
  // the calculated field for an object
  double: (obj, prop) => obj.$counter * 2,
  // the calculated field for an array
  filtered: (obj, prop) => {
    return obj.$tasks.filter(item => item.checked);
  }
});
// set or change the calculated field
state.double = (obj, prop) => state.$double * state.$multiplier;
// delete specified field with all listeners
delete state.double;
```

The `$` character ahead of a field name is used in calculated fields to monitor its changes. When changes occur in this field, this function will automatically restart to recalculate the new value of the calculated field.

**Attention!**

1. When deleting or replacing the tracking object/array in the calculated field, all binding is lost.
2. In calculated fields, binding occurs only with those fields that are called during initialization.

Watching for state changes:

```js
const handler = (newv, prop, obj) => {
  const oldv = obj[prop];
  console.log(newv, oldv, prop, obj);
};
// add a specified listener
state.$$on('double', handler);
// add a specified listener that only calls once
state.$$once('double', handler);
// remove a specified listener
state.$$off('double', handler);
// remove all listeners for the specified field
state.$$off('double');
// add a listener to watch any changes
// on this object and all children
state.tasks.$$on('*', handler);
```

## Views

A view is a declarative definition of DOM elements.

An example with comments:

```js
const state = createState({
  list: [
    { text: 'Item 1'},
    { text: 'Item 2', checked: true },
    { text: 'Item 3' }
  ]
});
createView({
  children: [{
    tagName: 'h1',
    textContent: 'To Do'
  }, {
    tagName: 'input',
    placeholder: 'Enter your task...',
    autofocus: true,
    on: {
      keyup: (e) => {
        if (e.keyCode === 13) {
          e.preventDefault();
          state.list.push({ text: e.target.value });
          e.target.value = '';
        }
      },
    }
  }, {
    tagName: 'div',
    children: [{
      tagName: 'input',
      type: 'checkbox',
      on: {
        change: (e) => {
          const checked = e.target.checked;
          state.list.forEach((item) => {
            item.checked = checked;
          });
        }
      }
    }, {
      tagName: 'label',
      textContent: 'Mark all as complete'
    }]
  }, {
    tagName: 'ul',
    children: () => {
      // redraw the list if any child element is added, replaced or removed
      // any updates inside children are ignored
      return state.list.$$each(item => {
        return {
          tagName: 'li',
          on: {
            mounted: () => console.log('mounted', item),
            removed: () => console.log('removed', item)
          },
          children: [{
            tagName: 'input',
            type: 'checkbox',
            checked: () => item.$checked,
            on: {
              change: (e) => {
                item.checked = e.target.checked;
              }
            }
          }, {
            tagName: 'label',
            textContent: () => item.$text
          }, {
            tagName: 'a',
            href: '#',
            textContent: '[x]',
            on: {
              click: (e) => {
                e.preventDefault();
                const index = state.list.indexOf(item);
                state.list.splice(index, 1);
              }
            }
          }]
        };
      });
    }
  }, {
    textContent: () => `Total items: ${state.list.$length}`
  }]
}, document.body);
```

## Components

You can wrap part of the view into a separate component. It is a simple function that returns the markup of the view. To use such a component, you need to pass this function in the "view" parameter.

An example with comments:

```js
const Header = (params) => {
  return {
    tagName: 'header',
    children: [{
      tagName: 'strong',
      textContent: params.text
    }]
  };
};
createView({
  children: [{
    // create view from function
    view: Header,
    text: 'Welcome!'
  }, {
    // create view from HTML markup
    view: '<main><p>My content</p></main>',
    style: {
      color: 'red'
    }
  }, {
    // create view from HTMLElement
    view: document.createElement('footer'),
    textContent: 'Powered by NEUX'
  }]
}, document.body);
```

You can include SVG icons as a component and change their styles (size, color) via the `classList` or `attributes` field:

```js
import githubIcon from '@svg-icons/fa-brands/github.svg?raw';

createView({
  view: githubIcon,
  classList: ['icon'],
  attributes: {
    width: '64px',
    height: '64px'
  }
}, document.body);
```

## Localization

Localization is used to display the application interface in different languages.

An example with comments:

```js
const l10n = createL10n({
  locales: {
    en: {
      say: {
        hello: "Hello %{name}!"
      }
    },
    ru: {
      say: {
        hello: "Привет %{name}!"
      }
    }
  },
  fallback: 'en',
  lang: navigator.language
});
const msg = l10n.t('say.hello', { name: 'World' }, 'en');
console.log(msg); // Hello World!
l10n.lang = 'en';
const msgEn = l10n.t('say.hello', { name: 'World' });
console.log(msgEn); // Hello World!
l10n.lang = 'ru';
const msgRu = l10n.t('say.hello', { name: 'Мир' });
console.log(msgRu); // Привет Мир!
```

## Routing

Routing is used to link separate states or pages of a web application to the address bar in the browser.

An example with comments:

```js
const router = createRouter({
  home: 'page1'
});
createView({
  children: [{
    children: [{
      tagName: 'a',
      href: '#page1',
      textContent: 'Page 1'
    }, {
      tagName: 'a',
      href: '#page2?param1=1',
      textContent: 'Page 2'
    }, {
      tagName: 'button',
      textContent: 'Page 3',
      on: {
        click: () => {
          router.navigate('page3', { param1: '1', param2: '2' });
        }
      }
    }]
  }, {
    children: () => {
      switch (router.$path) {
      case 'page1':
        return [{
          tagName: 'p',
          textContent: 'Page 1'
        }];
      case 'page2':
        return [{
          tagName: 'p',
          textContent: 'Page 2'
        }];
      case 'page3':
        return [{
          tagName: 'p',
          textContent: 'Page 3'
        }];
      default:
        return [{
          tagName: 'p',
          textContent: 'Not found'
        }];
      }
    }
  }, {
    textContent: () => `Path: ${router.$path} , Params: ${JSON.stringify(router.$params)}`
  }]
}, document.body);
```

## Remote procedure call

RPC is short for Remote Procedure Call. This abstraction allows you to execute code on the backend by calling normal functions on the frontend.

Here is an example of calling some function:

```js
// create RPC client
const rpc = createRPC({ url: '/api/rpc' });
// define input parameters
const text = 'Text'; // as text
const object = { text }; // as object
const blob = new Blob([text]); // as blob
const file = new File([blob], 'file.txt'); // as file
const formData = new FormData(); // as form-data
formData.append('file', file);
// call the remote function named "hello"
const response = await rpc.hello(/* params */);
console.log(response);
```

The function can accept input parameters in the formats `String`, `Object`, `Blob`, `File` or `FormData`. The function response can be one of three types `String`, `Object` or `Blob`.

The default backend request HTTP method is `POST`. The API address on the backend has the format `/api/rpc/:method`, where `:method` is the name of the function to run.

The request can be of the following types:

- `application/json` - format for passing JavaScript objects.
- `multipart/from-data` - file transfer format.
- `text/plain` - all non-objects are passed as text.

The response must be of the following types:

- `application/json` - format for passing JavaScript objects.
- `application/octet-stream` - file transfer format.
- `text/plain` - all non-objects are passed as text.

Below is an example of using RPC for some imaginary backend:

```js
let token = '';
// create RPC client
const rpc = createRPC({
  // RPC backend endpoint
  url: '/api/rpc',
  // include headers for every request
  headers: {
    // getter for authorization header
    get Authorization() {
      return token && `Bearer ${token}`;
    }
  },
  // include cookies for every request
  // credentials: 'include',
  // enable CORS for requests
  // mode: 'cors'
});
// authorize and get the session token
token = await rpc.login({ username, password });
// upload file from <input id="file" type="file" />
const file = document.getElementById('file').files[0];
const { id, name, type, size } = await rpc.upload(file);
// send json data
const res = await rpc.addComment({
  author: 'John Doe',
  text: 'Hello World!',
  time: new Date(),
  attachments: [id]
});
// update data
await rpc.updateComment({
  id: res.id,
  text: 'Edited message'
});
// receive json data
const comment = await rpc.getComment({
  id: res.id
});
```

Below is an example implementation of the server API for RPC on Node.js:

```js
import http from 'node:http';
import os from 'node:os';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import express from 'express';
import multer from 'multer';

const { PORT = 3000, HOST = '127.0.0.1' } = process.env;
const upload = multer({ dest: os.tmpdir() });
const app = express();

app.enable('trust proxy');
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.json());

const todos = [];
const handlers = {
  async hello (name) {
    return `Hello ${name}!`;
  },
  async time () {
    return { time: new Date() };
  },
  async upload (file) {
    return file;
  },
  async download (path) {
    return fs.createReadStream(path);
  },
  async syncTodoList (diff) {
    if (diff) {
      const { add = [], mod = [], del = [] } = diff;
      for (const item of add) {
        const _index = todos.findIndex(el => el.id === item.id);
        if (_index < 0) {
          todos.push(item);
        }
      }
      for (const item of mod) {
        const _item = todos.find(el => el.id === item.id);
        if (!_item) continue;
        for (const field in item) {
          if (item[field] === null) delete _item[field];
          else _item[field] = item[field];
        }
      }
      for (const item of del) {
        const _index = todos.findIndex(el => el.id === item.id);
        if (_index < 0) continue;
        delete todos[_index];
      }
    }
    return todos;
  }
};

app.post('/api/rpc/:method',
  upload.single('file'),
  async function (req, res, next) {
    try {
      const { method } = req.params;
      const params = req.file || req.body;
        const handler = handlers[method];
        if (typeof handler !== 'function') {
          throw Error('Method not found');
        }
        const data = await handler(params);
      if (data instanceof Readable) {
        res.set('Content-Type', 'application/octet-stream');
        data.on('error', () => res.end());
        return data.pipe(res);
      }
      if (typeof data === 'object') {
        res.set('Content-Type', 'application/json');
        return res.json(data);
      }
      res.set('Content-Type', 'text/plain');
      res.send(data);
    } catch (err) {
      next(err);
    }
  });

http.Server(app).listen(PORT, HOST);
```

You can start the server like this:

```sh
npm install express multer
node server.js
```

And an example of calling RPC methods in NEUX:

```js
const rpc = createRPC({ url: '/api/rpc' })
rpc.hello('World').then(data => {
  console.log('hello:', data);
});
rpc.time().then(data => {
  console.log('time:', data);
});
rpc.download('/tmp/test').then(data => {
  console.log('download:', data);
});
const blob = new Blob(['Hello World!']);
const file = new File([blob], 'demo.txt');
rpc.upload(file).then(data => {
  console.log('upload:', data);
});
```

## State synchronization

State synchronization is used to save their data to persistent storage.

Synchronizing state with `localStorage`:

```js
const syncer = (newv, oldv, diff) => {
  if (!oldv) {
    return JSON.parse(localStorage.getItem('todos') || '[]');
  } else {
    localStorage.setItem('todos', JSON.stringify(newv));
  }
  return newv;
};
// create a synchronization with state
// slippage (in ms) helps group and reduce call frequency
const sync = createSync(state.tasks, syncer, { slippage: 100 });
// sync state with local storage
sync();
```

Synchronizing state with remote store:

```js
const syncer = async (newv, oldv, diff) => {
  return await rpc.syncTodoList(diff);
};
// create a synchronization with state
const sync = createSync(state.tasks, syncer);
// sync state with remote store
sync();
```

Undo last changes or clear:

```js
const syncer = (newv, oldv, diff, action) => {
  if (action === 'undo') return oldv;
  if (action === 'clear') return [];
  return newv;
};
// create a synchronization with state
const sync = createSync(state.tasks, syncer);
// commit current state
sync();
// change state
state.tasks[0].checked = true;
// commit changes
sync();
// change state again
state.tasks[0].checked = false;
// undo last change
sync('undo');
// delete all data
sync('clear');
```

## Use with Tailwind CSS

It also fits well with the [Tailwind CSS](https://tailwindcss.com). After [installing Tailwind CSS](https://tailwindcss.com/docs/installation) into your project you can use CSS classes in the `classList` field as `String` or `Array`.

An example of the `tailwind.config.js` configuration file:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

Use attribute `classList` in your NEUX view:

```js
createView({
  classList: ['bg-white', 'shadow', 'sm:rounded-lg'],
  children: [{
    classList: ['px-4', 'py-5', 'sm:p-6'],
    children: [{
      tagName: 'h3',
      classList: ['text-base', 'font-semibold', 'leading-6', 'text-gray-900'],
      textContent: 'Manage subscription'
    }, {
      classList: ['mt-2', 'max-w-xl', 'text-sm', 'text-gray-500'],
      children: [{
        tagName: 'p',
        textContent: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae voluptatibus corrupti atque repudiandae nam.'
      }]
    }, {
      classList: ['mt-5'],
      children: [{
        tagName: 'button',
        type: 'button',
        classList: ['inline-flex', 'items-center', 'rounded-md', 'bg-indigo-600', 'px-3', 'py-2', 
          'text-sm', 'font-semibold', 'text-white', 'shadow-sm', 'hover:bg-indigo-500', 
          'focus-visible:outline', 'focus-visible:outline-2', 'focus-visible:outline-offset-2','focus-visible:outline-indigo-500']
        textContent: 'Change plan'
      }]
    }]
  }]
}, document.body);
```

Output:

![TailwindCSS](/assets/images/neux-tailwindcss.png "NEUX + Tailwind CSS")

## Examples

You can find more development examples with the NEUX library in a separate [neux-demo](https://github.com/meefik/neux-demo) repository.

## License

MIT License

Copyright (c) 2023 Anton Skshidlevsky

<p><iframe src="https://ghbtns.com/github-btn.html?user=meefik&repo=neux&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe></p>
