---
layout: post
title: How to reduce AMD GPU power consumption on Linux
description: A simple guide to lower AMD GPU power consumption by changing performance levels on Linux systems.
image: /assets/images/amdgpu-power-level.png
date: 2025-09-20 18:00:00 +0000
categories: [amdgpu, linux]
comments: true
---

If you have a PC running Linux with an AMD GPU, you can change your GPU performance level. By default, [the AMDGPU driver](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/reference/user-kernel-space-compat-matrix.html) uses the "auto" performance level. But if you don't need high performance, you can set it to "low" to reduce power consumption, heat generation, and fan noise.

![amd_gpu_power_level](/assets/images/amdgpu-power-level.png "AMD GPU power consumption before and after changing performance level")

On my system this change reduced the GPU power consumption from 30W to 15W in idle state and completely eliminated fan spinning.

<!--more-->

You can check the current performance level with:
```sh
cat /sys/class/drm/card0/device/power_dpm_force_performance_level
```

You can change the performance level on the fly with:
```sh
echo "low" | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level
echo "auto" | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level
```

To make this change permanent, create a udev rule:
```sh
cat << EOF | sudo tee /etc/udev/rules.d/30-amdgpu-low-power.rules
SUBSYSTEM=="pci", DRIVER=="amdgpu", ATTR{power_dpm_force_performance_level}="low"
EOF
```

After that, the AMD GPU will use the "low" performance level on each boot.
