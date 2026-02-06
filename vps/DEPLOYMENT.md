# 🚀 OpenClaw Host - Production Server Deployment Guide

Complete guide to deploy OpenClaw Host on a production server.

## 📋 Prerequisites

### Server Requirements
- Ubuntu 20.04 or 22.04 LTS (recommended)
- Minimum 4GB RAM (8GB recommended)
- 2+ CPU cores
- 50GB+ storage
- Public IP address
- Root or sudo access

### Domain Setup
- Domain name (e.g., `openclaw-host.com`)
- DNS access to configure A records and wildcard subdomain

### Required Software
- Docker & Docker Compose
- Git
- Node.js 18+ (for development/building)

---

## 🔧 Step 1: Server Preparation

### 1.1 Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
```

### 1.3 Install Docker Compose

```bash
# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

### 1.4 Install Git

```bash
sudo apt install git -y
git --version
```

---

## 📦 Step 2: Clone and Setup Project

### 2.1 Clone Repository

```bash
# Navigate to your preferred directory
cd /opt

# Clone the repository
sudo git clone https://github.com/xindex2/openclaw-host.git

# Change ownership to your user
sudo chown -R $USER:$USER openclaw-host

# Navigate into directory
cd openclaw-host
```

### 2.2 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

**Important variables to configure:**

```env
# Database - CHANGE THESE!
DB_NAME=openclaw_host
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# JWT Secret - CHANGE THIS!
JWT_SECRET=YOUR_RANDOM_SECRET_KEY_HERE

# Domain Configuration
BASE_DOMAIN=openclaw-host.com
PROTOCOL=https

# Email for Let's Encrypt SSL
ACME_EMAIL=your-email@example.com

# Environment
NODE_ENV=production
```

**Generate secure random secrets:**

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate database password
openssl rand -base64 32
```

---

## 🌐 Step 3: DNS Configuration

Configure your domain's DNS records:

### A Records

```
openclaw-host.com       →  YOUR_SERVER_IP
*.openclaw-host.com     →  YOUR_SERVER_IP
```

**Example for common DNS providers:**

**Cloudflare / Namecheap / GoDaddy:**
- Type: `A`
- Name: `@`
- Value: `YOUR_SERVER_IP`
- TTL: Automatic or 3600

- Type: `A`
- Name: `*`
- Value: `YOUR_SERVER_IP`
- TTL: Automatic or 3600

**Verify DNS propagation:**

```bash
# Check main domain
dig openclaw-host.com

# Check wildcard
dig test.openclaw-host.com
```

Wait 5-10 minutes for DNS to propagate globally.

---

## 🔨 Step 4: Build and Deploy (Host Method - Recommended)

For maximum reliability and easier SSL management on a single VPS, we recommend running the Backend on the host via PM2 and using Caddy as the reverse proxy.

> [!WARNING]
> Do not run the production Docker Compose setup (`docker-compose.prod.yml`) and the PM2 host setup simultaneously. They will conflict on ports 80, 443, and 5432.

### 4.1 Install Caddy
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 4.2 Start Backend and Frontend
```bash
# Build Frontend
npm run build --workspace=frontend

# Start Backend with PM2
pm2 start ecosystem.config.cjs
pm2 save
```

### 4.3 Configure Caddy
```bash
# Apply Caddyfile configuration
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

### 4.4 Initialize Database
The database schema syncs automatically on backend startup. To verify your tables:
```bash
sudo -u postgres psql -d openclaw_host -c "\dt"
```
You should see: `users`, `instances`, `subscriptions`, `activity_logs`.

---

## 🔐 Step 5: SSL Certificate Setup

Traefik automatically obtains SSL certificates from Let's Encrypt.

### Verify SSL

1. Wait 2-3 minutes for Traefik to obtain certificates
2. Visit `https://openclaw-host.com`
3. Check for valid SSL certificate (🔒 in browser)

### Check Caddy Logs
```bash
journalctl -xeu caddy.service --no-pager | tail -n 20
```

---

## 🔍 Step 6: Verification

### 6.1 Test Application
1. **Visit Main Site:** `https://openclaw-host.com`
2. **Register & Login**
3. **Create Instance** and **Open Terminal**

### 6.2 Health Checks
```bash
curl https://openclaw-host.com/api/health
```

---

## 📊 Step 8: Monitoring & Maintenance

### View Logs
```bash
# Backend logs
pm2 logs openclaw-backend

# Caddy logs
journalctl -u caddy -f
```

### Restart Services
```bash
# Restart Backend
pm2 restart openclaw-backend

# Restart Caddy
sudo systemctl restart caddy
```

### Update Application
```bash
bash update.sh
```

### Backup Database
```bash
sudo -u postgres pg_dump openclaw_host > backup_$(date +%Y%m%d).sql
```

---

## 🐛 Troubleshooting

### Issue: 404 Page Not Found
**Solution:** Check Caddy's configuration and ensure the `dist` folder exists.
```bash
caddy validate --config Caddyfile
ls -l /home/ubuntu/vps/frontend/dist
```

### Issue: Database Connection Failed
**Solution:** Ensure the `openclaw` role exists and the password in `.env` is correct.
```bash
sudo -u postgres psql -c "\du"
```

---

## ✅ Quick Reference Commands

```bash
# Start all
pm2 start ecosystem.config.cjs
sudo systemctl restart caddy

# View logs
pm2 logs
journalctl -u caddy -f

# Update
git pull && bash update.sh
```

---

## 🎉 Success!

Your OpenClaw Host platform is now running in production! 

**Next Steps:**
1. ✅ Visit your domain and create an account
2. ✅ Create your first OpenClaw instance
3. ✅ Install OpenClaw via terminal
4. ✅ Share with users!

**Support:**
- GitHub Issues: https://github.com/xindex2/openclaw-host/issues
- Documentation: Check README.md

---

**Deployed successfully! 🦞🚀**
