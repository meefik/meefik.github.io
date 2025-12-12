---
layout: post
title: DTMF generation and recognition in JavaScript
description: A simple JavaScript library for generating and recognizing DTMF tones using the Web Audio API.
image: /assets/images/dtmf-demo.png
date: 2018-04-26 12:00:00 +0000
categories: [javascript]
comments: true
---

When the task appears to transmit some code by audio, the classic solution is DTMF codes. DTMF is a two-tone multi-frequency signal used to dial a phone number. However, the actual application of this technology is much wider.

The signal format is the sum of two sinusoidal signals of certain frequencies. DTMF symbols are encoded by the following frequencies:

|        | 1209 Hz | 1336 Hz | 1477 Hz | 1633 Hz |
|--------|---------|---------|---------|---------|
| 697 Hz | 1       | 2       | 3       | A       |
| 770 Hz | 4       | 5       | 6       | B       |
| 852 Hz | 7       | 8       | 9       | C       |
| 941 Hz | \*      | 0       | #       | D       |

There are many examples of DTMF implementation, one of the most well-known DTMF detection algorithms is [Goertzel algorithm](https://en.wikipedia.org/wiki/Goertzel_algorithm). There is even its [JavaScript implementation](https://github.com/Ravenstine/goertzeljs).

Code recognition occurs by frequency response, and by time response, noise filtering can be implemented.

<!--more-->

### JS library for working with DTMF

My version of the library [DTMF.js](https://github.com/meefik/dtmf.js) is quite simple and uses the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) for both signal generation and recognition in the browser. Audio is captured from the microphone by the getUserMedia function.

Example of receiving and recognizing DTMF codes:

```js
var receiver = new DTMF.Receiver();
navigator.getUserMedia({ audio: true }, function(stream) {
  receiver.start(stream, function(code) {
    console.log(code);
  });
}, function(e) {
  console.error(e);
});
```

And here is an example of generating and reproducing DTMF codes:

```js
var sender = new DTMF.Sender();
sender.play('1234567890ABCD#*');
```

A small demonstration:

<iframe width="560" height="315" src="https://www.youtube.com/embed/OS6yIiq_Cp8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
