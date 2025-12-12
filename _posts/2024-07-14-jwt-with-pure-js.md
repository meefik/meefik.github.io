---
layout: post
title: Create and verify JWT with pure JavaScript
description: Implementing JSON Web Token (JWT) creation and verification using pure JavaScript and the Web Crypto API.
date: 2024-07-14 12:00:00 +0000
categories: [javascript, jwt]
comments: true
---

[JSON Web Token](https://jwt.io) (JWT) is a popular standard for securely transmitting information between parties as a JSON object. They are commonly used for authentication and information exchange. While many libraries exist to handle JWTs, sometimes you might need or want to implement the core logic yourself using pure JavaScript, especially in environments like web workers or edge functions where dependencies might be limited.

This post demonstrates how to create and verify JWTs using the [Web Crypto API](https://developer.mozilla.org/docs/Web/API/Web_Crypto_API) available in modern browsers and Node.js (v15+). We'll focus on the HS256 algorithm (HMAC with SHA-256).

<!--more-->

A JWT consists of three parts separated by dots (.):

1. **Header**: Contains metadata about the token, like the signing algorithm (alg) and token type (typ).
2. **Payload**: Contains the claims (the actual data), such as user ID, name, roles, etc.
3. **Signature**: Used to verify the sender of the JWT and ensure that the message wasn't changed along the way.

All parts are Base64Url encoded.

First, we need functions to encode/decode Base64Url and to handle HMAC signatures using the Web Crypto API:

```js
// Base64Url Encoding/Decoding
function encodeBase64Url(source) {
  // Encode ArrayBuffer to Base64 string
  // Then convert Base64 to Base64Url
  return btoa(String.fromCharCode.apply(null, source))
    .replace(/=+$/, '') // Remove padding '='
    .replace(/\+/g, '-') // Replace '+' with '-'
    .replace(/\//g, '_'); // Replace '/' with '_'
}

function decodeBase64Url(source) {
  // Convert Base64Url back to Base64
  source = source.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make it valid Base64
  source += '='.repeat((4 - source.length % 4) % 4);
  // Decode Base64 string to original string
  return atob(source);
}

// HMAC Signature Generation
async function createHmacSignature(key, message) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  // Import the secret key for signing
  const cryptoKey = await crypto.subtle.importKey(
    'raw', // key format
    keyData, // key material
    { name: 'HMAC', hash: 'SHA-256' }, // algorithm details
    false, // non-exportable
    ['sign'] // key usages
  );
  // Sign the message
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return new Uint8Array(signature); // Return signature as Uint8Array
}

// HMAC Signature Verification
async function verifyHmacSignature(key, message, signature) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(message);
  // Decode Base64Url signature to Uint8Array
  const signatureData = Uint8Array.from(decodeBase64Url(signature), c => c.charCodeAt(0));
  // Import the secret key for verification
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'] // key usage
  );
  // Verify the signature
  return crypto.subtle.verify('HMAC', cryptoKey, signatureData, messageData);
}
```

Now, let's combine these to create and verify JWT:

```js
async function createJWT(payload, secret) {
  // Define the header
  const header = { alg: 'HS256', typ: 'JWT' };
  // Encode header and payload
  const encodedHeader = encodeBase64Url(new TextEncoder().encode(JSON.stringify(header)));
  const encodedPayload = encodeBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  // Create the data to sign (header + '.' + payload)
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  // Create the signature
  const signature = await createHmacSignature(secret, dataToSign);
  // Encode the signature
  const encodedSignature = encodeBase64Url(signature);
  // Combine all parts into the JWT
  return `${dataToSign}.${encodedSignature}`;
}

async function verifyJWT(token, secret) {
  // Split the token into its parts
  const [header, payload, signature] = token.split('.');
  if (!header || !payload || !signature) {
    throw new Error('Invalid JWT format');
  }

  // Decode and parse the header
  const decodedHeader = JSON.parse(decodeBase64Url(header));
  // Basic header validation
  if (decodedHeader?.alg !== 'HS256' || decodedHeader?.typ !== 'JWT') {
    throw new Error('Invalid JWT header');
  }

  // Prepare the data that was originally signed
  const dataToVerify = `${header}.${payload}`;
  // Verify the signature
  const isValid = await verifyHmacSignature(secret, dataToVerify, signature);
  if (!isValid) {
    throw new Error('Invalid signature');
  }

  // Check if the payload has expired
  const decodedPayload = JSON.parse(decodeBase64Url(payload));
  if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
    throw new Error('Token has expired');
  }

  // If signature is valid, return the decoded payload
  return decodedPayload;
}
```

That's it. Now we can use it, see the example:

```js
(async () => {
  // Define the secret key used for both signing and verification
  const secret = 'your-256-bit-secret';
  
  // Define a payload with user information. This data will be embedded in the JWT.
  const payload = { exp: ~~(Date.now() / 1000) + 60, name: 'John Doe' };

  // Create a JWT using the payload and the secret key
  const token = await createJWT(payload, secret);
  
  // Log the generated JWT to the console
  console.log('Generated JWT:', token);
  
  try {
    // Verify the JWT using the same secret key to ensure its validity
    const decodedPayload = await verifyJWT(token, secret);
    
    // Log the decoded payload if the verification succeeds
    console.log('Decoded payload:', decodedPayload);
  } catch(err) {
    // Log an error message if verification fails
    console.error('Verification failed:', err);
  }
})();
```

While libraries abstract away much of this complexity, understanding the underlying mechanics of JWT creation and verification using standard browser APIs can be valuable.
