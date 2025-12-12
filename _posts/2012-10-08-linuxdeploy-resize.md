---
layout: post
title: Extending a Linux Deploy image
description: Instructions on how to increase the size of a Linux Deploy image file.
date: 2012-10-08 12:00:00 +0000
categories: [android, linuxdeploy]
comments: true
---

To increase the image file size for Linux Deploy, you first need to expand the existing image, and then expand the file system to a new size. For example, to increase the image by 3000 MB, you need to do the following:

```sh
dd if=/dev/zero bs=1048576 count=3000 >> /mnt/sdcard/linux.img
e2fsck -f /mnt/sdcard/linux.img
resize2fs /mnt/sdcard/linux.img
```

You must first make a backup copy of the image.
