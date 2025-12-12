---
layout: post
title: Java keystore password guessing
description: A tool for recovering lost Java keystore passwords using distributed brute-force attack.
image: /assets/images/keystorebreaker.png
date: 2012-11-16 12:00:00 +0000
categories: [java]
comments: true
---

An interesting story happened to me not so long ago. I posted an app to Google Market and when it was time to update it, I found that I had lost the key password to sign my apps. The standard way out of this situation was to create a new key, shut down the old app, and upload the new app under a new name in the marketplace. I did not want to do this, and as a result, the application [KeystoreBreaker](https://github.com/meefik/keystorebreaker) appeared. The application allows you to select a password for keystore under certain conditions with the possibility of distributed calculation. You can specify the set of characters that make up the intended password, and then divide all possible combinations of these characters into non-overlapping groups and bust for each group separately. It can be distribution on several cores within one computer, and distribution on several computers. The essence of the algorithm is that each variant of the password is represented in N-digit number system, which is formed on the basis of the input character set. After that, the entire range from the first to the last character, for example 000000-zzzzzz, can be divided into any number of smaller ranges in which the search is carried out.

<!--more-->

The format for running the utility is as follows:

```
java -jar KeystoreBreaker.jar <keystore file> <sequence> <first passwd> <last passwd> <number of threads>
```

Usage example:

```
$ java -jar KeystoreBreaker.jar test.jks 0123456789abcdefghijklmnopqrstuvwxyz 000000 zzzzzz 4

Keystore: test.jks
Threads: 4
Sequence: 01256789abcdefghijklmnopqrstuvwxyz
First password: 000000
Last password: zzzzzz
Combinations: 1544804415
Distribution by threads: 
#0: 000000 - 2000ja
#1: 2000ja - 10000j
#2: 10000j - 0000jr
#3: 0000jr - zzzzzz
Processing: 
#0: wxj000 / 2000ja  0% [ 20735 pwd/s ]
#1: zhk0ja / 10000j  0% [ 21327 pwd/s ]
#2: fij00j / 0000jr  0% [ 20187 pwd/s ]
#3: uxj0jr / zzzzzz  0% [ 20713 pwd/s ]
Total: 0% [ 82943 pwd/s ]  Time left: 0.05:10:23
```

My story with the lost password ended well, in a few days on four 12-core processors, I managed to pick up my password. It helped that I knew what symbols the password consisted of and how long it was.
