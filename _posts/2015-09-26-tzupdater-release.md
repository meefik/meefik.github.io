---
layout: post
title: Update time zones in Android
date: 2015-09-26 12:00:00 +0000
categories: [android, tzupdater]
comments: true
---

Приложение появилось из-за сложившийся сложной ситуации с обновлением часовых поясов в Android. Международная база данных часовых поясов обновляется каждый месяц, но нет никаких штатных средств обновления этой базы на устройствах. Следить за обновлениями часовых поясов и выпускать своевременные обновления прошивок, по идее, должны производители устройств, но на деле этого нет. В итоге было разработано приложение Timezone Updater, которое скачивает и обновляет до последней версии данные часовых поясов на Android-устройстве. Обновляются [база данных часовых поясов](http://www.iana.org/time-zones) и [ICU данные](http://site.icu-project.org). Данное приложение призвано решить все известные проблемы, связанные с часовыми поясами в Android.

![tzupdater](/assets/images/tzupdater.png "Timezone Updater"){: .center}

<!--more-->

На устройстве изменяются следующие файлы:

* /data/misc/zoneinfo/tzdata или /system/usr/share/zoneinfo/*
* /system/usr/icu/*.dat

Перед использованием приложения рекомендуется сделать резервную копию системы устройства.

Для работы приложения необходимы:

* Android 2.3 (API 9) или выше
* права суперпользователя (root)
* установленный BusyBox

Приложение распространяется под лицензией [GPL версии 3](http://www.gnu.org/licenses/) или более поздней.

Исходный код: <https://github.com/meefik/tzupdater>
<br>
Установить из Google play: <https://play.google.com/store/apps/details?id=ru.meefik.tzupdater>
