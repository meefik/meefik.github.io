---
permalink: /neux
layout: page
title: NEUX library
description: NEUX is a lightweight frontend library for building dynamic user interfaces using declarative element definitions and reactive signals.
image: /assets/images/neux.png
comments: false
footer: false
---

[NEUX](https://github.com/meefik/neux "Native Extended User eXperience") is a lightweight frontend library for building dynamic user interfaces using declarative element definitions and reactive signals to modify them. It leverages native JavaScript and browser APIs to minimize boilerplate, making it ideal for creating single page applications (SPA) and custom web components.

**Key features:**

- No JSX, no compiler, just in real-time.
- Framework-agnostic, use any part of the library independently.
- Declarative element definitions using plain objects powered by reactive state management.
- Intuitive two-way reactivity with direct DOM changes without virtual DOM.
- Built-in localization support for dynamic language adaptation.
- Easy integration with CSS modules, Tailwind CSS, and other styling solutions.
- Minimal bundle size (~4kb gzipped) for fast loading.
- Open source and available under the MIT license.

**Just try it** in the playground:

<iframe title="NEUX: To-Do App" scrolling="no" loading="lazy" style="height:400px; width: 100%;" src="https://v47.livecodes.io/?x=id/uhkch4mgxfp&lite=true">
  See the project <a href="https://v47.livecodes.io/?x=id/uhkch4mgxfp" target="_blank">NEUX: To-Do App</a> on <a href="https://livecodes.io" target="_blank">LiveCodes</a>.
</iframe>

## Content

1. [Getting Started](#getting-started)
2. [Rendering Elements](#rendering-elements)
3. [Reactive Signals](#reactive-signals)
4. [Localization](#localization)
5. [Custom Context](#custom-context)
6. [Simple Routing](#simple-routing)
7. [Building with Vite](#building-with-vite)
8. [Using with Tailwind CSS](#using-with-tailwind-css)
9. [Using with daisyUI](#using-with-daisyui)
10. [Using with Web Components](#using-with-web-components)
11. [Creating your own Web Component](#creating-your-own-web-component)
12. [Code Example](#code-example)

## Getting Started

Getting started with NEUX is quick and effortless. You can include NEUX directly in your project without any additional build steps. However, you can use the library with bundlers like Vite if it needed.

To use NEUX in the browser, simply add the following to your HTML page:

```html
<script src="https://unpkg.com/neux"></script>
<script>
  // Import NUEX functions
  const { render, mount, signal, effect, l10n } = window.neux;
  // Start building your app right away!
</script>
```

Or you can import it as an ES module:

```html
<script type="module">
  // Import NUEX functions
  import { render, mount, signal, effect, l10n } from 'https://esm.sh/neux';
  // Start building your app right away!
</script>
```

Take a look at the example below. It creates a button that displays a counter. Every time the button is clicked, the count is incremented and the displayed text is automatically updated via NEUX's reactive state management.

```js
// Create reactive state
const state = signal({ count: 1 });
// Render button element
const el = render({
  // Tag name
  tag: 'button',
  // Event listeners
  on: {
    // Increment count on click
    click: () => state.count++,
  },
  // Dynamic text content ($ mark enables reactivity)
  children: () => `Count: ${state.$count}`,
});
// Mount to DOM
mount(el, document.body);
```

NEUX also supports a concise [HyperScript](https://github.com/hyperhype/hyperscript)-like syntax for element creation using the `render()` function, similar to approaches found in other libraries. This syntax helps to define your elements in a more functional manner.

```js
// Create reactive state
const state = signal({ count: 1 });
// Render button element
const el = render(
  // Tag name
  'button',
  {
    // Event listeners
    on: {
      // Increment count on click
      click: () => state.count++,
    },
  },
  // Dynamic text content ($ mark enables reactivity)
  () => `Count: ${state.$count}`,
);
// Mount to DOM
mount(el, document.body);
```

## Rendering Elements

NEUX provides a powerful way to declaratively define HTML elements using plain JavaScript objects. You can specify various properties such as tag name, attributes, styles, event listeners, children, and other native HTML properties. The `render()` function processes these definitions and creates the corresponding HTML elements. The created elements can then be mounted to the DOM using the `mount()` function.

You should use the `render()` function to create an `Element` or `DocumentFragment` by declarative definition. Below is an overview of the most common parameters available for element configuration:

- `tag`: (String or Element) Specifies the HTML tag name (e.g., "div", "span") or HTML markup to create or an existing Element to use directly.
- `classList`: (Array of Strings or Function) Specifies one or more CSS classes to add to the element. It can be a static array or a function that returns an array based on dynamic context.
- `attributes`: (Object or Function) Maps attribute names to their corresponding values. Use a static object for fixed attributes or a function for dynamic assignment.
- `style`: (Object or Function) Sets inline CSS styles via an object where keys are CSS property names. This can also be defined as a function to handle dynamic styling.
- `dataset`: (Object or Function) Assigns custom data attributes (data-*) through a static mapping or a function that returns the mapping.
- `on`: (Object) Adds event listeners to the element. Each key represents an event name (e.g., "click", "change") with its corresponding handler function.
- `children`: (String, Array of Elements, or Function) Defines the inner content of the element. This can be a direct string, an array of element definitions, or a function that returns child nodes for dynamic rendering.
- `ref`: (Function) A callback that receives the created element, allowing you to store a reference or perform additional operations immediately after creation.

Extra configuration for edge cases:

- `shadowRootMode`: (String) Defines the mode of the element’s [shadow DOM](https://developer.mozilla.org/docs/Web/API/Web_components/Using_shadow_DOM), determining its accessibility and encapsulation. Options include 'open' (the shadow root is accessible via the element’s shadowRoot property) and 'closed' (the shadow root is hidden, preventing external access).
- `adoptedStyleSheets`: (Array) Specifies one or more [CSSStyleSheet](https://developer.mozilla.org/docs/Web/API/CSSStyleSheet) objects that can be associated with the element’s shadow DOM. This enables the use of constructable stylesheets for efficient, reusable styling.
- `namespaceURI`: (String) Specifies the XML namespace URI when [creating namespaced elements](https://developer.mozilla.org/docs/Web/API/Document/createElementNS), such as SVG or MathML. Usually, this property is not required because it is automatically determined by the tag name.

You can also include any other parameters specific to particular elements. This flexible approach supports both static configurations and dynamic, reactive user interfaces.

```js
const el = render({
  tag: 'ul',
  classList: ['list'],
  ref: ref => {
    console.log(ref);
  },
  children: ['Item 1', 'Item 2']
    .map((item, index) => {
      return {
        tag: 'li',
        style: {
          color: 'red',
        },
        attributes: {
          title: item,
        },
        dataset: {
          index,
        },
        textContent: item,
      };
    }),
});
```

The `el` variable will contain an HTML element with the following markup:

```html
<ul class="list">
  <li title="Item 1" data-index="0" style="color: red;">Item 1</li>
  <li title="Item 2" data-index="1" style="color: red;">Item 2</li>
</ul>
```

To attach any HTML element to the DOM you should use the `mount()` function. This function attaches elements to the DOM and sets up a [MutationObserver](https://developer.mozilla.org/docs/Web/API/MutationObserver) on the target to dispatch custom events on lifecycle changes. These events are emitted for each element in the target DOM tree.

List of lifecycle events:

- `mounted` is fired when the element is added to the DOM.
- `updated` is fired when the element property is updated.
- `changed` is fired when the element attribute is changed by external sources.
- `removed` is fired when the element is removed from the DOM.

The `removed` event is used internally to clean up signal bindings. You can prevent the default behavior for the target element and all its children by calling the `preventDefault()` method.

Example of using lifecycle events:

```js
// Create an HTML element
const el = render({
  // Event listeners
  on: {
    mounted(e) {
      console.log('Element mounted:', e);
    },
    changed(e) {
      console.log('Element changed:', e);
    },
    removed(e) {
      // you can prevent the default behavior
      // e.preventDefault();
      console.log('Element removed:', e);
    },
  },
  textContent: 'Hello World!',
});
// Mount to DOM and set up lifecycle events
mount(el, document.body);
// Change the element attribute
el.setAttribute('title', 'Text');
// Remove the element fomr DOM
el.remove();
```

In the `mount()` function, the second argument can be a target HTML element or CSS selector that will be used to find the target.

You can include any SVG icon as HTML markup and change its styles (size, color) via the `classList` or `attributes` parameters (raw import works with Vite):

```js
import githubIcon from '@svg-icons/fa-brands/github.svg?raw';

const svgElement = render({
  tag: githubIcon,
  classList: ['icon'],
  attributes: {
    width: '64px',
    height: '64px'
  }
});
```

Additionally, you can create a [DocumentFragment](https://developer.mozilla.org/docs/Web/API/DocumentFragment) by simply passing an array to the `render()` function:

```js
// Create DocumentFragment
const fragment = render([
  { tag: 'span', textContent: 'Item 1' },
  { tag: 'span', textContent: 'Item 2' },
  { tag: 'span', textContent: 'Item 3' },
]);
// Mount to DOM
mount(fragment, document.body);
```

Probably you want to change the element properties dynamically. NEUX allows you to use functions for most of the element parameters. These functions are reactive and will be re-evaluated by specific triggers such as `refresh` event or signals.

Look at the example below:

```js
const list = [
  { text: 'Item 1' },
  { text: 'Item 2' },
];
const el = render({
  tag: 'ul',
  children: () => {
    return list.map(item => {
      return {
        tag: 'li',
        textContent: () => item.text,
      };
    });
  },
});
mount(el, document.body);
```

In this example, the `children` parameter is defined as a function that returns an array of list items. Each list item has its `textContent` defined as a function that retrieves the `text` property from the corresponding item in the `list` array.

You can even use asynchronous functions to fetch data or perform other asynchronous operations before rendering the element properties:

```js
const el = render({
  children: async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
    const data = await response.json();
    return [{
      tag: 'h3',
      textContent: data.title,
    }, {
      tag: 'p',
      textContent: data.body,
    }]
  },
});
mount(el, document.body);
```

When you want to update the list or change the text of an item, you can modify the `list` array or its items directly. To trigger a re-evaluation of the functions and update the DOM accordingly, you can dispatch a custom `refresh` event to the target element:

```js
// Add a new item to the list
list.push({ text: 'Item 3' });
// Re-render the entire element
el.dispatchEvent(new CustomEvent('refresh'));
// Update the text of the first item
list[0].text = 'Updated Item 1';
// Update only specific properties
el.children[0].dispatchEvent(new CustomEvent('refresh', { detail: ['textContent'] }));
```

Note that when dispatching the `refresh` event, you can optionally provide a `detail` array that specifies which properties should be updated. If no detail is provided, all reactive functions will be re-evaluated on the target element. It's good to know that only the changed elements are replaced when lists like `children` are updated.

Instead of using `refresh` events, you can also use reactive signals to manage state and automatically update the DOM when the state changes. This approach is more efficient and easier to maintain, as it eliminates the need for manual event dispatching.

## Reactive Signals

Signals in NEUX are reactive proxies for objects. They track changes automatically and update any linked views or computed fields. Use signals to create reactive state, derived values, and listeners for side effects or debugging.

For example:

```js
// Reactive state with fields, computed properties, and listeners
const state = signal({
  count: 1,
  multiplier: 2,
  list: [
    { text: 'Item 1' },
    { text: 'Item 2', checked: true },
  ],
  // computed field
  double: obj => obj.$count * 2,
  // computed field that tracks all changes, including nested objects
  filtered: obj => obj.list.$$.filter(item => item.checked),
});
// Update the computed field
state.double = obj => state.$count * state.$multiplier;
// Modify fields
state.count++;
state.list.push({ text: 'Item 3' });
// Remove the field and its related reactive effects
delete state.double;
```

In computed fields, prefixing a property name with `$` marks it as reactive. When the property's value changes, the computed function is automatically invoked with its new value.

**ATTENTION**
- Removing or replacing the observed object/array will break all bindings.
- Only the fields accessed during the initial synchronous execution are tracked for updates.

You can use the `$$` sign to subscribe to any changes in this object, array, or any of its nested objects. Alternatively, use the `$` sign to track changes in the object or array without tracking changes in nested objects:

```js
// Create an HTML element
const el = render({
  tag: 'ul',
  children: () => {
    // Track changes in the list array,
    // such as adding, replacing, or deleting items, 
    // except for nested objects
    return state.list.$.map((item) => {
      return {
        tag: 'li',
        // Track changes the specific field
        textContent: () => item.$text,
      };
    });
  },
});
// Add new item to the array and then re-render the list
state.list.push({ text: 'Item 3' });
// Change the `li` element without rerendering the entire list
state.list[0].text = 'Item 1 was changed';
```

You can creates a reactive effect that computes a derived value and triggers a side effect.

For example:

```js
const dispose = effect(
  // Reactive getter: get count from state and subscribe to changes with '$' marker
  () => {
    const { $count } = state;
    return $count * 2;
  },
  // Non-reactive setter: get result from getter and use it
  (value) => {
    console.log(`The doubled count is: ${value}`);
  },
);
// Stop tracking changes and clear all associated subscriptions
dispose();
```

The first function (getter) retrieves `$count` from the reactive state and returns its multiplied value (in this case, doubled). This ensures that any change in `$count` will automatically update the computed result.

The second function (setter) acts as a non-reactive callback that receives the computed value and performs an action, such as logging it to the console.

Optionally, all reactivity subscriptions set up by the effect can be cleared by invoking the `dispose()` function, which stops further tracking and updates.

Additionally, you can subscribe to changes in your reactive state using dedicated listener methods. These listeners help you capture when a property's value is added, updated, or deleted. In the example below, the handler function demonstrates how to log the new value, old value, property name, the changed object, and any additional nested fields that were affected.

Here’s the example:

```js
// Define a handler function that receives state change details
const handler = (newv, oldv, prop, obj, nested) => {
  console.log('New value:', newv);
  console.log('Old value:', oldv);
  console.log('Changed property:', prop);
  console.log('Reactive object:', obj);
  console.log('Nested fields (if any):', nested);

  // Determine if the property was added, updated, or deleted
  if (newv === undefined) {
    console.log('Property deleted');
  } else if (oldv === undefined) {
    console.log('Property added');
  } else {
    console.log('Property updated');
  }
};
// Subscribe to changes on the 'double' property
state.$$on('double', handler);
// Subscribe with a one-time listener for the 'double' property
state.$$once('double', handler);
// Unsubscribe a specific listener from the 'double' property
state.$$off('double', handler);
// Remove all listeners for the 'double' property
state.$$off('double');
// Subscribe to any changes on this object
state.$$on('#', handler);
// Subscribe to any changes on this object and all nested children
state.$$on('*', handler);
```

In this example:
- The handler function logs useful details about state changes.
- Using `$$on()`, you can add persistent listeners.
- With `$$once()`, the listener triggers only the first time the change occurs.
- The `$$off()` method allows you to remove specific or all listeners for a given property.
- The hash `'#'` subscribes the handler to any changes on this object.
- The wildcard `'*'` subscribes the handler to any changes on this object and all nested children.

This flexibility lets you efficiently track and respond to state mutations across your application.

## Localization

Localization is used to display the application interface in different languages.You can use localized number and date formatting with [Intl.NumberFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) and [Intl.DateTimeFormat](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).

Translation example:

```js
const t = l10n({
  en: {
    say: {
      hello: "Hello %{name}!"
    },
    number: 'number: %{val}',
    date: 'date: %{val}'
  },
  ru: {
    say: {
      hello: "Привет %{name}!"
    },
    number: 'число: %{val}',
    date: 'дата: %{val}'
  }
}, {
  language: navigator.language,
  fallback: 'en'
});

const msgEn = t('say.hello', { name: 'World' });
console.log(msgEn); // Hello World!

const numberMsg = t('number', {
  val: [12345, {
    style: 'currency',
    currency: 'USD'
  }]
});
console.log(numberMsg); // number: $12,345.00

const dateMsg = t('date', {
  val: [new Date('2025-01-15'), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }]
});
console.log(dateMsg); // date: Wednesday, January 15, 2025

const msgRu = t('say.hello', { name: 'Мир' }, 'ru');
console.log(msgRu); // Привет Мир!
```

## Custom Context

By default, NEUX uses a global context for the `signal()` and `render()` functions. However, there are scenarios where you might need to use a custom context for signals and rendering. This allows you to separate multiple states, ensuring that reactivity works only within the same context. You can create an object and bind it to these functions.

Here’s an example of how to use a custom context:

```js
// Custom context
const context = { hi: 'hello' };
// Signal with custom context
const state = signal.call(context, {
  count() {
    console.log('signal', this.hi); // hello
    return 1;
  }
});
// Render with the same context
const el = render.call(context, {
  textContent() {
    console.log('render', this.hi); // hello
    return state.$count;
  }
});
// Mount to DOM
mount(el, document.body);
```

In this example:
- A custom context object is created with a property `hi`.
- The `signal` function is called with the custom context using `signal.call(context, {...})`.
- The `render` function is also called with the same custom context using `render.call(context, {...})`.
- The `this` keyword inside the signal and render functions refers to the custom context, allowing access to its properties.

This approach ensures that the reactivity and rendering logic are scoped to the custom context, providing better modularity and separation of concerns in your application or within Web Components.

## Simple Routing

NEUX lets you implement routing simply with reactive state. By tracking the URL hash, you can switch between views dynamically. The following example demonstrates a basic routing setup with detailed comments and improved styling.

```js
// Initialize routing state
const state = signal({
  path: location.hash.slice(1) || 'Home',
});
// Route components
const Home = () => ({
  tag: 'div',
  textContent: 'Welcome to the Home Page!',
});
const About = () => ({
  tag: 'div',
  textContent: 'This is the About Page.',
});
const NotFound = () => ({
  tag: 'div',
  textContent: '404 - Page Not Found',
});
// Route views
const views = { Home, About };
// App layout with navigation and content
const el = render({
  children: [
    // Navigation links
    {
      tag: 'nav',
      children: [{
        tag: 'a',
        href: '#Home',
        textContent: 'Home',
      }, {
        tag: 'a',
        href: '#About',
        textContent: 'About',
      }, {
        tag: 'a',
        href: '#Blog',
        textContent: 'Blog',
      }],
    },
    // Main content
    {
      tag: 'main',
      children: () => {
        const View = views[state.$path];
        return View ? View() : NotFound();
      },
    },
  ],
});
// Update state on hash change
window.addEventListener('hashchange', () => {
  state.path = location.hash.slice(1);
});
// Mount to DOM
mount(el, document.body);
```

In this setup:
- The reactive state holds the current path.
- Navigation links update the URL hash, which triggers a state change.
- The main content area dynamically renders the corresponding view.
- If the route is not found, a default "Not Found" view is displayed.

## Building with Vite

You can use NEUX with [Vite](https://vitejs.dev) bundler.

How to set up:

**1.** Create a new Vite project:

```sh
npm init vite@latest -- --template vanilla
```

**2.** Install the `neux` module:

```sh
npm install --save-dev neux
```

**3.** Paste your application code into the `src/main.js` file:

```js
import { render, mount } from 'neux';

const el = render({
  textContent: 'Hello World!',
});

mount(el, '#app');
```

**4.** Run the project:

```sh
npm run dev
```

## Using with Tailwind CSS

It also fits well with [Tailwind CSS](https://tailwindcss.com). After [installing Tailwind CSS](https://tailwindcss.com/docs/installation) into your project you can use CSS classes in the `classList` field as `String` or `Array`.

How to set up your Vite project:

**1.** Install the required modules:

```sh
npm install --save-dev tailwindcss @tailwindcss/vite
```

**2.** Create the file `vite.config.js`:

```js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
});
```

**3.** Replace the contents of the `src/style.css` file with:

```css
@import "tailwindcss";
```

**4.** Replace the contents of the `src/main.js` file with the example:

```js
import './style.css';
import { render, mount } from 'neux';

const el = render({
  tag: 'h1',
  classList: ['text-3xl', 'font-bold', 'underline'],
  textContent: 'Hello world!',
});

mount(el, '#app');
```

## Using with daisyUI

To simplify styles you can use [daisyUI](https://daisyui.com). This is a popular component library for [Tailwind CSS](https://tailwindcss.com).

How to set up your Tailwind CSS project:

**1.** Install the required modules:

```sh
npm install --save-dev daisyui
```

**2.** Replace the contents of the `src/style.css` file:

```css
@plugin "daisyui";
```

**3.** Replace the contents of the `src/main.js` file with the example:

```js
import './style.css';
import { signal, render, mount } from 'neux';

const state = signal({ count: 0 });

const el = render({
  classList: ['container', 'm-auto', 'p-8', 'flex', 'gap-4'],
  children: [{
    tag: 'button',
    classList: ['btn', 'btn-primary'],
    textContent: '-1',
    on: {
      click: () => {
        state.count--;
      },
    },
  }, {
    tag: 'input',
    type: 'number',
    classList: ['input', 'input-bordered', 'w-full'],
    value: () => state.$count,
    on: {
      change: ({ target }) => {
        state.count = parseInt(target.value);
      },
    },
  }, {
    tag: 'button',
    classList: ['btn', 'btn-primary'],
    textContent: '+1',
    on: {
      click: () => state.count++,
    },
  }],
});

mount(el, '#app');
```

## Using with Web Components

You can use NEUX along with any [Web Components](https://developer.mozilla.org/docs/Web/API/Web_Components). Many component libraries can be [found here](https://open-wc.org/guides/community/component-libraries/).

Let's take an example of working with the [BlueprintUI](https://blueprintui.dev) library:

**1.** Install the required modules:

```sh
npm install --save-dev @blueprintui/components @blueprintui/themes @blueprintui/layout @blueprintui/typography
```

**2.** Import styles in the `src/style.css` file:

```css
@import '@blueprintui/layout/index.min.css';
@import '@blueprintui/typography/index.min.css';
@import '@blueprintui/themes/index.min.css';
```

**3.** Replace the contents of the `src/main.js` file with the example:

```js
import './style.css';
import '@blueprintui/components/include/button.js';
import '@blueprintui/components/include/card.js';
import '@blueprintui/components/include/input.js';
import { render, mount } from 'neux';

const el = render({
  tag: 'bp-card',
  children: [{
    tag: 'h2',
    slot: 'header',
    attributes: {
      'bg-text': 'section',
    },
    textContent: 'Heading',
  }, {
    tag: 'bp-field',
    children: [{
      tag: 'label',
      textContent: 'label',
    }, {
      tag: 'bp-input',
    }],
  }, {
    slot: 'footer',
    attributes: {
      'bp-layout': 'inline gap:xs inline:end',
    },
    children: [{
      tag: 'bp-button',
      attributes: {
        action: 'secondary',
      },
      textContent: 'Cancel',
    }, {
      tag: 'bp-button',
      attributes: {
        status: 'accent',
      },
      textContent: 'Confirm',
    }],
  }],
});

mount(el, document.body);
```

## Creating your own Web Component

You can create your own components using [one of the libraries](https://open-wc.org/guides/community/base-libraries/). However, you can also use NEUX to create your own Web Components.

Here is an example of a web component definition:

```js
import { signal, render, mount } from 'neux';

// Create a custom web component
class Counter extends HTMLElement {
  // List of attributes to observe for changes
  static observedAttributes = ['value'];
  // The component constructor override
  constructor() {
    super();
    const context = {};
    this.attrs = signal.call(context, {});
    this.attrs.$$on(
      this.constructor.observedAttributes,
      (newv, oldv, prop) => this.setAttribute(prop, newv),
    );
    const el = render.call(context, this.render());
    const shadowRoot = this.attachShadow({ mode: 'open' });
    mount(el, shadowRoot);
  }
  // Called when an observed attribute is changed
  attributeChangedCallback(name, oldv, newv) {
    this.attrs[name] = newv;
  }
  // Describe the object to render the component
  render() {
    return [{
      tag: 'input',
      type: 'number',
      value: () => this.attrs.$value,
      on: {
        change: (e) => {
          this.attrs.value = e.target.value;
        },
      },
    }, {
      children: [{
        tag: 'slot',
        name: 'label',
      }, {
        tag: 'span',
        textContent: () => this.attrs.$value,
      }]
    }];
  }
}
// Define custom element
customElements.define('ne-counter', Counter);
```

Use this web component:

```js
const el = render({
  tag: 'ne-counter',
  attributes: {
    value: 5,
  },
  children: [{
    tag: 'span',
    slot: 'label',
    textContent: 'Count: ',
  }],
});

mount(el, document.body);
```

## Code Example

This example shows how to write a simple app (To-Do List):

```js
// Create a reactive state
const state = signal({
  // Todo items
  list: [
    { text: 'Item 1' },
    { text: 'Item 2', checked: true },
    { text: 'Item 3' },
  ],
  // List of checked items
  filtered: (obj) => {
    return obj.list.$$.filter(item => !item.checked);
  },
});
// Create HTML elements
const el = render({
  children: [{
    tag: 'h1',
    textContent: 'To Do',
  }, {
    tag: 'input',
    placeholder: 'Enter your task...',
    autofocus: true,
    on: {
      keyup(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          state.list.push({ text: e.target.value });
          e.target.value = '';
        }
      },
    },
  }, {
    children: [{
      tag: 'input',
      type: 'checkbox',
      on: {
        change(e) {
          const checked = e.target.checked;
          state.list.forEach((item) => {
            item.checked = checked;
          });
        },
      },
    }, {
      tag: 'label',
      textContent: 'Mark all as complete',
    }],
  }, {
    tag: 'ul',
    children: () => {
      // Redraw the list partially if any child items are added, replaced, or removed.
      // Any updates inside nested objects are ignored.
      return state.list.$.map((item) => {
        return {
          tag: 'li',
          children: [{
            tag: 'input',
            type: 'checkbox',
            checked: () => item.$checked,
            on: {
              change(e) {
                item.checked = e.target.checked;
              },
            },
          }, {
            tag: 'label',
            style: {
              textDecoration: () => item.$checked ? 'line-through' : 'none',
            },
            textContent: () => item.$text,
          }, {
            tag: 'button',
            textContent: 'x',
            on: {
              click(e) {
                e.preventDefault();
                const index = state.list.indexOf(item);
                state.list.splice(index, 1);
              },
            },
          }],
        };
      });
    },
  }, {
    textContent: () => {
      return `Total items: ${state.$filtered.length} / ${state.list.$length}`;
    },
  }],
});
// Mount to the DOM
mount(el, document.body);
```

Try it in the playground:

- [To-Do App](https://v47.livecodes.io/?x=id/uhkch4mgxfp)
- [15 Puzzle](https://v47.livecodes.io/?x=id/efx9s47xqrr)
- [Tic-Tac-Toe](https://v47.livecodes.io/?x=id/r4cjbuidtb3)
- [SVG Clock](https://v47.livecodes.io/?x=id/mr5hs94hd5i)
- [Sketch](https://v47.livecodes.io/?x=id/q7tistivmkt)
- [File Tree](https://v47.livecodes.io/?x=id/wfcdxuaqbq9)

<p><iframe src="https://ghbtns.com/github-btn.html?user=meefik&repo=neux&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe></p>
