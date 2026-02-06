# Migrating OpenClaw Host to Podman

This guide explains how to replace Docker with Podman on your Ubuntu VPS.

## 1. Remove Docker
First, remove the existing Docker installation to avoid conflicts.

```bash
sudo systemctl stop docker
sudo apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo rm -rf /var/lib/docker
```

## 2. Install Podman
Install Podman and the `podman-docker` package (which simulates the `docker` command).

```bash
sudo apt-get update
sudo apt-get install -y podman podman-docker
```

## 3. Enable the Podman Socket
OpenClaw communicates with Podman via a Unix socket. You must enable it.

```bash
# Enable the socket service
sudo systemctl enable --now podman.socket

# Verify it exists
ls -la /run/podman/podman.sock
```

## 4. Install Podman Compose
We need `podman-compose` to run the stack.

```bash
sudo apt-get install -y python3-pip
sudo pip3 install podman-compose
```

## 5. Deployment
Now you can deploy using `podman-compose`.

```bash
cd /opt/openclaw-host
git fetch origin
git reset --hard origin/main

# Build and start
podman-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting
If the backend cannot connect, ensure the socket is accessible:
```bash
sudo chmod 777 /run/podman/podman.sock
```
