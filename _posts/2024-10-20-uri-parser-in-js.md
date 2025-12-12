---
layout: post
title: URI parser in JavaScript
description: A lightweight JavaScript URI parser that breaks down connection strings into their components.
date: 2024-10-20 12:00:00 +0000
categories: [javascript]
comments: true
---

In this post, I show a lightweight JavaScript approach to parse a connection string URI like MongoDB connection string. The code breaks down the URI into its components, including the scheme, credentials, hosts, endpoint, and options.

Input:

```
mongodb://user:pass@host1:27017,host2:27017/db?option1=value1&option2=value2
```

Output:

```json
{
  "scheme": "mongodb",
  "username": "user",
  "password": "pass",
  "hosts": [ { "host": "host1", "port": 27017 }, { "host": "host2", "port": 27017 } ],
  "endpoint": "db",
  "options": { "option1": "value1", "option2": "value2" }
}
```

I like to use simple and useful own code instead of using external models. So I prepared the URI parser code on pure JavaScript, here it is.

<!--more-->

So here is the source code:

```js
/**
 * Parses URI address.
 *
 * @param {string} addresses The address(es) to process.
 * @returns {Array<Object>} Parsed addresses.
 */
function parseAddress(addresses) {
  return addresses.split(',').map((address) => {
    const i = address.indexOf(':');
    return i >= 0
      ? {
          host: decodeURIComponent(address.substring(0, i)),
          port: +address.substring(i + 1),
        }
      : { host: decodeURIComponent(address) };
  });
}

/**
 * Parses URI options.
 *
 * @param {string} options The options to process.
 * @returns {Object} Parsed options.
 */
function parseOptions(options) {
  const result = {};
  options.split('&').forEach((option) => {
    const i = option.indexOf('=');
    if (i >= 0) {
      result[decodeURIComponent(option.substring(0, i))] = decodeURIComponent(option.substring(i + 1));
    }
  });
  return result;
}

/**
 * Takes a connection string URI of form:
 *
 *   scheme://[username[:password]@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[endpoint]][?options]
 *
 * and returns an object of form:
 *
 *   {
 *     scheme: string,
 *     username?: string,
 *     password?: string,
 *     hosts: [ { host: string, port?: number }, ... ],
 *     endpoint?: string,
 *     options?: object
 *   }
 *
 * @param {string} uri The connection string URI.
 * @returns {Object} Parsed URI object.
 */
function parseURI(uri) {
  if (!uri) return;
  const connectionStringParser = new RegExp(
    '^\\s*' +                  // Optional whitespace at the beginning
    '([^:]+)://' +             // Scheme (Group 1)
    '(?:([^:@,/?&]+)(?::([^:@,/?&]+))?@)?' + // Username (Group 2) and Password (Group 3)
    '([^@/?&]+)' +             // Host address(es) (Group 4)
    '(?:/([^:@,/?&]+)?)?' +     // Endpoint (Group 5)
    '(?:\\?([^:@,/?]+)?)?' +    // Options (Group 6)
    '\\s*$',                   // Optional whitespace at the end
    'gi'
  );
  const connectionStringObject = {};
  const tokens = connectionStringParser.exec(uri);
  if (Array.isArray(tokens)) {
    connectionStringObject.scheme = tokens[1];
    connectionStringObject.username = tokens[2] ? decodeURIComponent(tokens[2]) : tokens[2];
    connectionStringObject.password = tokens[3] ? decodeURIComponent(tokens[3]) : tokens[3];
    connectionStringObject.hosts = parseAddress(tokens[4]);
    connectionStringObject.endpoint = tokens[5] ? decodeURIComponent(tokens[5]) : tokens[5];
    connectionStringObject.options = tokens[6] ? parseOptions(tokens[6]) : tokens[6];
  }
  return connectionStringObject;
}
```

Use the `parseURI()` function to parse URI string. Look at the code example: 

```js
// MongoDB connection string as example
const uri = 'mongodb://user:pass@host1:27017,host2:27017/db?option1=value1&option2=value2';
// parse this string
const params = parseURI(uri);
// show parsed parameters
console.log(params);
// {
//   scheme: 'mongodb',
//   username: 'user',
//   password: 'pass',
//   hosts: [ { host: 'host1', port: 27017 }, { host: 'host2', port: 27017 } ],
//   endpoint: 'db',
//   options: { option1: 'value1', option2: 'value2' }
// }
```

This simple yet powerful parser efficiently breaks down a URI connection string into usable components. It's especially useful when dealing with multiple hosts or various options in connection strings. Experiment with different URIs to see its in action.
