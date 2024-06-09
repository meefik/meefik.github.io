---
permalink: /neux
layout: page
title: NEUX library
comments: false
footer: false
---

[NEUX](https://github.com/meefik/neux) is a nifty ecosystem for user experience development. It is a JavaScript frontend micro-library with reactivity states and views. The library has features and tools are suitable for building single-page applications (SPA) or isolated components.

Here are the main concepts behind NEUX:

- Minimum interaction with the library during development, more native JS code.
- Instead of HTML templates and JSX, defining views as nested JS objects with a set of attributes that are completely equivalent to the attributes of native HTML elements.
- Support for modern two-way reactivity.
- Availability of standard components to implement the basic SPA functionality:
  - routing,
  - localization,
  - synchronization of states with persistent storage,
  - calling remote procedures on the backend.
- Small library size ~ 11kb (5kb gzipped).
- It is open source software under MIT license.

## Content

1. [Installation](#installation)
2. [States](#states)
3. [Views](#views)
4. [Localization](#localization)
5. [Routing](#routing)
6. [Remote procedure call](#remote-procedure-call)
7. [State synchronization](#state-synchronization)
8. [Use with Vite](#use-with-vite)
9. [Use with Tailwind CSS](#use-with-tailwind-css)
10. [Use with daisyUI](#use-with-daisyui)
11. [Use with Web Components](#use-with-web-components)
12. [Create your own Web Component](#create-your-own-web-component)
13. [Examples](#examples)

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
<script src="https://unpkg.com/neux"></script>
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
  // regular fields
  counter: 1,
  multiplier: 2,
  // the field as array
  list: [
    { text: 'Item 1' },
    { text: 'Item 2', checked: true }
  ],
  // the computed field for an object
  double: (obj, prop) => obj.$counter * 2,
  // the computed field for an array
  filtered: (obj, prop) => {
    return obj.$list.filter(item => item.checked);
  },
  // subscribe to track changes to the "double" field
  $double: (newv, oldv, prop, obj) => {
    console.log(newv, oldv, prop, obj);
  },
  // subscribe to track any object changes
  $: (newv, oldv, prop, obj) => {
    console.log(newv, oldv, prop, obj);
  }
});
// set or change the computed field
state.double = (obj, prop) => state.$counter * state.$multiplier;
// change the regular field
state.counter++;
state.list.push({ text: 'Item 3' });
// remove the field with all listeners
delete state.double;
```

The `$` character ahead of a field name is used in computed fields to observe its changes. When changes occur in this field, this function will automatically recalled and receives the new value of the computed field.

**Attention!**

1. When deleting or replacing the tracking object/array in the computed field, all binding is lost.
2. In computed fields, binding occurs only with those fields that are called during the first synchronous execution.

Listening for state changes:

```js
const handler = (newv, oldv, prop, obj) => {
  console.log(newv, oldv, prop, obj);
  if (newv === undefined) {
    console.log('deleted');
  } else if (oldv === undefined) {
    console.log('added');
  } else {
    console.log('updated');
  }
};
// add a specified listener
state.$$on('double', handler);
// add a specified listener that only calls once
state.$$once('double', handler);
// remove a specified listener
state.$$off('double', handler);
// remove all listeners for the specified field
state.$$off('double');
// add a listener to observe any changes
// on this object and all children
state.$$on('*', handler);
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
const view = createView({
  children: [{
    tagName: 'h1',
    textContent: 'To Do'
  }, {
    tagName: 'input',
    placeholder: 'Enter your task...',
    autofocus: true,
    on: {
      keyup() {
        return (e) => {
          if (e.keyCode === 13) {
            e.preventDefault();
            state.list.push({ text: e.target.value });
            e.target.value = '';
          }
        };
      }
    }
  }, {
    tagName: 'div',
    children: [{
      tagName: 'input',
      type: 'checkbox',
      on: {
        change() {
          return (e) => {
            const checked = e.target.checked;
            state.list.forEach((item) => {
              item.checked = checked;
            });
          };
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
            mounted() {
              return () => console.log('mounted', item);
            },
            removed() {
              return () => console.log('removed', item);
            }
          },
          children: [{
            tagName: 'input',
            type: 'checkbox',
            checked: () => item.$checked,
            on: {
              change() {
                return (e) => {
                  item.checked = e.target.checked;
                };
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
              click() {
                return (e) => {
                  e.preventDefault();
                  const index = state.list.indexOf(item);
                  state.list.splice(index, 1);
                };
              }
            }
          }]
        };
      });
    }
  }, {
    textContent: () => `Total items: ${state.list.$length}`
  }]
}, { target: document.body });
// get the HTML element
console.log(view.el);
```

Additional events for each element:

- `mounted` - the element was mounted in the DOM;
- `removed` - the element was removed from the DOM;
- `changed` - the element attribute was changed.

You can change the DOM using simple operations on objects and arrays:

```js
const view = createView({
  tagName: 'ul',
  children: [{
    tagName: 'li',
    textContent: 'Item 1'
  }]
}, { target: document.body });

view.children.push({
  tagName: 'li',
  textContent: 'Item 2'
});
view.children[1].textContent = 'Item 3';
view.children.shift();
```

You can pass the entire HTML element in the "el" parameter:

```js
createView({
  children: [{
    el: document.createElement('footer'),
    textContent: 'Powered by NEUX'
  }]
}, { target: document.body });
```

You can include any SVG icon as HTML markup and change its styles (size, color) via the `classList` or `attributes` field:

```js
import githubIcon from '@svg-icons/fa-brands/github.svg?raw';

createView({
  outerHTML: githubIcon,
  classList: ['icon'],
  attributes: {
    width: '64px',
    height: '64px'
  }
}, { target: document.body });
```

For convenience, you can divide the code into separate components, which can have input properties of the parent element:

```js
const state = createState({
  counter: 0
});

function Button() {
  return [{
    tagName: 'button',
    textContent: '+1',
    on: {
      click() {
        return (e) => {
          e.preventDefault();
          const ev = new CustomEvent('increase', { bubbles: true });
          e.target.dispatchEvent(ev);
        }
      }
    }
  }];
}

function Counter(obj) {
  return [{
    tagName: 'label',
    textContent: () => obj.$text
  }];
}

createView({
  children: [{
    on: {
      increase() {
        return (e) => {
          e.preventDefault();
          state.counter++;
        };
      }
    },
    children: Button
  }, {
    text: () => state.$counter,
    children: Counter
  }]
}, { target: document.body });
```

## Localization

Localization is used to display the application interface in different languages.

Translation example:

```js
const l10n = createL10n({
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
}, {
  fallback: 'en',
  lang: navigator.language
});
l10n.lang = 'en';
const msgEn = l10n.t('say.hello', { name: 'World' });
console.log(msgEn); // Hello World!
l10n.lang = 'ru';
const msgRu = l10n.t('say.hello', { name: 'Мир' });
console.log(msgRu); // Привет Мир!
const msg = l10n.t('say.hello', { name: 'World' }, 'en');
console.log(msg); // Hello World!
```

Convert date and time to localized string:

```js
const l10n = createL10n({
  en: {
    month: {
      full: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      short: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    },
    day:{
      full: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      short: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    },
    time: {
      am: ['am','AM'],
      pm: ['pm','PM']
    }
  }
}, {
  fallback: 'en',
  lang: navigator.language
});
// date format
const date = new Date('2024-03-15T14:30:00.000Z');
const text = l10n.d(date, '{dddd}, {DD} {MMM} {YYYY} {h}:{mm} {A} {Z}');
console.log(text); // Friday, 15 Mar 2024 2:30 PM +0:00
```

Description of date format similar to [Moment.js](https://momentjs.com/docs/#/parsing/string-format/)

| Input    | Example        | Description                         |
|----------|----------------|-------------------------------------|
| YYYY     | 2024           | 4 digit year                        |
| YY       | 24             | 2 digit year                        |
| Q        | 1..4           | Quarter of year                     |
| M MM     | 1..12          | Month number                        |
| MMM MMMM | Jan..December  | Month name                          |
| D DD     | 1..31          | Day of month                        |
| DDD DDDD | 1..365         | Day of year                         |
| ddd dddd | Mon...Sunday   | Day name                            |
| X        | 1712751431.381 | Unix timestamp                      |
| x        | 1712751431381  | Unix ms timestamp                   |
| H HH     | 0..23          | Hours (24 hour time)                |
| h hh     | 1..12          | Hours (12 hour time used with a A.) |
| k kk     | 1..24          | Hours (24 hour time from 1 to 24)   |
| a A      | am PM          | Post or ante meridiem               |
| m mm     | 0..59          | Minutes                             |
| s ss     | 0..59          | Seconds                             |
| Z ZZ     | +12:00         | Offset from UTC                     |

## Routing

Routing is used to link separate states or pages of a web application to the address bar in the browser.

An example with comments:

```js
const router = createRouter({
  // #/:section/:page
  section: /^\/(\w+)\/\w+$/,
  page: /^\/\w+\/(\w+)$/
}, {
  home: '/section1/page1'
});
createView({
  children: [{
    children: [{
      tagName: 'a',
      href: '#/section1/page1',
      textContent: 'Page 1'
    }, {
      tagName: 'a',
      href: '#/section1/page2?key1=1',
      textContent: 'Page 2'
    }, {
      tagName: 'button',
      textContent: 'Page 3',
      on: {
        click() {
          return () => {
            router.navigate('/section1/page3', { key1: '1', key2: '2' });
          };
        }
      }
    }]
  }, {
    children: () => {
      switch (router.params.$page) {
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
    tagName: 'pre',
    textContent: () => [
      `Path: ${router.$path}`,
      `Params: ${JSON.stringify(router.params)}`,
      `Query: ${JSON.stringify(router.query)}`
    ].join('\n')
  }]
}, { target: document.body });
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
// server.js
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
const state = createState({
  list: []
});
// describe the synchronization function
const syncer = (newv, oldv) => {
  if (!oldv) {
    return JSON.parse(localStorage.getItem('todos') || '[]');
  } else {
    localStorage.setItem('todos', JSON.stringify(newv));
  }
  return newv;
};
// create a synchronization with state
// slippage (in ms) helps group and reduce call frequency
const sync = createSync(state.list, syncer, { slippage: 100 });
// sync state with local storage
sync();
```

Synchronizing state with remote store:

```js
const state = createState({
  list: []
});
// describe the synchronization function
const syncer = async (newv, oldv) => {
  return await rpc.getTodoList();
};
// create a synchronization with state
const sync = createSync(state.list, syncer);
// sync state with remote store
sync();
```

Undo last changes or clear:

```js
const state = createState({
  list: [
    { text: 'Item 1', checked: false }
  ]
});
// describe the synchronization function
const syncer = (newv, oldv, action) => {
  if (action === 'undo') return oldv;
  if (action === 'clear') return [];
  return newv;
};
// create a synchronization with state
const sync = createSync(state.list, syncer);
// commit current state
sync();
// change state
state.list[0].checked = true;
// commit changes
sync();
// change state again
state.list[0].checked = false;
// undo last change
sync('undo');
// delete all data
sync('clear');
```

## Use with Vite

You can use NEUX with [Vite](https://vitejs.dev) bundler.

How to set up:

**1.** Create a new Vite project (select a variant JavaScript):

```sh
npm init vite@latest
```

**2.** Install the `neux` module:

```sh
npm install --save-dev neux
```

**3.** Paste your application code into the `main.js` file:

```js
import { createView } from 'neux';

createView({
  textContent: 'Hello World!'
}, { target: document.body });
```

**4.** Run the project:

```sh
npm run dev
```

## Use with Tailwind CSS

It also fits well with [Tailwind CSS](https://tailwindcss.com). After [installing Tailwind CSS](https://tailwindcss.com/docs/installation) into your project you can use CSS classes in the `classList` field as `String` or `Array`.

How to set up your Vite project:

**1.** Install the required modules:

```sh
npm install --save-dev tailwindcss postcss autoprefixer
```

**2.** Create the file `tailwind.config.js`:

```js
export default {
  content: ['./index.html', './main.js'],
  theme: {
    extend: {}
  },
  plugins: []
};
```

**3.** Create the file `postcss.config.js`:

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

**4.** Replace the contents of the `style.css` file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**5.** Replace the contents of the `main.js` file with the example:

```js
import './style.css';
import { createView } from 'neux';

createView({
  tagName: 'h1',
  classList: ['text-3xl', 'font-bold', 'underline'],
  textContent: 'Hello world!'
}, { target: document.body });
```

## Use with daisyUI

To simplify styles you can use [daisyUI](https://daisyui.com). This is a popular component library for [Tailwind CSS](https://tailwindcss.com).

How to set up your Tailwind CSS project:

**1.** Install the required modules:

```sh
npm install --save-dev daisyui @tailwindcss/typography
```

**2.** Change the file `tailwind.config.js`:

```js
import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

export default {
  // ...
  plugins: [typography, daisyui]
};
```

**3.** Replace the contents of the `main.js` file with the example:

```js
import './style.css';
import { createState, createView } from 'neux';

const state = createState({ counter: 0 });

createView({
  classList: ['container', 'm-auto', 'p-8', 'flex', 'gap-4'],
  children: [{
    tagName: 'button',
    classList: ['btn', 'btn-primary'],
    textContent: '-1',
    on: {
      click() {
        return () => state.counter--;
      }
    }
  }, {
    tagName: 'input',
    type: 'number',
    classList: ['input', 'input-bordered', 'w-full'],
    value: () => state.$counter,
    on: {
      change() {
        return ({ target }) => state.counter = parseInt(target.value);
      }
    }
  }, {
    tagName: 'button',
    classList: ['btn', 'btn-primary'],
    textContent: '+1',
    on: {
      click() {
        return () => state.counter++;
      }
    }
  }]
}, { target: document.body });
```

## Use with Web Components

You can use NEUX along with any [Web Components](https://developer.mozilla.org/docs/Web/API/Web_Components). Many component libraries can be [found here](https://open-wc.org/guides/community/component-libraries/).

Let's take an example of working with the [BlueprintUI](https://blueprintui.dev) library:

**1.** Install the required modules:

```sh
npm install --save-dev @blueprintui/components @blueprintui/themes @blueprintui/layout @blueprintui/typography
```

**2.** Import styles in the `style.css` file:

```css
@import '@blueprintui/layout/index.min.css';
@import '@blueprintui/typography/index.min.css';
@import '@blueprintui/themes/index.min.css';
```

**3.** Replace the contents of the `main.js` file with the example:

```js
import { createView } from 'neux';
import './style.css';
import '@blueprintui/components/include/button.js';
import '@blueprintui/components/include/card.js';
import '@blueprintui/components/include/input.js';

createView({
  tagName: 'bp-card',
  children: [{
    tagName: 'h2',
    slot: 'header',
    attributes: {
      'bg-text': 'section'
    },
    textContent: 'Heading'
  }, {
    tagName: 'bp-field',
    children: [{
      tagName: 'label',
      textContent: 'label'
    }, {
      tagName: 'bp-input'
    }]
  }, {
    slot: 'footer',
    attributes: {
      'bp-layout': 'inline gap:xs inline:end'
    },
    children: [{
      tagName: 'bp-button',
      attributes: {
        action: 'secondary'
      },
      textContent: 'Cancel'
    }, {
      tagName: 'bp-button',
      attributes: {
        status: 'accent'
      },
      textContent: 'Confirm'
    }]
  }]
}, { target: document.body });
```

## Create your own Web Component

You can create your own components using [one of the libraries](https://open-wc.org/guides/community/base-libraries/), for example [Lit](https://lit.dev). But you can also create your own Web Components using NEUX.

An example of a web component definition:

```js
class Counter extends HTMLElement {
  static get observedAttributes() {
    return ['value'];
  }
  constructor() {
    super();
    const target = this.attachShadow({ mode: 'open' });
    const context = {};
    this.view = createView(this.template(), { context, target });
  }
  template() {
    return {
      attributes: {
        value: '',
        $: (newv, oldv, prop) => this.setAttribute(prop, newv)
      },
      children: (obj) => [{
        tagName: 'input',
        type: 'number',
        value: () => obj.attributes.$value,
        on: {
          change() {
            return (e) => {
              obj.attributes.value = e.target.value;
            };
          }
        }
      }, {
        tagName: 'slot',
        name: 'label',
        textContent: () => obj.attributes.$value
      }]
    };
  }
  attributeChangedCallback(name, oldv, newv) {
    this.view.attributes[name] = newv;
  }
}
customElements.define('ne-counter', Counter);
```

Use this web component:

```js
const state = createState({
  counter: 1
});
createView({
  tagName: 'ne-counter',
  attributes: {
    value: () => state.$counter,
  },
  on: {
    changed() {
      return (e) => {
        state.counter = parseInt(e.detail.newValue);
      };
    }
  },
  children: [{
    tagName: 'span',
    slot: 'label',
    textContent: () => state.$counter
  }]
}, { target: document.body });
```

## Examples

You can find development examples with NEUX in the following repositories:

- [neux-todo-app](https://github.com/meefik/neux-todo-app) - example To-Do application on NEUX + Tailwind CSS + Vite;
- [neux-demo](https://github.com/meefik/neux-demo) - various examples on NEUX.

<p><iframe src="https://ghbtns.com/github-btn.html?user=meefik&repo=neux&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe></p>
