---
layout: post
title: Update time zones in Android
description: Timezone Updater application for updating time zone data on Android devices.
image: /assets/images/tzupdater.png
date: 2015-09-26 12:00:00 +0000
categories: [android, tzupdater]
comments: true
---

The application appeared because of the current difficult situation with the update of time zones in Android. The International Time Zone Database is updated every month, but there are no regular means of updating this database on devices. Keep track of time zone updates and release timely firmware updates, in theory, should device manufacturers, but in fact it is not. As a result, Timezone Updater was developed, which downloads and updates to the latest version of the time zone data on the Android device. The [time zone database](http://www.iana.org/time-zones) and [ICU data](http://site.icu-project.org) are updated. This application is designed to solve all the known problems associated with time zones in Android.

![tzupdater](/assets/images/tzupdater.png "Timezone Updater"){: .center}

<!--more-->

Updated the following files:

- /data/misc/zoneinfo/tzdata or /system/usr/share/zoneinfo/*
- /system/usr/icu/*.dat

Before starting the update procedure is recommended to make backup copies of these files or the entire system.

Requirements:

- Android 4.0 (API 14) or later
- Superuser permissions (root)
- [BusyBox](https://github.com/meefik/busybox)

The application is distributed under license [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html) or later. For more details, see [the project page](/tzupdater).
