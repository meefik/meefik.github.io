---
layout: post
title: How to fix issues with the AMD GPU driver on Debian
date: 2025-09-13 18:00:00 +0000
categories: [amdgpu, debian]
comments: true
---

I have a PC running Debian with an AMD CPU and GPU. Unfortunately, the AMD GPU driver doesn't work well with Debian at the moment. I gathered many issues in this post for myself, and it may be useful for someone else, too.

Currently, my system is Debian 13 with the `6.12.43+deb13-amd64` kernel. To install AMDGPU driver you need to follow [the official AMD documentation](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html).

I use a build of the AMDGPU driver `6.4.3` for Ubuntu Noble that is also compatible with Debian 13 (Trixie):
```
wget https://repo.radeon.com/amdgpu-install/6.4.3/ubuntu/noble/amdgpu-install_6.4.60403-1_all.deb
sudo apt install ./amdgpu-install_6.4.60403-1_all.deb
sudo apt update
sudo apt install "linux-headers-$(uname -r)"
sudo apt install amdgpu-dkms
```

However, the installation did not finish correctly. Next, I will show you how to fix this.

<!--more-->

To fix error you need to do the following steps:

**1.** Create the correct directory for the kernel headers:
```
sudo mkdir -p /usr/src/ofa_kernel/x86_64/
sudo ln -s /usr/src/linux-headers-$(uname -r) /usr/src/ofa_kernel/x86_64/$(uname -r)
```

**2.** Change the current kernel version for AMDGPU driver:
```
uname -r | sudo tee /var/tmp/amdgpu-dkms-kernels
```

**3.** Build the AMDGPU driver for the current kernel:
```
export SRCARCH=x86
sudo dpkg-reconfigure amdgpu-dkms
```

Note that the `SRCARCH=x86` variable fixes [the issue](https://github.com/ROCm/ROCm/issues/5111).

In addition, you can change its performance profile. To do this for a low performance profile:
```
cat << EOF | sudo tee /etc/udev/rules.d/30-amdgpu-low-power.rules
SUBSYSTEM=="pci", DRIVER=="amdgpu", ATTR{power_dpm_force_performance_level}="low"
EOF
```
