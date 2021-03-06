---
layout: post
title: Выравнивание изображений лиц на JavaScript
date: 2017-10-01 21:00:00 +0300
categories: [javascript]
comments: true
---

В задачах автоматической обработки изображений лиц часто встает вопрос о нахождении и нормализации (выравнивании) изображения лица на фотографии или в видеопотоке. Выравнивание обычно включает в себя поворот, масштабирование и обрезку интересующей части фотографии. В сети можно найти примеры для реализации данной функции на Python или C/C++ с помощью библиотеки компьютерного зрения OpenCV. Здесь я приведу два примера реализации данной функции на JavaScript для NodeJS и для запуска в браузере на чистом JS.

<!--more-->

### Поиск лиц на изображении

Для работы с изображениями на NodeJS используется модуль [node-opencv](https://github.com/peterbraden/node-opencv), основанный на библиотеке компьютерного зрения OpenCV. Для поиска лиц на изображении используется [метод Виолы-Джонса](https://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4_%D0%92%D0%B8%D0%BE%D0%BB%D1%8B_%E2%80%94_%D0%94%D0%B6%D0%BE%D0%BD%D1%81%D0%B0) и его реализация в OpenCV.

Для реализации метода Виолы-Джонса в браузере используется часть кода из библиотеки [tracking.js](https://github.com/eduardolundgren/tracking.js/).

### Выравнивание лица

Для выравнивания изображения лица используется информация о центрах глаз. Глаза на изображении находятся тем же методом, что и лицо, но используя другой классификатор. Уточняются примерные области поиска для каждого глаза, затем запускается поиск глаз. Центр глаза вычисляется как центр масс прямоугольников, которые находит метод Виолы-Джонса для каждого глаза. Затем определяется расстояние между центрами и угол наклона головы, после чего выполняется поворот, масштабирование и обрезка лица. На выходе получается выравненная фотография лица.

### Запуск на сервере

Исходный код выложен здесь [face-alignment](https://github.com/meefik/face-alignment). Для запуска на компьютере Debian/Ubuntu нужно выполнить следующее:
```sh
sudo apt install nodejs libopencv-dev
git clone https://github.com/meefik/face-alignment
cd face-alignment
npm install
```

Запуск из командной строки выполняется так:
```sh
node detect.js input.png face.png out.png
```
Здесь файл face.png содержит только лицо, а out.png - исходное изображение с пометками.

### Запуск в браузере

Веб-сервер запускается следующей командой:
```sh
npm start
```

После чего в браузере достаточно открыть адрес [http://localhost:3000](http://localhost:3000).

<iframe width="560" height="315" src="https://www.youtube.com/embed/UtkOd42F5-E" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

