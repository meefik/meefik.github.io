---
layout: post
title: Reflections on JavaScript templates
description: A review of various JavaScript templating approaches including imperative, JSX, HyperScript, and declarative methods.
date: 2023-05-17 12:00:00 +0000
categories: [javascript]
comments: true
---

I was thinking about template formats in JS frameworks and found the following options:

- Imperative creation of HTML elements in JS (native, but not convenient);
- HTML markup as text (text cannot be validated in the IDE);
- JSX markup (HTML tags inside JS code without quotes, syntactically incorrect in JS, but there is a layer for adaptation);
- HyperText (HTML elements via a function, syntactically correct in JS);
- Other less common options.

<!--more-->

## HTML markup

Let's say we want to get the following markup in HTML.

```html
<section class="todoapp">
  <h1>To Do</h1>
  <input id="add" value="" />
  <ul>
    <li>
      <input type="checkbox" />
      <label>Item 1</label>
      <button>x</button>
    </li>
  </ul>
</section>
```

## Imperative native approach

We can create the required markup using the browser's native API.

```js
function createToDoView() {
  const section = document.createElement('section');
  section.className = 'todoapp';

  const header = document.createElement('h1');
  header.textContent = 'To Do';
  section.appendChild(header);

  const input = document.createElement('input');
  input.id = 'add';
  input.value = '';
  section.appendChild(input);

  const ul = document.createElement('ul');
  section.appendChild(ul);

  const li = document.createElement('li');
  ul.appendChild(li);

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  li.appendChild(checkbox);

  const label = document.createElement('label');
  label.textContent = 'Item 1';
  li.appendChild(label);

  const button = document.createElement('button');
  button.textContent = 'x';
  li.appendChild(button);

  return section;
}
```

This option is not particularly visual and redundantly verbose.

## DOM elements from text

We can also use HTML markup as text. It looks more compact. But your IDE does not validate this.

```js
function createToDoView() {
  const el = document.createElement('div');
  el.innerHTML = `
    <section class="todoapp">
      <h1>To Do</h1>
      <input id="add" value="" />
      <ul>
        <li>
          <input type="checkbox" />
          <label>Item 1</label>
          <button>x</button>
        </li>
      </ul>
    </section>
  `;
  return el.firstChild;
}
```

## JSX

JSX is an extension to the JavaScript language syntax. It is similar in appearance to HTML. But it is not native and adaptation is required to support the syntax.

```js
function createToDoView() {
  return (
    <section class="todoapp">
      <h1>To Do</h1>
      <input id="add" value="" />
      <ul>
        <li>
          <input type="checkbox" />
          <label>Item 1</label>
          <button>x</button>
        </li>
      </ul>
    </section>
  );
}
```

## HyperScript

Hierarchical structure represented as function calls. [Hyper DOM Expressions](https://www.npmjs.com/package/hyper-dom-expressions) is implementation example.

```js
function createToDoView(h) {
  return h('section.todoapp', [
    h('h1', 'To Do'),
    h('input#add', { value: '' }),
    h('ul', [
      h('li', [
        h('input', { type: 'checkbox' }),
        h('label', 'Item 1'),
        h('button', {}, 'x')
      ])
    ])
  ]);
}
```

## Declarative markup as nested arrays

Similar to HyperScript, but represented as nested arrays.

```js
function createToDoView(parser) {
  return render(
    ['section', [
      ['h1', 'To Do'],
      ['input', { value: '' }],
      ['ul', [
        ['li', [
          ['input', { type: 'checkbox' }],
          ['label', 'Item 1'],
          ['button', {}, 'x']
        ]]
      ]]
    ]]
  );
}
```
An example implementation of the render function:

```js
function render(view, target) {
  if (typeof view === 'function') {
    view = view();
  }
  if (Array.isArray(view)) {
    let [tag = 'DIV', attrs, content] = view;
    // children
    if (Array.isArray(tag)) {
      for (const node of view) {
        render(node, target);
      }
      return;
    }
    // element
    if (typeof tag === 'string') {
      if (Array.isArray(attrs) || typeof attrs !== 'object') {
        content = attrs;
        attrs = null;
      }
      const el = document.createElement(tag);
      patch(attrs, el);
      render(content, el);
      if (target) target.appendChild(el);
      return el;
    }
    // component
    if (typeof tag === 'function') {
      if (Array.isArray(attrs) || typeof attrs !== 'object') {
        content = attrs;
        attrs = null;
      }
      const obj = tag(attrs, content);
      render(obj, target);
      return;
    }
  } else if (target) {
    target.textContent = view;
  }
}

function patch (source = {}, target = {}) {
  for (const key in source) {
    const value = source[key];
    if (value !== null && typeof value === 'object') {
      patch(value, target[key]);
    } else {
      target[key] = value;
    }
  }
}
```

## Declarative markup as nested objects

Declarative hierarchical structure represented as nested objects.

```js
function createToDoView(parser) {
  return render(
    { tagName: 'section', className: 'todoapp', children: [
      { tagName: 'h1', textContent: 'To Do' },
      { tagName: 'input', id: 'add', value: '' },
      { tagName: 'ul', children: [
        { tagName: 'li', children: [
          { tagName: 'input', type: 'checkbox' },
          { tagName: 'label', textContent: 'Item 1' },
          { tagName: 'button', textContent: 'x' }
        ] }
      ] }
    ] }
  );
}
```

An example implementation of the render function:

```js
function render (view) {
  const {
    attributes,
    classList = [],
    tagName = 'DIV',
    children
  } = { ...view };
  for (const attr of ['attributes', 'classList', 'tagName', 'children']) {
    delete view[attr];
  }
  const el = document.createElement(tagName);
  patch(view, el);
  for (let i = 0; i < classList.length; i++) {
    const cls = classList[i];
    el.classList.add(cls);
  }
  for (const attr in attributes) {
    const val = attributes[attr];
    el.setAttribute(attr, val);
  }
  if (typeof children === 'object') {
    const nodes = [].concat(children);
    for (const node of nodes) {
      const child = render(node);
      el.appendChild(child);
    }
  } else if (typeof children === 'function') {
    const nodes = [].concat(children(view));
    for (const node of nodes) {
      const child = render(node);
      el.appendChild(child);
    }
  }
  return el;
}

function patch (source = {}, target = {}) {
  for (const key in source) {
    let value = source[key];
    if (typeof value === 'function') {
      value = value(target, key);
    }
    if (value !== null && typeof value === 'object') {
      patch(value, target[key]);
    } else {
      target[key] = value;
    }
  }
}
```

I like this option. It is native to JavaScript and uses standard DOM element attributes as a nested object structure.
