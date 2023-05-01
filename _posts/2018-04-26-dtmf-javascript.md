---
layout: post
title: DTMF generation and recognition in JavaScript
date: 2018-04-26 12:00:00 +0000
categories: [javascript]
comments: true
---

Когда появляется задача передать некоторый код по аудио, то классическим решением являются DTMF коды. DTMF - это двухтональный многочастотный сигнал, используемый для набора телефонного номера. Однако реальное применение данной технологии гораздо шире.

Формат сигнала представляет собой сумму двух синусоидальных сигналов определенных частот. Символы DTMF кодируются следующими частотами:

|        | 1209 Гц | 1336 Гц | 1477 Гц | 1633 Гц |
|--------|---------|---------|---------|---------|
| 697 Гц | 1       | 2       | 3       | A       |
| 770 Гц | 4       | 5       | 6       | B       |
| 852 Гц | 7       | 8       | 9       | C       |
| 941 Гц | *       | 0       | #       | D       |

Есть множество примеров реализации DTMF, один из наиболее известных алгоритмов детекции DTMF является [алгоритм Герцеля](https://en.wikipedia.org/wiki/Goertzel_algorithm). Есть даже его [реализация на JavaScript](https://github.com/Ravenstine/goertzeljs).

Распознавание кода происходит по частотной характеристики, а по временной характеристике можно реализовать фильтрацию от шумов.

<!--more-->

### JS-библиотека для работы с DTMF

Моя версия библитеки [DTMF.js](https://github.com/meefik/dtmf.js) достаточно проста и использует [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) как для генерации сигнала, так и для его распознавания в браузере. Аудио захватывается с микрофона функцией getUserMedia.

Пример получения и распознавания DTMF кодов:

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

А вот пример генерации и воспроизведения DTMF кодов:

```js
var sender = new DTMF.Sender();
sender.play('1234567890ABCD#*');
```

И небольшая демонстрация:

<iframe width="560" height="315" src="https://www.youtube.com/embed/OS6yIiq_Cp8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

