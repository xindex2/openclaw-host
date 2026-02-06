#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}>>> STARTING FULL SYSTEM AUDIT & REPAIR...${NC}"

# 1. Network & Firewall Audit
echo -e "${GREEN}>>> Auditing Network & Firewall...${NC}"
sudo ufw disable || true
sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -F
sudo iptables -X
echo -e "${GREEN}✅ Firewall wide open for testing.${NC}"

# 2. Cleanup Conflicting Services
echo -e "${GREEN}>>> Killing zombie services...${NC}"
sudo systemctl stop caddy apache2 2>/dev/null || true
sudo systemctl disable caddy apache2 2>/dev/null || true
sudo killall caddy apache2 2>/dev/null || true
sudo systemctl stop nginx
echo -e "${GREEN}✅ Network cleared.${NC}"

# 3. Database Audit
echo -e "${GREEN}>>> Auditing Database...${NC}"
# Ensure PG is running
sudo systemctl start postgresql
# Try to init DB
cd /opt/openclaw-host/backend
# We use sudo -u postgres because we don't know the user's password settings
sudo -u postgres psql -c "CREATE USER openclaw WITH PASSWORD 'openclaw_password';" || true
sudo -u postgres psql -c "CREATE DATABASE openclaw OWNER openclaw;" || true
# Run init script if it exists
if [ -f src/db/init.sql ]; then
    sudo -u postgres psql -d openclaw -f src/db/init.sql || echo "DB already initialized"
fi
# CRITICAL: Grant permissions in case they were created by root/postgres
sudo -u postgres psql -d openclaw -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO openclaw;"
sudo -u postgres psql -d openclaw -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO openclaw;"
echo -e "${GREEN}✅ Database ready.${NC}"

# 4. Frontend Audit
echo -e "${GREEN}>>> Auditing Frontend (Building)...${NC}"
cd /opt/openclaw-host/frontend
rm -rf dist
npm install --no-audit
npm run build
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build FAILED!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend built at /opt/openclaw-host/frontend/dist${NC}"

# 5. Nginx Configuration Audit
echo -e "${GREEN}>>> Applying Robust Nginx Config...${NC}"
cat <<EOF | sudo tee /etc/nginx/sites-available/openclaw
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /opt/openclaw-host/frontend/dist;
    index index.html;

    # Gzip for speed
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/openclaw /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
echo -e "${GREEN}✅ Nginx Audit Complete.${NC}"

# 6. Backend Audit
echo -e "${GREEN}>>> Auditing Backend (PM2)...${NC}"
cd /opt/openclaw-host
pm2 delete all || true
pm2 start ecosystem.config.cjs
pm2 save
echo -e "${GREEN}✅ PM2 Audit Complete.${NC}"

echo -e "\n${GREEN}===============================================${NC}"
echo -e "${GREEN}        AUDIT & REPAIR COMPLETE! 🦞${NC}"
echo -e "${GREEN}===============================================${NC}"
echo -e "1. Visit http://$(curl -s ifconfig.me) (Direct IP)"
echo -e "2. Check Cloudflare is set to 'FLEXIBLE'"
echo -e "3. Purge Cloudflare Cache"
echo -e "===============================================\n"
