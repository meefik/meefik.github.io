---
layout: post
title: How to fix issues with the AMD GPU driver on Debian
description: A guide to resolving common installation and runtime issues with the AMDGPU driver on Debian systems.
date: 2025-09-13 18:00:00 +0000
categories: [amdgpu, linux]
comments: true
---

I have a PC running Debian with an AMD CPU and GPU. Unfortunately, the AMDGPU driver doesn't work well with Debian at the moment. I gathered many issues in this post for myself, and it may be useful for someone else, too.

Currently, my system is Debian 13 with the `6.12.43+deb13-amd64` kernel. To install AMDGPU driver you need to follow [the official AMD documentation](https://rocm.docs.amd.com/projects/install-on-linux/en/latest/install/quick-start.html).

I use a build of the AMDGPU driver `6.4.3` for Ubuntu Noble that is also compatible with Debian 13 (Trixie):
```sh
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

```sh
sudo mkdir -p /usr/src/ofa_kernel/x86_64/
sudo ln -s /usr/src/linux-headers-$(uname -r) /usr/src/ofa_kernel/x86_64/$(uname -r)
```

I suppose this step isn't required for the latest updates.

**2.** Change the current kernel version for AMDGPU driver:

```sh
uname -r | sudo tee /var/tmp/amdgpu-dkms-kernels
```

Note that this file allows you to specify multiple kernel versions.

**3.** Build the AMDGPU driver for the current kernel:
```sh
sudo SRCARCH=x86 dpkg-reconfigure amdgpu-dkms
```

Note that the `SRCARCH=x86` variable fixes [the issue](https://github.com/ROCm/ROCm/issues/5111).

These issues seem to be fixed in the latest AMDGPU driver versions (at least in `30.20`), but if you see errors such as `[drm:amdgpu_job_submit [amdgpu]] *ERROR* Trying to push to a killed entity` in `dmesg` and experience freezing when running GPU-intensive applications, apply the following patch from [this thread](https://lists.freedesktop.org/archives/amd-gfx/2025-October/133019.html):
```diff
diff -ru a/amd/amdgpu/amdgpu_cs.c b/amd/amdgpu/amdgpu_cs.c
--- a/amd/amdgpu/amdgpu_cs.c    2025-11-15 11:13:37.413447898 +0100
+++ b/amd/amdgpu/amdgpu_cs.c    2025-11-15 11:18:47.935944494 +0100
@@ -1235,9 +1235,6 @@
                }
        }
 
-       if (!amdgpu_vm_ready(vm))
-               return -EINVAL;
-
        r = amdgpu_vm_clear_freed(adev, vm, NULL);
        if (r)
                return r;
diff -ru a/amd/amdgpu/amdgpu_gem.c b/amd/amdgpu/amdgpu_gem.c
--- a/amd/amdgpu/amdgpu_gem.c   2025-11-15 11:13:37.413621094 +0100
+++ b/amd/amdgpu/amdgpu_gem.c   2025-11-15 11:19:43.546149807 +0100
@@ -433,11 +433,9 @@
 
        amdgpu_vm_bo_del(adev, bo_va);
        amdgpu_vm_bo_update_shared(bo);
-       if (!amdgpu_vm_ready(vm))
-               goto out_unlock;
 
        r = amdgpu_vm_clear_freed(adev, vm, &fence);
-       if (unlikely(r < 0))
+       if (unlikely(r < 0 && r != -EINVAL))
                dev_err(adev->dev, "failed to clear page "
                        "tables on GEM object close (%ld)\n", r);
        if (r || !fence)
@@ -447,7 +445,7 @@
        dma_fence_put(fence);
 
 out_unlock:
-       if (r)
+       if (r && r != -EINVAL)
                dev_err(adev->dev, "leaking bo va (%ld)\n", r);
        drm_exec_fini(&exec);
 }
@@ -913,9 +911,6 @@
        struct amdgpu_vm *vm = &fpriv->vm;
        int r;
 
-       if (!amdgpu_vm_ready(vm))
-               return fence;
-
        r = amdgpu_vm_clear_freed(adev, vm, &fence);
        if (r)
                goto error;
diff -ru a/amd/amdgpu/amdgpu_vm.c b/amd/amdgpu/amdgpu_vm.c
--- a/amd/amdgpu/amdgpu_vm.c    2025-11-15 11:13:37.413907925 +0100
+++ b/amd/amdgpu/amdgpu_vm.c    2025-11-15 11:15:41.639781692 +0100
@@ -1598,6 +1598,8 @@
        struct amdgpu_sync sync;
        int r;
 
+       if (!amdgpu_vm_ready(vm))
+               return -EINVAL;
 
        /*
         * Implicitly sync to command submissions in the same VM before
```

After install `amdgpu-dkms`, the source code is located in `/usr/src/amdgpu-x.x.x/`. To apply this patch, save it to a file named `/usr/src/amdgpu-fix.patch` and run:
```sh
cd /usr/src
sudo patch -p1 -d amdgpu-x.x.x/ < amdgpu-fix.patch
```

After applying the patch, rebuild the AMDGPU driver:
```sh
sudo dpkg-reconfigure amdgpu-dkms
```

After completing these steps, reboot your system. The AMDGPU driver should now work correctly.
