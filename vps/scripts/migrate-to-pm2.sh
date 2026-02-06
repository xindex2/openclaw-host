#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}WARNING: This script will install system services on your Host OS.${NC}"
echo -e "${GREEN}It is intended for a CLEAN Ubuntu 22.04 server.${NC}"
echo "Press CTRL+C to cancel within 5 seconds..."
sleep 5

# 1. Stop and remove Docker/Podman
echo -e "${GREEN}>>> Cleaning up Container Engines...${NC}"
systemctl stop docker podman || true
systemctl disable docker podman || true
apt-get purge -y docker-ce docker-ce-cli containerd.io podman podman-docker || true
rm -rf /var/lib/docker /var/lib/containers || true

# 2. Install Dependencies
echo -e "${GREEN}>>> Installing Host Dependencies...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y curl wget git build-essential python3 postgresql postgresql-contrib redis-server debian-keyring debian-archive-keyring apt-transport-https

# 3. Install Node.js 22 (The "Environment" for all bots)
echo -e "${GREEN}>>> Installing Node.js 22...${NC}"
# aggressive cleanup of old node/libnode packages that conflict
apt-get remove -y libnode-dev nodejs nodejs-doc || true
apt-get autoremove -y || true

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# 4. Install Global Tools (The "Image" contents)
echo -e "${GREEN}>>> Installing OpenClaw CLI...${NC}"
npm install -g openclaw pm2

# 5. Configure Database
echo -e "${GREEN}>>> Configuring PostgreSQL...${NC}"
systemctl start postgresql
# Create DB and User if not exists (ignore error if exists)
sudo -u postgres psql -c "CREATE USER openclaw WITH PASSWORD 'openclaw_password';" || true
sudo -u postgres psql -c "CREATE DATABASE openclaw OWNER openclaw;" || true

# 6. Configure Redis
echo -e "${GREEN}>>> Configuring Redis...${NC}"
systemctl enable --now redis-server

# 7. Install Caddy (Web Server)
echo -e "${GREEN}>>> Installing Caddy...${NC}"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Configure Caddy
echo -e "${GREEN}>>> Configuring Caddy...${NC}"
cp /opt/openclaw-host/Caddyfile.pm2 /etc/caddy/Caddyfile
# Reload Caddy to apply changes
systemctl reload caddy || systemctl restart caddy

# 8. Setup Application
echo -e "${GREEN}>>> Setting up Application...${NC}"
mkdir -p /opt/openclaw-instances
chown -R $USER:$USER /opt/openclaw-instances

# Build Backend
cd /opt/openclaw-host/backend
npm install
# Rebuild node-pty for the host architecture
cd node_modules/node-pty && npm run install && cd ../..

# Build Frontend
cd /opt/openclaw-host/frontend
npm install
npm run build

echo -e "${GREEN}>>> Migration Complete!${NC}"
echo "Now run: pm2 start ecosystem.config.cjs"
