---
layout: post
title: The story of a (not so) necessary optimization
description: Exploring optimizations in MongoDB Change Streams and Tailable Cursors to improve performance in a Node.js Cluster application.
image: /assets/images/mongodb-nodejs-scale.jpg
date: 2025-04-20 10:00:00 +0000
categories: [mongodb]
comments: true
---

I am using [Node.js Cluster](https://nodejs.org/api/cluster.html) app with [MongoDB Replica Set](https://www.mongodb.com/docs/manual/replication/) in one of my projects. In the server architecture of the system, the [MongoDB Change Streams](https://www.mongodb.com/docs/manual/changeStreams/) mechanism is used to implement the horizontal scaling of real-time functionality (video communication, chats, notifications), which allows subscribing to changes occurring in the database. Previously, instead of this mechanism, I used data exchange over UDP directly between the application server hosts until our hoster, for an unknown reason, began to lose a significant portion of packets. Because of this, I had to abandon this method. For the last couple of months, I've been wondering how to optimize the operation of this mechanism in MongoDB, or even abandon it in favor of connecting an additional component like [Redis Pub/Sub](https://redis.io/docs/latest/develop/interact/pubsub/). But without a particular need, I didn't want to multiply entities, [Occam's Razor](https://en.wikipedia.org/wiki/Occam%27s_razor), you know. Besides, figuring out what's already there isn't a bad idea to start with.

![architecture](/assets/images/mongodb-nodejs-scale.jpg "MongoDB + Node.js scale")

<!--more-->

First of all, I thought, since our DBMS cluster consists of two hosts (primary and secondary), it would be nice to switch tracking changes via Change Streams to the Secondary host, because millisecond latency in data synchronization between hosts isn't critical for us here. No problem, done! This allowed us to distribute the load between the cluster hosts, but it still remained uneven. As it turned out, Change Streams on the Secondary host created more CPU load than all other operations on the Primary host. Studying the official documentation, forums, and even AI didn't provide an understanding of the performance of this function, although the principle of operation eventually became clear.

In practice, experiments revealed that one of the features of Change Streams is that despite the fact that you can subscribe to changes only in a specific collection, it seems that under the hood, all changes across the entire database are collected and then filtered. This leads to the fact that any data changes in the database create an additional, albeit small, load. Digging further, I found an alternative mechanism for tracking the addition of new documents to a collection (which is exactly what we need), called [Tailable Cursor](https://www.mongodb.com/docs/manual/core/tailable-cursors/). It uses the same [oplog](https://www.mongodb.com/docs/manual/core/replica-set-oplog/) as Change Streams, but it seems to be structured a bit differently. Unlike Change Streams, it reacts to the addition of documents only to a specific [capped collection](https://www.mongodb.com/docs/manual/core/capped-collections/) and doesn't create CPU load when data changes in other collections. Oh, so that was an option? Okay, done!

Synthetic tests showed a 20% performance increase, which is already good. However, in production, the load on the Secondary node could exceed the Primary by 2 to 5 times! So, there's still something else going on. I conducted a synthetic test for adding documents to a collection (up to 1000 ops!) that is being monitored. It turned out that the load when adding documents to the monitored collection is 5% higher than to an unmonitored one. But then, it gets more interesting. Each new observer increases the load on the host by roughly 50%! And the more workers the application server has, the greater the load on the database will be. This can be worked with; we just need to reduce the number of listeners. Piece of cake, the new synchronization architecture is done, where within the same host, Node.js cluster workers communicate via the [IPC](https://en.wikipedia.org/wiki/Inter-process_communication) (as in the case of working without a Replica Set), and hosts communicate through the Tailable Cursor mechanism in MongoDB. Thus, vertical scaling does not use the database, and horizontal scaling does, but it is limited by the number of application server hosts, not the number of its workers.

In the end, there were three optimizations:

1. shifting the load to the secondary host;
2. replacing change streams with tailable cursor;
3. reducing the number of listeners (1 listener - 1 host, instead of 1 listener - 1 worker).

In the end, this journey highlighted the importance of not just blindly implementing solutions, but also understanding the underlying technology and continuously seeking improvements. What initially felt like a small tweak turned into a series of optimizations that significantly impacted the system's efficiency. It's a good reminder that sometimes, the "unnecessary" optimization can lead to surprisingly valuable insights and improvements.
