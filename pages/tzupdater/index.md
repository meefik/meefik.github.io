---
permalink: /tzupdater
layout: page
title: Timezone Updater for Android
description: Timezone Updater is an open-source Android application that updates your device's time zone data to the latest version, ensuring accurate timekeeping.
image: /assets/images/tzupdater.png
comments: false
footer: false
---

This application is [open-source software](https://github.com/meefik/tzupdater) for downloads and updates time zones to the latest version on your Android device. This update should fix all known problems with time zones, such as incorrect time in Android and some applications.

![Timezone Updater](/assets/images/tzupdater.png)

Requirements:

- Android 4.0 (API 14) or later
- Superuser permissions (root)
- [BusyBox](https://github.com/meefik/busybox)

Update procedure:

1. Get superuser privileges (root)
2. Install BusyBox
3. Check your connection to the Internet
4. Tap UPDATE button
5. Restart your device

The following files will be updated:

- [TZ data](https://www.iana.org/time-zones/): /data/misc/zoneinfo/tzdata or /system/usr/share/zoneinfo/*
- [ICU data](https://icu.unicode.org/): /system/usr/icu/*.dat

**Attention!** Before starting the update procedure is recommended to make backup copies of these files or the entire system.

The app is available for download in Google Play and GitHub ([Privacy Policy](/tzupdater/privacy)):

<div class="no-border">
  <a href="https://play.google.com/store/apps/details?id=ru.meefik.tzupdater" target="_blank"
    rel="nofollow noopener"><img src="/assets/images/get-it-on-google-play.png" alt="Get it on Google Play"></a>
  <a href="https://github.com/meefik/tzupdater/releases/latest" target="_blank" rel="nofollow noopener"><img
      src="/assets/images/get-apk-from-github.png" alt="Get it on Github"></a>
</div>

<p><iframe src="https://ghbtns.com/github-btn.html?user=meefik&repo=tzupdater&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe></p>
