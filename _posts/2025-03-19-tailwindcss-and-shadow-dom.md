---
layout: post
title: Tailwind CSS v4 and the Shadow DOM
description: Workarounds for using Tailwind CSS v4 with Shadow DOM components due to lack of @property support.
date: 2025-03-19 10:00:00 +0000
categories: [tailwindcss]
comments: true
---

Tailwind CSS v4 was recently released, and with it came a problem when using the Shadow DOM. You can find the issue here: [tailwindlabs/tailwindcss#15005](https://github.com/tailwindlabs/tailwindcss/issues/15005).

Tailwind v4 uses `@property` to define defaults for custom properties. Currently, shadow roots do not support `@property`. Although it was explicitly disallowed in the spec, there is ongoing discussion about adding support: [w3c/css-houdini-drafts#1085](https://github.com/w3c/css-houdini-drafts/pull/1085).

It is unknown if the developers will fix this issue. In this post, we will consider workarounds to address it.

<!--more-->

## Workaround 1: Global @property Declarations with Vite

One straightforward approach is to declare your `@property` rules in the main document scope, effectively making them available globally. While this approach offers less encapsulation, it works because custom properties inherit down the DOM tree by default.

Tailwind doesn't currently offer a built-in way to extract just the `@property` definitions. However, if you're using Vite, you can implement a simple build-time transformation to achieve this. This solution is described [here](https://github.com/tailwindlabs/tailwindcss/issues/15005).

## Workaround 2: Programmatic Property Application

Alternatively, you can dynamically apply the custom property values directly within your component's Shadow DOM for more explicit control within the encapsulated scope.

You can use this code to add Tailwind properties to global style sheets:

```js
import styles from './styles.css?inline';

const shadowSheet = new CSSStyleSheet();
shadowSheet.replaceSync(styles.replace(/:root/ug, ':host'));

const globalSheet = new CSSStyleSheet();
for (const rule of shadowSheet.cssRules) {
  if (rule instanceof CSSPropertyRule) {
    globalSheet.insertRule(rule.cssText);
  }
}

document.adoptedStyleSheets.push(globalSheet);

export class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [shadowSheet];
    // ...
  }
}
```

Or you can replace `@property` with variables like this:

```js
import styles from './styles.css?inline';

const shadowSheet = new CSSStyleSheet();
shadowSheet.replaceSync(styles.replace(/:root/ug, ':host'));

const properties = [];
for (const rule of shadowSheet.cssRules) {
  if (rule instanceof CSSPropertyRule) {
    if (rule.initialValue) {
      properties.push(`${rule.name}: ${rule.initialValue}`);
    }
  }
}
shadowSheet.insertRule(`:host { ${properties.join('; ')} }`);

export class MyComponent extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.adoptedStyleSheets = [shadowSheet];
    // ...
  }
}
```
