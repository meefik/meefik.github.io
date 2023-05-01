---
layout: post
title: Training 5 points model for OpenCV Facemark API
date: 2018-09-20 12:00:00 +0000
categories: [opencv]
comments: true
---

Относительно недавно в OpenCV появился API для обнаружения антропометрических точек лица. По использованию Facemark API есть неплохая [статья на Learn OpenCV](https://www.learnopencv.com/facemark-facial-landmark-detection-using-opencv/). Хорошая реализация поиска таких точек есть в [библиотеке dlib](http://dlib.net/face_landmark_detection_ex.cpp.html), однако иногда хочется ограничиться одной библиотекой, особенно если речь идет о портировании кода на мобильные устройства или браузер (кстати, OpenCV [поддерживает компиляцию в WebAssembly](https://docs.opencv.org/master/d5/d10/tutorial_js_root.html)). К сожалению, в алгоритмах поиска точек лица используются модели достаточно большого размера (68 точек ~ 54 МБ), а размер загружаемого кода на клиент может быть ограничен. В библиотеке dlib есть предобученная [модель на 5 точек](https://github.com/davisking/dlib-models) (5.44 MB), однако для OpenCV такой модели нет, причем нет даже поддержки такой модели, на данный момент поддерживаются модели на 68 и 29 точек. Модель на 5 точек может использоваться для нормализации лиц на клиенте. Ниже я опишу процесс обучения собственной модели небольшого размера на 5 точек.

<!--more-->

### Патч для OpenCV

Как я уже сказал, на данный момент OpenCV не поддерживает модели на 5 точек. Поэтому пришлось залезть в код модуля FacemarkLBF и исправить это недоразумение. Будем использовать реализацию метода LBF для поиска точек, однако в OpenCV есть также реализация метода AAM. Ниже патч для файла [facemarkLBF.cpp](https://github.com/opencv/opencv_contrib/blob/master/modules/face/src/facemarkLBF.cpp), который добавлять поддержку модели на 5 точек:

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

Модуль `face` находится в репозитории [opencv_contrib](https://github.com/opencv/opencv_contrib), а сам OpenCV в репозитории [opencv](https://github.com/opencv/opencv). Для сборки нужно скачать основной репозиторий `opencv` и `opencv_contrib` и выполнить следующий скрипт из отдельного пустого подкаталога.

```sh
#!/bin/sh

cmake "../opencv" \
 -DCMAKE_BUILD_TYPE=Release \
 -DBUILD_opencv_face=ON \
 -DOPENCV_EXTRA_MODULES_PATH="../opencv_contrib/modules"

make -j$(grep -c ^processor /proc/cpuinfo)
```

### Подготовка набора для обучения модели

Вообще, процедура обучения описана в [руководстве OpenCV](https://docs.opencv.org/master/d7/dec/tutorial_facemark_usage.html). Но в нашем случае нужно подготовить обучающий набор фотографий с разметкой на 5 точек. К счастью, в dlib выложен [соответствующий обучающий набор](http://dlib.net/files/data/dlib_faces_5points.tar), остается только его преобразовать к формату OpenCV. В архиве 7364 фотографий с разметкой как на следующей картинке:

![face_045889](/assets/images/face_045889.jpg "5 points facemark")

Я написал скрипт для преобразования меток в формат OpenCV:

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

Скрипт нужно разместить в директории `dlib_faces_5points`, на выходе будет директория с метками `points`, а также файлы `images_train.txt` и `points_train.txt` со списком файлов изображений и меток.

### Обучение и использование модели

Для обучения модели подготовлена программа, которую нужно предварительно скомпилировать с помощью `cmake`. Параметры модели следующие:

| Параметр    | Значение | Описание                    |
|-------------|----------|-----------------------------|
| n_landmarks | 5        | Количество точек            |
| initShape_n | 10       | Множитель обучающей выборки |
| stages_n    | 10       | Количество этапов обучения  |
| tree_n      | 20       | Количество деревьев         |
| tree_depth  | 5        | Глубина каждого дерева      |

Результат можно посмотреть на примере отрывка из видео [15 Newly Discovered Facial Expressions](https://www.youtube.com/watch?v=h-Gcl58WbGQ):

![facemark](/assets/images/facemark.gif "5 points video")

Код выложен в [репозитории на Github](https://github.com/meefik/opencv_facemark). Уже обученная модель [выложена тут](https://raw.githubusercontent.com/meefik/opencv_facemark/master/lbfmodel.yaml), размер файла 3.6 МБ. Там же есть код для детекции точек на видео с веб-камеры, который запускается сразу после обучения. Следует учесть, что использовать модель нужно только с детектором лиц, который использовался при обучении, в данном случае Viola-Jones.

