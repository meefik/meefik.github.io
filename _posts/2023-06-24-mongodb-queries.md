---
layout: post
title: Human-readable MongoDB query syntax
description: A simple query syntax and parser to convert human-readable queries into MongoDB query syntax.
date: 2023-06-24 12:00:00 +0000
categories: [javascript, mongodb]
comments: true
---

Sometimes you need to give your application user a more flexible way to search the database. The search should be universal for any data and easy to understand for a person without technical knowledge.

I was able to create a simple query syntax and a parser to convert them to MongoDB query syntax. Below is a description of the query syntax and the parser code for them.

<!--more-->

## Query syntax

The query is a string that uses special characters. These symbols are similar in appearance and meaning to mathematical operations. This includes comparison operations, logical operations, grouping the order of operations.

Below is a table describing operators and use cases.

| Operator | Description                                 | Use case                                 |
|----------|---------------------------------------------|------------------------------------------|
| `>`      | Greater                                     | `field > 2021-12-01`                     |
| `<`      | Less                                        | `field < 5`                              |
| `>=`     | Greater or equal                            | `field >= 10`                            |
| `<=`     | Lessor equal                                | `field <= 50`                            |
| `=`      | Equal                                       | `field = "text"`                         |
| `!=`     | Not equal                                   | `field != "text"`                        |
| `~`      | Matches regular expression                  | `field ~ ^text\d+$`                      |
| `~*`     | Matches regular expression case insensitive | `field ~* ^TeXt`                         |
| `&`      | Logical AND                                 | `field > 0 & field < 10`                 |
| `|`      | Logical OR                                  | `field > 0 | field < 10`                 |
| `()`     | Expression grouping                         | `(field > 0 & field < 10) | field > 100` |
| `[]`     | One of many                                 | `field = ['one', 'two', 'three']`        |

Note:

- The field names are passed as is.
- If you need to refer to a nested field, then you should use a dot (e.g. `field.nested`).
- Dates are written in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format in UTC.
- Text must be enclosed in double or single quotes.
- You cannot use quotes unless the text contains spaces or special characters.
- Empty quotes denote an empty string or `null`.
- Numbers are automatically converted to `Number`.
- Dates are automatically converted to `Date`.

## Operating example

Take the following query as an example:

`a.x1 > 2021-12-01 & ( b >= "5" | (c > 0 & d ~ 'a + b & c = 0' & f <= -1 | a ~* "hello" )) & e != 10 | g = [1,2,"z"] & n = ""`

Such this parser converts into the MongoDB query of the following form:

```json
{"$or":[
  {"$and":[
    {"a.x1":{"$gt": "2021-12-01T00:00:00.000Z"}},
    {"$or":[
      {"b":{"$gte":"5"}},
      {"$or":[
        {"$and":[
          {"c":{"$gt":0}},
          {"d":{"$regex":"a + b & c = 0"}},
          {"f":{"$lte":-1}}
        ]},
        {"a":{"$regex":"hello","$options":"i"}}
      ]}
    ]},
    {"e":{"$ne":10}}
  ]},
  {"$and":[
    {"g":{"$in":[1,2,"z"]}},
    {"n":{"$in":["",null]}}
  ]}
]}
```

## Parser implementation

Below is the implementation of the query parser.

```js
const patterns = [
  /('[^']*')/,
  /("[^"]*")/,
  /\(([^()]+)\)/,
  /([^&|]+>=[^&|]+)/,
  /([^&|]+>[^&|]+)/,
  /([^&|]+<=[^&|]+)/,
  /([^&|]+<[^&|]+)/,
  /([^&|]+!=[^&|]+)/,
  /([^&|]+=[^&|]+)/,
  /([^&|]+~\*[^&|]+)/,
  /([^&|]+~[^&|]+)/,
  /([^|]*[&][^|]*)/,
];

function parse(str, params = {}, opts = {}) {
  if (!opts.c) {
    opts.c = 0;
  }
  if (!opts.p) {
    do {
      opts.p = Math.random().toString(16).slice(2);
    } while (str.indexOf(opts.p) > -1);
  }
  for (let i = 0; i < patterns.length; i++) {
    const re = patterns[i];
    while (true) {
      const r = str.match(re);
      if (!r) break;
      const k = `x${++opts.c}_${opts.p}`;
      str = str.replace(r[0], k);
      const param = r[0] !== r[1] ? parse(r[1], params, opts) : r[1];
      params[k] = i < 2 ? param : param.replace(/\s/g, '');
    }
  }
  return str;
}

function compile(str, params = {}) {
  const val = params[str] || str;
  switch (true) {
    case /^null$/.test(val): {
      return null;
    }
    case /^'[^']*'$/.test(val): {
      const r = val.split(/^'([^']*)'$/);
      const value = r[1] || '';
      return value;
    }
    case /^"[^"]*"$/.test(val): {
      const r = val.split(/^"([^"]*)"$/);
      const value = r[1] || '';
      return value;
    }
    case /^\[[^[\]]*\]$/.test(val): {
      const arr = [];
      if (val === '[]') {
        return arr;
      }
      const r = val.slice(1, -1).split(/\s*,\s*/);
      for (let i = 0; i < r.length; i++) {
        const value = compile(r[i], params);
        arr.push(value);
      }
      return arr;
    }
    case />=/.test(val): {
      const r = val.split(/\s*>=\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $gte: value } };
    }
    case />/.test(val): {
      const r = val.split(/\s*>\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $gt: value } };
    }
    case /<=/.test(val): {
      const r = val.split(/\s*<=\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $lte: value } };
    }
    case /</.test(val): {
      const r = val.split(/\s*<\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $lt: value } };
    }
    case /!==/.test(val): {
      const r = val.split(/\s*!==\s*/);
      const field = compile(r[0], params);
      let value = compile(r[1], params);
      return { [field]: { $ne: value } };
    }
    case /!=/.test(val): {
      const r = val.split(/\s*!=\s*/);
      const field = compile(r[0], params);
      let value = compile(r[1], params);
      return {
        [field]: Array.isArray(value) && value.length > 0
          ? { $nin: value }
          : { $ne: value },
      };
    }
    case /==/.test(val): {
      const r = val.split(/\s*==\s*/);
      const field = compile(r[0], params);
      let value = compile(r[1], params);
      return { [field]: value };
    }
    case /=/.test(val): {
      const r = val.split(/\s*=\s*/);
      const field = compile(r[0], params);
      let value = compile(r[1], params);
      return {
        [field]: Array.isArray(value) && value.length > 0
          ? { $in: value }
          : value,
      };
    }
    case /~\*/.test(val): {
      const r = val.split(/\s*~\*\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $regex: value, $options: 'i' } };
    }
    case /~/.test(val): {
      const r = val.split(/\s*~\s*/);
      const field = compile(r[0], params);
      const value = compile(r[1], params);
      return { [field]: { $regex: value } };
    }
    case /&/.test(val): {
      const arr = [];
      const r = val.split(/\s*&\s*/);
      for (let i = 0; i < r.length; i++) {
        const value = compile(r[i], params);
        if (typeof value === 'object' && value !== null) {
          arr.push(value);
        }
      }
      return { $and: arr };
    }
    case /\|/.test(val): {
      const arr = [];
      const r = val.split(/\s*\|\s*/);
      for (let i = 0; i < r.length; i++) {
        const value = compile(r[i], params);
        if (typeof value === 'object' && value !== null) {
          arr.push(value);
        }
      }
      return { $or: arr };
    }
    default: {
      let value = val;
      while (params[value]) {
        value = compile(params[value], params);
      }
      if (!isNaN(value)) return Number(value);
      const date = Date.parse(value);
      if (!isNaN(date)) return new Date(date);
      return value || null;
    }
  }
}

function convert (query) {
  const params = {};
  const p = parse(query, params);
  return compile(p, params);
}
```

Usage example:

```js
const query = convert('x > 10');
console.log(query);
// {"x":{"$gt":10}}
```

You can use this as the [humanquery-mongo](https://www.npmjs.com/package/humanquery-mongo) NPM module or find [the source code on GitHub](https://github.com/meefik/humanquery-mongo).
