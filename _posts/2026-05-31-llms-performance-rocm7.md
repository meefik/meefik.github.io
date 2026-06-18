---
layout: post
title: LLM performance on AMD GPU with ROCm 7.x vs 6.x
description: Benchmarking large language models (LLMs) on AMD Radeon AI PRO R9700 GPU using Ollama with ROCm 7.x and comparing it to ROCm 6.x performance.
image: /assets/images/llm-performance-rocm7.png
date: 2026-05-31 21:00:00 +0000
categories: [amdgpu, llm, benchmark]
comments: true
---

In this post, I compare the performance of large language models (LLMs) on the [AMD Radeon AI PRO R9700](https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html) using Ollama with different ROCm versions. The R9700 is a powerful GPU designed for professional workloads, including machine learning and AI applications. In my previous post, [LLM performance on AMD Radeon AI PRO R9700](/2025/11/15/llms-performance-on-amdgpu/), I tested LLM performance with ROCm 6.4. Now, let's see how ROCm 7.1 compares.

![chart](/assets/images/llm-performance-rocm7.png "LLM performance, ROCm 6.x vs ROCm 7.x")

<!--more-->

## Hardware

The PC used for testing is equipped with the following specifications:

- **Motherboard**: B550 AORUS ELITE AX V2
- **GPU**: AMD Radeon AI PRO R9700 (32 GB VRAM, RDNA 4)
- **CPU**: AMD Ryzen 9 5950X (16 cores / 32 threads)
- **RAM**: 64 GB DDR4-2666
- **Storage**: NVMe Samsung SSD 970 EVO Plus 1TB (x2)

## Test environment

For LLM performance testing, I used the following environment:

```sh
docker run -d --name ollama --device /dev/kfd --device /dev/dri \
  -e "HSA_OVERRIDE_GFX_VERSION=12.0.0" \
  -v ollama:/root/.ollama -p 11434:11434 ollama/ollama:rocm
```

Instead of the `rocm` tag, I used `0.12.11-rocm` for ROCm 6.4 and `0.30.0-rocm` for ROCm 7.1.

Pull and run each LLM model (repeat for every model):

```sh
docker exec -it ollama ollama run mistral:7b --verbose

> Tell me a story about a brave knight who saves a village from a dragon.

...

total duration:       9.705420035s
load duration:        12.444423ms
prompt eval count:    21 token(s)
prompt eval duration: 31.977818ms
prompt eval rate:     656.71 tokens/s
eval count:           904 token(s)
eval duration:        9.5508627s
eval rate:            94.65 tokens/s
```

## Performance comparison

### ROCm 6.4 (Ollama v0.12.11)

| Model           | VRAM  | Prompt  | Response |
| --------------- | ----- | ------- | -------- |
| mistral:7b      | 6 GB  | 414 t/s | 80 t/s   |
| llama3.1:8b     | 7 GB  | 386 t/s | 77 t/s   |
| phi4:14b        | 12 GB | 213 t/s | 50 t/s   |
| gpt-oss:20b     | 13 GB | 704 t/s | 91 t/s   |
| gemma3:27b      | 19 GB | 207 t/s | 27 t/s   |
| qwen3-coder:30b | 18 GB | 250 t/s | 75 t/s   |
| qwen3:32b       | 21 GB | 179 t/s | 23 t/s   |
| deepseek-r1:32b | 22 GB | 99 t/s  | 23 t/s   |

### ROCm 7.1 (Ollama v0.30.0)

| Model           | VRAM  | Prompt  | Boost | Response | Boost |
| --------------- | ----- | ------- | ----- | -------- | ----- |
| mistral:7b      | 6 GB  | 656 t/s | +58%  | 94 t/s   | +18%  |
| llama3.1:8b     | 7 GB  | 786 t/s | +104% | 89 t/s   | +16%  |
| phi4:14b        | 12 GB | 592 t/s | +178% | 56 t/s   | +12%  |
| gpt-oss:20b     | 13 GB | 972 t/s | +38%  | 100 t/s  | +10%  |
| gemma3:27b      | 19 GB | 346 t/s | +67%  | 28 t/s   | +4%   |
| qwen3-coder:30b | 18 GB | 463 t/s | +85%  | 83 t/s   | +11%  |
| qwen3:32b       | 21 GB | 287 t/s | +60%  | 24 t/s   | +4%   |
| deepseek-r1:32b | 22 GB | 201 t/s | +103% | 26 t/s   | +13%  |

## Conclusion

Across the tested models, ROCm 7.1 improved response speed by 11% and prompt processing speed by 87% compared to ROCm 6.4. This shows that AMD's ROCm 7.x optimizations with Ollama have a significant impact on LLM performance, making this stack a strong choice for AI workloads on AMD GPUs.
