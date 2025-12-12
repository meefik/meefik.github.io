---
layout: post
title: Face detection with rotation invariance
description: An improved JavaScript implementation of the PICO face detection algorithm with rotation invariance and performance enhancements.
image: /assets/images/pico-js.png
date: 2018-08-27 12:00:00 +0000
categories: [javascript]
comments: true
---

Not so long ago I came across the publication [Object Detection with Pixel Intensity Comparisons Organized in Decision Trees](https://arxiv.org/abs/1305.4537), the authors of which offer a modification of the [Viola-Jones](https://en.wikipedia.org/wiki/Viola%E2%80%93Jones_object_detection_framework). The main difference of the method is that instead of [Haar features](https://en.wikipedia.org/wiki/Haar-like_feature), simple pixel tests are used without the need to calculate [an integral image](https://en.wikipedia.org/wiki/Summed-area_table). This allows you to increase the speed of calculations and save memory.

The authors of the article give [an example of the implementation](https://github.com/nenadmarkus/pico) of this algorithm in C with a pre-trained classifier for face detection. Recently, an implementation of the [PICO algorithm in JS](https://github.com/tehnokv/picojs) has appeared, but it does not implement the invariance of turning the image (or tilting the head to the left/right). This is the shortcoming I decided to fix.

To implement the rotation invariance, it is necessary to run the algorithm several times for the image rotated at several angles. But since the algorithm works with pixels, and not an integral image, you can not perform a resource-intensive image rotation operation, but simply read the desired pixels using [a rotation matrix](https://en.wikipedia.org/wiki/Rotation_matrix).

The revision included:

- implementation of invariance to turn;
- re-trained classifier of persons;
- a more productive method for converting the RGBA image to grayscale;
- parallel execution in the Web-worker;
- code on ES6.

<iframe width="560" height="315" src="https://www.youtube.com/embed/u38oQQMu0WU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!--more-->

JS library code: <https://github.com/meefik/picoface>

### Using the JS library

All parameters of the library are set in the constructor, here is their description:

| Parameter   | Default      | Description                                                                           |
|-------------|--------------|---------------------------------------------------------------------------------------|
| shiftfactor | 0.1          | Sliding window movement step as a percentage (10%) of the image size                  |
| scalefactor | 1.1          | Sliding window resizing step as a percentage (10%) of image size                      |
| initialsize | 0.1          | Initial size of the sliding window as a percentage (10%) of the image size            |
| threshold   | 0.2          | Percentage (20%) of intersections of found candidates for grouping them into one area |
| memory      | 1            | Number of images (frames) in memory to improve detection quality                      |
| rotation    | [0]          | Array of rotation angles to be searched (0 to 360 in 1 degree increments)             |

The output is an array of areas where the algorithm assumes there are faces. Here is a description of this area:

| Feature     | Description                                                                          |
|-------------|--------------------------------------------------------------------------------------|
| c           | X-coordinate of the center of the found face area                                    |
| r           | Y-coordinate of the center of the found face area                                    |
| s           | Size of found area (width and height or diameter)                                    |
| q           | Detection quality (higher is better quality)                                         |
| a           | Rotation angle of the image (the most likely one listed in the rotation parameter)   |

Code example:

```js
// load cascade
fetch('./cascade.dat')
  .then(function(response) {
    if (!response.ok) throw new Error(response.statusText || 'Request error');
    return response.arrayBuffer();
  })
  .then(function(cascade) {
    // create the face detector with options
    return PicoFace(cascade, {
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

Running a demo:

```sh
npm install
npm run dev
```

Once the server is up and running, the demo page will be available at <http://localhost:8000/demo/>
