---
layout: post
title: Детекция лиц с инвариантностью к повороту
date: 2018-08-27 16:00:00 +0300
categories: [javascript]
comments: true
---

Не так давно наткнулся на публикацию [Object Detection with Pixel Intensity Comparisons Organized in Decision Trees](https://arxiv.org/abs/1305.4537), авторы которой предлагают модификацию метода детекции лиц [Виолы-Джонса](https://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework). Основное отличие метода состоит в том, что вместо [признаков Хаара](https://en.wikipedia.org/wiki/Haar-like_feature) используются простые пиксельные тесты без необходимости рассчитывать [интегральное изображение](https://en.wikipedia.org/wiki/Summed-area_table). Это позволяет повысить скорость вычислений и сэкономить память.

Авторы статьи приводят [пример реализации](https://github.com/nenadmarkus/pico) данного алгоритма на C с предобученным классификатором для детекции лиц. Недавно появилась реализация алгоритма [PICO на JS](https://github.com/tehnokv/picojs), однако в ней нет реализации инвариантности к повороту изображения (или наклона головы влево/вправо). Эту недоработку я и решил исправить.

Для реализации инвариантности к повороту требуется несколько раз запустить алгоритм для повернутого на несколько разных углов изображения. Но так как алгоритм работает с пикселями, а не интегральным изображением, то можно не выполнять ресурсоемкую операцию поворота изображения, а просто читать нужные пиксели, используя [матрицу поворота](https://en.wikipedia.org/wiki/Rotation_matrix).

В доработку вошло:
- реализация инвариантности к повороту;
- переобученный классификатор лиц;
- более производительный метод для преобразования RGBA изображения в оттенки сергого (grayscale);
- параллельное выполнение в Web-воркере;
- код на ES6.

<!--more-->

Код JS-библиотеки: [https://github.com/meefik/pico.js](https://github.com/meefik/pico.js)

### Использование JS-библиотеки

Все параметры библиотеки задаются в конструкторе, вот их описание:

| Параметр    | По умолчанию | Описание                                                                              |
|-------------|--------------|---------------------------------------------------------------------------------------|
| shiftfactor | 0.1          | Шаг перемешения скользящего окна в процентах (10%) от размера изображения             |
| scalefactor | 1.1          | Шаг изменения размера скользящего окна в процентах (10%) от размера изображения       |
| initialsize | 0.1          | Начальный размер скользящего окна в процентах (10%) от размера изображения            |
| rotation    | 0            | Массив углов вращения для которых будет выполнен поиск (от 0 до 360 с шагом 1 градус) |
| threshold   | 0.2          | Процент (20%) пересечения найденных кандидатов для группировки их в одну область      |
| memory      | 1            | Число изображений (кадров) в памяти для повышения качества поиска                     |

На выходе получается массив областей, где, как алгоритм предполагает, находятся лица. Вот описание такой области:

| Свойство    | Описание                                                                             |
|-------------|--------------------------------------------------------------------------------------|
| c           | X-коортината центра найденной области лица                                           |
| r           | Y-коортината центра найденной области лица                                           |
| s           | Размер найденной области (ширина и высота или диаметр)                               |
| q           | Качество обнаружения (чем больше, тем лучше качество)                                |
| a           | Угол поворота изображения (наиболее вероятный из перечисленных в параметре rotation) |

Пример кода:

```js
// load cascade
fetch('./cascade.dat')
  .then(function(response) {
    if (!response.ok) throw new Error(response.statusText || 'Request error');
    return response.arrayBuffer();
  })
  .then(function(cascade) {
    // create PICO detector with options
    return PICO(cascade, {
      shiftfactor: 0.1, // move the detection window by 10% of its size
      scalefactor: 1.1, // resize the detection window by 10% when moving to the higher scale
      initialsize: 0.1, // minimum size of a face (10% of image area)
      rotation: [0, 30, 60, 90, 270, 300, 330], // rotation angles in degrees
      threshold: 0.2, // overlap threshold
      memory: 3 // number of images in the memory
    });
  })
  .then(function(detect) {
    // image = ImageData
    return detect(image);
  })
  .then(function(dets) {
    // dets = [{ r: rows, c: cols, s: size, q: quality, a: angle }]
    console.log(dets);
  });
```

Запуск демонстрации:
```
npm install
npm start
```
После запуска сервера демонстрационная страница будет доступна по адресу [http://localhost:8080](http://localhost:8080)

И небольшое видео:

<iframe width="560" height="315" src="https://www.youtube.com/embed/9WiGC08_ZFY" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

