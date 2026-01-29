---
layout: post
title: Serverless WebRTC conferencing with E2E encryption
description: Building a peer-to-peer WebRTC conferencing system with NATS for signaling and end-to-end encryption using the P2P library.
image: /assets/images/p2p-demo.png
date: 2025-10-05 18:00:00 +0000
categories: [webrtc, javascript]
comments: true
---

Building reliable, privacy-respecting peer-to-peer conferencing can be surprisingly simple when you split responsibilities cleanly: media transport (WebRTC) and signaling (a tiny transport for exchanging SDP and ICE). I built [a minimal library](https://github.com/meefik/p2p) to demonstrate that split and to enable serverless workflows using whatever signaling channel you prefer — from in-memory drivers for demos to NATS-based pub/sub for distributed apps.

This post describes the library's purpose, core design, how to use it, and a practical example of a [NATS](https://nats.io) signaling driver with end-to-end encryption using the browser [Web Crypto API](https://developer.mozilla.org/docs/Web/API/Web_Crypto_API).

![demo](/assets/images/p2p-demo.png "Peer-to-Peer Video Conference")

Just try it out: [live demo](https://talk.meefik.dev/) \| [source code](https://github.com/meefik/p2p)

<!--more-->

## Why this library

The library focuses on three goals:

- Minimal surface area: two primitives (Sender and Receiver) that cover the common conferencing pattern: one broadcaster, many receivers.
- Signaling-agnostic: you provide a small driver implementing on/off/emit and the library works with any transport.
- Practical privacy: support optional E2E encryption at the signaling layer so session offers/answers and candidates are not exposed in plaintext on the bus.

## Design overview

At its core, p2p is small:

- Sender: creates outgoing RTCPeerConnections, publishes a local MediaStream and optional per-peer RTCDataChannels, and emits offers to receivers.
- Receiver: listens for offers, answers them, and surfaces remote streams and incoming data messages to the application.

Signaling expectations are intentionally simple: drivers produce messages scoped to namespaces (arrays/keys). The library uses namespaces such as ["sender", room], ["receiver", room, id], etc. Messages include typed payloads (invoke, offer, answer, candidate, sync, dispose).

## Quick start

**1.** Install the library:

```sh
npm install p2p
```

**2.** Implement a signaling driver that supports on/off/emit.

Here's a minimal conceptual example:

```javascript
class MyDriver {
  on(namespace, handler) { /* ... */ }
  off(namespace, handler) { /* ... */ }
  emit(namespace, message) { /* ... */ }
}
```

Instantiate your driver:

```javascript
const driver = new MyDriver();
```

**3.** Start a Receiver in the same room to discover and receive streams.

Instantiate Receiver with the same driver:

```javascript
const receiver = new Receiver({ driver });
receiver.addEventListener('stream', (e) => {
  const { id, stream } = e.detail;
  // handle incoming MediaStream
});
receiver.addEventListener('connect', (e) => {
  const { id } = e.detail;
  // handle peer connection established
});
receiver.addEventListener('dispose', (e) => {
  const { id } = e.detail;
  // handle peer disconnection
});
```

Start the receiver in the same room:

```javascript
receiver.start({ room: 'demo-room' });
```

**4.** Create and start a Sender to broadcast local media.

Instantiate Sender with your driver and options:

```javascript
const sender = new Sender({ driver });
```

Start the sender with the stream and a room name:

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});
sender.start({ stream, room: 'demo-room' });
```

## NATS as a signaling transport with E2E encryption

[NATS](https://nats.io) is a great lightweight pub/sub for distributed signaling. The demo repository includes a full driver implementation at [demo/driver/nats.js](https://github.com/meefik/p2p/blob/main/demo/driver/nats.js); below is the compact approach and key ideas used there.

Here's a simple driver implementation using the [nats.ws](https://npmjs.com/package/nats.ws) module:

```javascript
import { connect, StringCodec } from 'nats.ws';

const sc = StringCodec();

class NatsDriver extends Map {
  constructor({ servers } = {}) {
    super();
    this.servers = servers || ['wss://demo.nats.io:8443'];
  }

  async open() {
    this.nc = await connect({ servers: this.servers, noEcho: true });
  }

  async close() {
    await this.nc.drain();
  }

  on(namespace, handler) {
    const ns = namespace.join(':');
    const sub = this.nc.subscribe(ns, {
      callback: async (err, msg) => {
        if (err) return console.error(err);
        const payload = JSON.parse(sc.decode(msg.data));
        handler(payload);
      },
    });
    if (!this.has(ns)) {
      this.set(ns, new Map());
    }
    this.get(ns).set(handler, sub);
  }

  off(namespace, handler) {
    const ns = namespace.join(':');
    const sub = this.get(ns)?.get(handler);
    if (sub) {
      sub.unsubscribe();
      this.get(ns).delete(handler);
    }
    if (!this.get(ns)?.size) {
      this.delete(ns);
    }
  }

  async emit(namespace, message) {
    const ns = namespace.join(':');
    if (this.nc) {
      const data = sc.encode(JSON.stringify(message));
      this.nc.publish(ns, data);
    }
  }
}
```

If you want the signaling payloads to be encrypted end-to-end (so the NATS server only sees opaque blobs), you can apply symmetric encryption on top of the driver.

High-level strategy:
- Derive an AES-GCM key from a shared passphrase (or pre-shared secret) using SHA-256.
- For every outbound message: encode JSON → encrypt with AES-GCM (random IV) → publish binary payload.
- For inbound messages: decrypt using AES-GCM with the same key → parse JSON → deliver to handler.
- Keep namespaces and message types unchanged; only payload bytes are encrypted.

Here's a compact encryption helper (browser) using [Web Crypto API](https://developer.mozilla.org/docs/Web/API/Web_Crypto_API).

Derive AES-GCM CryptoKey from passphrase via SHA-256:

```javascript
async function createEncryptionKey(secret) {
  const secretHash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(secret),
  );
  return await crypto.subtle.importKey(
    'raw',
    secretHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt'],
  );
}
```

Prepend a 12-byte IV + ciphertext:

```javascript
async function encrypt(payload, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, payload),
  );
  const data = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  data.set(iv, 0);
  data.set(ciphertext, iv.byteLength);
  return data;
}
```

Extract IV and decrypt:

```javascript
async function decrypt(data, cryptoKey) {
  const iv = data.slice(0, 12);
  const ct = data.slice(12);
  const payload = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
  return payload;
}
```

Example usage (conceptual snippet):

```javascript
// Create a key from a human passphrase
const key = await createEncryptionKey('room-secret-passphrase');

// Encrypt message (payload is Uint8Array)
const payload = new TextEncoder().encode('Secret message');
const data = await encrypt(payload, key);

// returns Uint8Array with IV+ciphertext
console.log('encrypted data', data);

// Decrypt message
const decryptedBytes = await decrypt(data, key);
const message = new TextDecoder().decode(decryptedBytes);

// returns original message
console.log('decrypted message', message);
```

Integrate encryption into the NATS driver by wrapping emit/on methods to encrypt/decrypt payloads. Here is diff of the modified methods:

```diff
-  async open() {
+  async open(secret) {
     this.nc = await connect({ servers: this.servers, noEcho: true });
+    if (secret) {
+      this.cryptoKey = await createEncryptionKey(secret);
+    }
   }
 
   async close() {
     const sub = this.nc.subscribe(ns, {
       callback: async (err, msg) => {
         if (err) return console.error(err);
-        const payload = JSON.parse(sc.decode(msg.data));
+        let data = msg.data;
+        if (this.cryptoKey) {
+          data = await decrypt(data, this.cryptoKey);
+        }
+        const payload = JSON.parse(sc.decode(data));
         handler(payload);
       },
     });
    if (!this.has(ns)) {
      this.set(ns, new Map());
    }
    this.get(ns).set(handler, sub);
  }

   async emit(namespace, message) {
     const ns = namespace.join(':');
     if (this.nc) {
-      const data = sc.encode(JSON.stringify(message));
+      let data = sc.encode(JSON.stringify(message));
+      if (this.cryptoKey) {
+        data = await encrypt(data, this.cryptoKey);
+      }
       this.nc.publish(ns, data);
     }
   }
```

Operational considerations:

- If you run NATS in production, use authentication/authorization and TLS.
- For real-world NAT traversal include TURN servers in iceServers.
- For larger conferences, consider SFU architecture rather than pure p2p (p2p scales poorly with N participants).
- The encrypted signaling only protects SDP and candidates; media still flows directly between peers (or via TURN) and should be protected by SRTP (it's part of WebRTC).

## Conclusion

This project shows how a small, well-factored library can enable flexible, serverless peer-to-peer conferencing while giving you control over signaling and privacy. The NATS driver with E2E encryption is a practical option for distributed systems where you want to keep signaling private without a heavy backend.

See the [live demo](https://meefik.dev/p2p/) for runnable examples and the full NATS driver implementation: [demo/driver/nats.js](https://github.com/meefik/p2p/blob/main/demo/driver/nats.js).
