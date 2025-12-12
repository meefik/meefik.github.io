---
layout: post
title: Training 5 points model for OpenCV Facemark API
description: A guide to training a lightweight 5-point facial landmark detection model for OpenCV's Facemark API, including code modifications and dataset preparation.
image: /assets/images/facemark.gif
date: 2018-09-20 12:00:00 +0000
categories: [opencv]
comments: true
---

More recently, OpenCV introduced an API for detecting anthropometric points of the face. There is a good article on using the Facemark API [at Learn OpenCV](https://www.learnopencv.com/facemark-facial-landmark-detection-using-opencv/). A good implementation of the search for such points is in [the dlib library](http://dlib.net/face_landmark_detection_ex.cpp.html), but sometimes you want to limit yourself to one library, especially when it comes to porting code to mobile devices or a browser (by the way, OpenCV [supports compilation in WebAssembly](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html)). Unfortunately, face point search algorithms use models of a sufficiently large size (68 points ~ 54 MB), and the size of the downloadable code per client may be limited. The dlib library has a pre-trained [model for 5 points](https://github.com/davisking/dlib-models) (5.44 MB), but for OpenCV there is no such model, and there is not even support for such a model, at the moment models for 68 and 29 points are supported. The 5-point model can be used to normalize faces on the client. Below I will describe the process of learning your own model of a small size for 5 points.

<!--more-->

### Patch for OpenCV

As I said, OpenCV does not currently support 5-point models. Therefore, I had to get into the code of the FacemarkLBF module and correct this misunderstanding. We will use the implementation of the LBF method to search for points, but in OpenCV there is also an implementation of the AAM method. Below is a patch for the [facemarkLBF.cpp](https://github.com/opencv/opencv_contrib/blob/master/modules/face/src/facemarkLBF.cpp) file that adds support for the 5-point model:

```diff
diff --git a/modules/face/src/facemarkLBF.cpp b/modules/face/src/facemarkLBF.cpp
index 50192286..dc354617 100644
--- a/modules/face/src/facemarkLBF.cpp
+++ b/modules/face/src/facemarkLBF.cpp
@@ -571,7 +571,13 @@ void FacemarkLBFImpl::data_augmentation(std::vector<Mat> &imgs, std::vector<Mat>
         shape.at<double>(j-1, 1) = tmp; \
     } while(0)
 
-    if (params.n_landmarks == 29) {
+    if (params.n_landmarks == 5) {
+        for (int i = N; i < (int)gt_shapes.size(); i++) {
+            SWAP(gt_shapes[i], 1, 3);
+            SWAP(gt_shapes[i], 2, 4);
+        }
+    }
+    else if (params.n_landmarks == 29) {
         for (int i = N; i < (int)gt_shapes.size(); i++) {
             SWAP(gt_shapes[i], 1, 2);
             SWAP(gt_shapes[i], 3, 4);
```

The `face` module is in the [opencv_contrib](https://github.com/opencv/opencv_contrib) repository, and the OpenCV itself is in the [opencv](https://github.com/opencv/opencv) repository. To build, you need to download the main repository `opencv` and `opencv_contrib` and execute the following script from a separate empty subdirectory.

```sh
#!/bin/sh

cmake "../opencv" \
 -DCMAKE_BUILD_TYPE=Release \
 -DBUILD_opencv_face=ON \
 -DOPENCV_EXTRA_MODULES_PATH="../opencv_contrib/modules"

make -j$(grep -c ^processor /proc/cpuinfo)
```

### Preparing the Model Training Set

In general, the training procedure is described in the [OpenCV manual](https://docs.opencv.org/master/d7/dec/tutorial_facemark_usage.html). But in our case, you need to prepare a training set of photos with markup on 5 points. Fortunately, there is a [corresponding training set](http://dlib.net/files/data/dlib_faces_5points.tar) in dlib, all that remains is to convert it to OpenCV format. The archive contains 7364 photos with the markup as in the following picture:

![face_045889](/assets/images/face_045889.jpg "5 points facemark")

I wrote a script to convert labels to OpenCV format:

```sh
#!/bin/sh

parse_xml()
{
  xml_file="$1"
  out_dir="$2"

  xmllint --xpath "//dataset/assets/images/image/@file" "$xml_file" | xargs | tr ' ' '\n' | cut -f2 -d'=' | while read f
  do
    echo $f
    out_file="${f#*/}"
    out_file="${out_file%.jpg}.pts"
    out_file="${out_dir%/}/${out_file}"
    echo "version: 1" >"$out_file"
    echo "n_points:  5" >>"$out_file"
    echo "{" >>"$out_file"
    xmllint --xpath "//dataset/assets/images/image[@file='$f']/box[1]/part" "$xml_file" | sed 's/>/\n/g' | sed -E 's/.*x=\"([0-9]+)\" y=\"([0-9]+)\".*/\1 \2/g' >>"$out_file"
    echo "}" >>"$out_file"
  done
}

test -e ./points || mkdir ./points

parse_xml ./test_cleaned.xml ./points
parse_xml ./train_cleaned.xml ./points

( cd ./images; ls $PWD/* ) >./images_train.txt
( cd ./points; ls $PWD/* ) >./points_train.txt
```

The script must be placed in the `dlib_faces_5points` directory, the output will be the `points` directory with labels, as well as `images_train.txt` and `points_train.txt` files with a list of image and label files.

### Training and use of the model

To train the model, a program has been prepared that must be precompiled using `cmake`. The model parameters are as follows:

| Parameter   | Value    | Description                 |
|-------------|----------|-----------------------------|
| n_landmarks | 5        | Number of points            |
| initShape_n | 10       | Training Sample Multiplier  |
| stages_n    | 10       | Number of training stages   |
| tree_n      | 20       | Number of trees             |
| tree_depth  | 5        | Depth of each tree          |

You can see the result in an excerpt from the video [15 Newly Discovered Facial Expressions](https://www.youtube.com/watch?v=h-Gcl58WbGQ):

![facemark](/assets/images/facemark.gif "5 points video")

The code is published in [the repository on Github](https://github.com/meefik/opencv_facemark). Already trained model is [available here](https://raw.githubusercontent.com/meefik/opencv_facemark/master/lbfmodel.yaml), file size 3.6 MB. There is also a code for detecting points on video from a webcam, which is launched immediately after training. It should be noted that the model should be used only with the face detector, which was used in training, in this case Viola-Jones.
