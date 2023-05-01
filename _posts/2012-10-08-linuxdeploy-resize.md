---
layout: post
title: Extending a Linux Deploy image
date: 2012-10-08 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

Чтобы увеличить размер файла образа для Linux Deploy нужно сначала расширить существующий образ, а затем расширить файловую систему до нового размера. Например, чтобы увеличить образ на 3000 МБ нужно выполнить следующее:
```sh
dd if=/dev/zero bs=1048576 count=3000 >> /mnt/sdcard/linux.img
e2fsck -f /mnt/sdcard/linux.img
resize2fs /mnt/sdcard/linux.img
```
Предварительно нужно обязательно сделать резервную копию образа.
