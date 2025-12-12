---
layout: post
title: Task dispatcher with queuing and concurrency
description: A JavaScript Dispatcher class for managing asynchronous tasks with queue depth and concurrency limits.
date: 2024-01-14 12:00:00 +0000
categories: [javascript]
comments: true
---

I like concise solutions in code with no external dependencies. Today I'm posting a simple code to control asynchronous task execution in JavaScript.

Dispatching tasks effectively is a common challenge in modern web applications. This post presents a Dispatcher class in JavaScript designed to manage asynchronous jobs within a bounded queue and respect a maximum number of concurrent tasks. The design allows for graceful error handling, retries, and queue management, making it ideal for scenarios such as saving data to a backend or batch processing.

<!--more-->

## Use Cases

### Saving Data to a Backend

When dealing with multiple API calls, the dispatcher can help manage the load by queuing save operations and ensuring only a fixed number run concurrently. This prevents overwhelming the backend service.

### Batch Processing of Jobs

For applications that need to process large numbers of tasks, the Dispatcher can serve as a batch manager. It queues jobs, ensures controlled concurrency, and handles retries in case of failures.

### Scheduling and Retrying Tasks

In systems that require scheduling tasks (e.g., sending emails or notifications), the dispatcher supports retry logic. Failed tasks can be rescheduled with a delay, ensuring that temporary issues do not cause permanent task failures.

## Code Overview

Below is the source code for the Dispatcher class:

```js
/**
 * Class representing a dispatcher for managing and executing jobs concurrently.
 * The dispatcher maintains a bounded queue of jobs and processes them according
 * to specified queue depth and concurrency limits.
 *
 * @class Dispatcher
 */
export default class Dispatcher {
  /**
   * Creates an instance of Dispatcher.
   *
   * @constructor
   * @param {Object} [options] Configuration options.
   * @param {number} [options.depth=5] Maximum number of jobs in the queue.
   * @param {number} [options.concurrent=3] Maximum number of jobs running concurrently.
   */
  constructor({ depth = 5, concurrent = 3 } = {}) {
    this.queue = new Set();
    this.inprogress = 0;
    this.depth = depth;
    this.concurrent = concurrent;
  }

  /**
   * Adds a new job to the queue.
   * If the queue exceeds the defined depth, the oldest job is removed.
   *
   * @param {Object} job The job object to add.
   * @param {function} [job.run] The function to run.
   * @param {function} [job.onerror] The function to run on error.
   * @param {number|function} [job.attempts] The number of attempts to run the job.
   * @param {number|function} [job.delay] The delay before retrying the job.
   */
  create(job) {
    this.queue.add(job);
    if (this.queue.size > this.depth) {
      const first = this.queue.values().next().value;
      this.queue.delete(first);
    }
  }

  /**
   * Removes a job from the queue.
   *
   * @param {Object} job The job object to remove.
   */
  cancel(job) {
    this.queue.delete(job);
  }

  /**
   * Starts processing jobs in the queue.
   * Jobs are executed based on the order in the queue, concurrency limits, and their scheduled run time.
   * This method uses an interval timer to periodically check and run eligible jobs.
   */
  start() {
    if (this.timer) return;
    const getNextJob = () => {
      for (const job of this.queue.values()) {
        if (!job || job.state === 'active' || job.nextRunAt > Date.now()) continue;
        if (this.inprogress >= this.concurrent) break;
        return job;
      }
    };
    this.timer = setInterval(async () => {
      const job = getNextJob();
      if (!job) return;
      this.inprogress++;
      job.state = 'active';
      job.attempt = (job.attempt || 0) + 1;
      try {
        if (typeof job.run === 'function') {
          await job.run(job);
        }
        job.state = 'done';
        delete job.nextRunAt;
        this.queue.delete(job);
      }
      catch (err) {
        job.state = 'error';
        job.error = err;
        job.errorAt = Date.now();
        const attempts = typeof job.attempts === 'function'
          ? job.attempts(job)
          : job.attempts;
        if (job.attempt >= attempts) {
          job.state = 'failed';
          delete job.nextRunAt;
          this.queue.delete(job);
        }
        else {
          const delay = typeof job.delay === 'function'
            ? job.delay(job)
            : job.delay;
          job.nextRunAt = Date.now() + parseInt(delay || 0);
        }
        if (typeof job.onerror === 'function') {
          job.onerror(job);
        }
      }
      this.inprogress--;
    }, 1000);
  }

  /**
   * Pauses the processing of jobs by clearing the interval timer.
   */
  pause() {
    clearInterval(this.timer);
    this.timer = null;
  }

  /**
   * Stops processing jobs and optionally waits for the queue to clear.
   * If a timeout is provided, the dispatcher checks periodically until the queue is empty or the timeout is exceeded.
   * On shutdown, it pauses processing and clears the queue.
   *
   * @param {function} [cb] Optional callback to execute after shutdown.
   * @param {number} [timeout=0] Optional timeout (in seconds) to wait for the queue to be empty.
   */
  stop(cb, timeout = 0) {
    const shutdown = (err) => {
      this.pause();
      this.clear();
      if (cb) cb(err);
    };
    if (timeout > 0) {
      for (const job of this.queue.values()) {
        job.nextRunAt = Date.now();
      }
      let counter = timeout;
      const timer = setInterval(() => {
        if (!this.queue.size) {
          clearInterval(timer);
          shutdown();
        }
        else if (--counter <= 0) {
          clearInterval(timer);
          shutdown(new Error('Timeout exceeded'));
        }
      }, 1000);
    }
    else {
      shutdown();
    }
  }

  /**
   * Clears all jobs from the queue.
   */
  clear() {
    this.queue.clear();
  }

  /**
   * Gets the number of jobs currently in the queue.
   *
   * @type {number}
   * @readonly
   */
  get size() {
    return this.queue.size;
  }
}
```

## Practical Examples

Below is an example of how to use the dispatcher in your project:

```js
import Dispatcher from './dispatcher';

const dispatcher = new Dispatcher({ depth: 10, concurrent: 2 });

dispatcher.start();

// Example job: Saving data to a backend service
const job = {
  run: async () => {
    // Simulate saving data
    if (Math.random() > 0.5) throw Error('Saving data issue');
    console.log('Data has been saved to the backend.');
  },
  onerror: ({ error }) => {
    console.error(error);
  },
  attempts: 3,
  delay: 5000 // Retry delay in milliseconds
};

dispatcher.create(job);
```

## Summary

The Dispatcher can be used to manage asynchronous tasks. It simplifies the process of queuing tasks, enforcing concurrency limits, and handling retries, making it a valuable asset when integrating with back-end services or processing batch operations. With this design, IT developers can increase the reliability and efficiency of their application.

Happy coding!