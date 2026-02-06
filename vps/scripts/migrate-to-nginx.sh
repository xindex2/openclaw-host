#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}>>> Switching Web Server to Nginx...${NC}"

# 1. Stop and Remove Caddy
echo -e "${GREEN}>>> Removing Caddy...${NC}"
systemctl stop caddy || true
systemctl disable caddy || true
apt-get remove -y caddy || true

# 2. Install Nginx
echo -e "${GREEN}>>> Installing Nginx...${NC}"
apt-get update
apt-get install -y nginx

# 3. Configure Nginx
echo -e "${GREEN}>>> Configuring Nginx...${NC}"
# Copy our config to sites-available
cp /opt/openclaw-host/openclaw.nginx /etc/nginx/sites-available/openclaw

# Enable it (symlink to sites-enabled)
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/

# 4. Restart Nginx
systemctl restart nginx

# 5. Allow Firewall
echo -e "${GREEN}>>> Configuring Firewall...${NC}"
ufw allow 'Nginx Full'
ufw reload || true

echo -e "${GREEN}>>> Migration Complete!${NC}"
echo "Nginx is now serving your site on Port 80."
echo "Ensure Cloudflare SSL is set to 'Flexible' or 'Full' (if you add certs later)."
