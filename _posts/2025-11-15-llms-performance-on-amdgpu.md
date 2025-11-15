---
layout: post
title: LLM performance on AMD Radeon AI PRO R9700
date: 2025-11-15 18:00:00 +0000
categories: [amdgpu, llm]
comments: true
---

Recently, I acquired an [AMD Radeon AI PRO R9700](https://www.amd.com/en/products/graphics/workstations/radeon-ai-pro/ai-9000-series/amd-radeon-ai-pro-r9700.html) to enhance my machine learning and development setup. It is a powerful GPU designed for professional workloads, including machine learning and AI applications. In this post, we explore the performance of large language models (LLMs) on the R9700, highlighting its capabilities and benchmarks.

![chart](/assets/images/amdgpu-r9700-ollama-performance.png "AMD Radeon AI PRO R9700 performance on LLMs using Ollama")

<!--more-->

## Hardware overview

The PC used for testing is equipped with the following specifications:

- **Motherboard**: B550 AORUS ELITE AX V2
- **GPU**: AMD Radeon AI PRO R9700 (32 GB VRAM, RDNA 4)
- **CPU**: AMD Ryzen 9 5950X (16 cores / 32 threads)
- **RAM**: 64 GB DDR4-2666
- **Storage**: NVMe Samsung SSD 970 EVO Plus 1TB

## Setup environment

For testing LLM performance we set up the following environment:

- [Docker Compose](https://docs.docker.com/compose/)
- [Ollama with ROCm](https://ollama.com)
- [Open WebUI](https://github.com/open-webui/open-webui)

The `docker-compose.yml` file used for the setup is as follows:
```yaml
services:
  ollama:
    image: ollama/ollama:rocm
    ports:
      - 11434:11434
    volumes:
      - ollama:/root/.ollama
    environment:
      - 'HSA_OVERRIDE_GFX_VERSION=12.0.0'
    devices:
      - '/dev/kfd'
      - '/dev/dri'
    tty: true
    restart: unless-stopped

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    volumes:
      - open-webui:/app/backend/data
    depends_on:
      - ollama
    ports:
      - 8080:8080
    environment:
      - 'OLLAMA_BASE_URL=http://ollama:11434'
      - 'WEBUI_SECRET_KEY='
    extra_hosts:
      - host.docker.internal:host-gateway
    restart: unless-stopped

volumes:
  ollama:
  open-webui:
```

Run these services with:
```sh
docker-compose up -d
```

## Benchmark results

I used the following prompt for testing:

`Tell me a story about a brave knight who saves a village from a dragon.`

Here are the benchmark results for various models based on this prompt:

| Model            | VRAM usage | Prompt          | Response       |
|------------------|------------|-----------------|----------------|
| mistral:7b       | 6 GB       | 414 tokens/sec  | 80 tokens/sec  |
| llama3.1:8b      | 7 GB       | 386 tokens/sec  | 77 tokens/sec  |
| phi4:14b         | 12 GB      | 213 tokens/sec  | 50 tokens/sec  |
| gpt-oss:20b      | 13 GB      | 704 tokens/sec  | 91 tokens/sec  |
| gemma3:27b       | 19 GB      | 207 tokens/sec  | 27 tokens/sec  |
| qwen3-coder:30b  | 18 GB      | 250 tokens/sec  | 75 tokens/sec  |
| qwen3:32b        | 21 GB      | 179 tokens/sec  | 23 tokens/sec  |
| deepseek-r1:32b  | 22 GB      | 99 tokens/sec   | 23 tokens/sec  |

For vision models that understand images, I used this image with the following prompt:

`What is in this picture?`

![image-example](/assets/images/meefik-at-work.png)

| Model            | VRAM usage | Prompt          | Response       |
|------------------|------------|-----------------|----------------|
| moondream:1.8b   | 3 GB       | 2156 tokens/sec | 188 tokens/sec |
| gemma3:4b        | 5 GB       | 1316 tokens/sec | 107 tokens/sec |
| gemma3n:e4b      | 8 GB       | 367 tokens/sec  | 58 tokens/sec  |
| llava:7b         | 6 GB       | 515 tokens/sec  | 83 tokens/sec  |
| qwen3-vl:8b      | 11 GB      | 423 tokens/sec  | 73 tokens/sec  |
| gemma3:27b       | 19 GB      | 171 tokens/sec  | 27 tokens/sec  |
| qwen3-vl:32b     | 26 GB      | 132 tokens/sec  | 24 tokens/sec  |
| llava:34b        | 22 GB      | 129 tokens/sec  | 24 tokens/sec  |

## Conclusion

The AMD Radeon AI PRO R9700 demonstrates strong performance across a variety of large language models, handling both text-only and vision-capable models effectively. With its substantial VRAM and robust architecture, the R9700 is well-suited for professional AI workloads, making it a compelling choice for developers and researchers working with LLMs. Now, I can take full advantage of AMD's capabilities for my AI projects and code with local LLMs!
