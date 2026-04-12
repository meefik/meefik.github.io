---
layout: post
title: LLMs can amplify your delusions
description: A personal experience illustrating how LLMs can lead to misinformation and reinforce false beliefs.
image: /assets/images/echo-chamber-effect.jpg
date: 2026-04-12 10:00:00 +0000
categories: [llm]
comments: true
---

Last time, I used LLM models frequently in both my work and personal life. They are useful tools that can increase productivity and awareness. However, I started noticing that, from time to time, the chats would become hallucinatory in an interesting manner, which somehow affects me. When an LLM doesn't have enough knowledge about something, it fills the gaps with incorrect information that better fits your context or request. Even if you ask about the same thing over time using different words and without providing previous context, the model may respond with similar hallucinations convincingly and in great detail. This behavior can be dangerous. If you trust its answers and see the same information repeatedly, you may start to believe it's true. Actually, if you notice, you can point out the mistake to the LLM. It will probably admit the mistake. But what's most interesting? If you point out the correct answer provided by the LLM but then consider it to be a mistake, the LLM will agree with you in some cases. This can lead to misinformation and reinforce the perception of false information in your memory.

![Echo Chamber Effect](/assets/images/echo-chamber-effect.jpg)

<!--more-->

Take a look at the dialogue with Gemini Fast:

> Q: In my JavaScript WebRTC app, I share a media stream using the `pc.addTrack(track, stream)` function. Is it possible to get the stream ID from the peer connection after that?

> A: The short answer is yes, you can use the `getStreams` method...

Using getSenders()

```js
// Assuming you already called: pc.addTrack(track, stream);

const senders = pc.getSenders();
const sender = senders.find(s => s.track === track);

if (sender) {
    // getStreams() returns an array of streams associated with this sender
    const associatedStreams = sender.createEncodedStreams ? [] : sender.getStreams(); 
    // Usually, you just want the first one
    const streamId = associatedStreams[0]?.id;
    console.log("Stream ID:", streamId);
}
```

Using getTransceivers()

```js
pc.getTransceivers().forEach(transceiver => {
    const sender = transceiver.sender;
    if (sender.track === track) {
        const streamId = sender.getStreams()[0]?.id;
        console.log("Found Stream ID via transceiver:", streamId);
    }
});
```

> Q: Wait! The `getStreams` function does not exist. 

> A: Ah, you're absolutely right to catch that...

Incidentally, Gemini Pro provided the correct answer at the time.

This is nothing new. Probably, you have already heard about [the echo chamber effect](https://en.wikipedia.org/wiki/Echo_chamber_(media)) of LLMs. I just wanted to share my experience with it, though.

In any case, I illustrated that dangerous behavior can arise not only with easy-to-prove or disprove coding tasks. So, be careful not to blindly trust LLMs. They can spread misinformation and amplify your delusions.
