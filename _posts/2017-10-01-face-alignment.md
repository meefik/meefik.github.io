---
layout: post
title: Aligning face images in JavaScript
description: Implementing face detection and alignment in JavaScript for both NodeJS and browser environments using the Viola-Jones method.
date: 2017-10-01 12:00:00 +0000
categories: [javascript]
comments: true
---

In the tasks of automatic processing of images of faces, the question of finding and normalizing (aligning) the image of a face in a photo or video stream often arises. Alignment usually involves rotating, zooming, and cropping the part of the photo of interest. On the web, you can find examples for implementing this function in Python or C/C++ using the OpenCV computer vision library. Here I will give two examples of the implementation of this function in JavaScript for NodeJS and for running in a browser on pure JS.

<!--more-->

### Detecting faces in an image

To work with images on NodeJS, the [node-opencv](https://github.com/peterbraden/node-opencv) module is used, which is based on the OpenCV computer vision library. The [Viola-Jones method](https://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework) and its implementation in OpenCV are used to detect faces in the image.

To implement the Viola-Jones method, the browser uses part of the code from the [tracking.js](https://github.com/eduardolundgren/tracking.js/) library.

### Facial alignment

Information about eye centers is used to align the face image. The eyes in the image are the same method as the face, but using a different classifier. The approximate search areas for each eye are refined, then the eye search is started. The center of the eye is calculated as the center of mass of the rectangles that the Viola-Jones method finds for each eye. Then the distance between the centers and the angle of inclination of the head are determined, after which the face is rotated, scaled and trimmed. The output is an aligned photo of the face.

### Running on the server

The source code is available here: [face-alignment](https://github.com/meefik/face-alignment). To run Debian/Ubuntu on your computer, do the following:
```sh
sudo apt install nodejs libopencv-dev
git clone https://github.com/meefik/face-alignment
cd face-alignment
npm install
```

Running from the command line is performed as follows:
```sh
node detect.js input.png face.png out.png
```
Here, the `face.png` file contains only the face, and the `out.png` file contains the original image with labels.

### Launching in the browser

The web server starts with the following command:
```sh
npm start
```

After that you just need to access the address <http://localhost:3000> in your browser.

<iframe width="560" height="315" src="https://www.youtube.com/embed/UtkOd42F5-E" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
