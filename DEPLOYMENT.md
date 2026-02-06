# Deploying zakibot on Ubuntu 22.04

This guide provides a step-by-step walkthrough for setting up **zakibot** (Nanobot + SaaS Platform) on a fresh Ubuntu 22.04 server.

## 1. Prerequisites & System Update

First, update your system and install essential build tools.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential python3-pip python3-venv
```

## 2. Install Node.js (v18+)

The SaaS platform requires Node.js. We recommend using NodeSource for the latest LTS.

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

## 3. Clone the Repository

```bash
git clone https://github.com/xindex2/zakibot.git
cd zakibot
```

## 4. Setup Nanobot (Python Backend)

Create a virtual environment and install the dependencies, including Playwright for Browser Skills.

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install nanobot in editable mode
pip install -e .

# Install Browser Skill dependencies
pip install playwright
playwright install-deps
playwright install chromium
```

## 5. Setup the SaaS Platform (Next.js)

Navigate to the platform directory and install the web dependencies.

```bash
cd platform
npm install

# Initialize the database
npx prisma migrate dev --name init
```

## 6. Configure Environment Variables

Create a `.env` file for the platform. This is required for Prisma to find the database.

```bash
# Make sure you are in the platform directory
cd ~/zakibot/platform

# Create the .env file
echo 'DATABASE_URL="file:./dev.db"' > .env
```

> **Troubleshooting**: If you see "Missing required environment variable: DATABASE_URL", double check that the `.env` file exists in `platform/.env` and contains the line above.

## 7. Launching the Services

For production, we recommend using **PM2** to keep your services running.

```bash
# Install PM2
sudo npm install -g pm2

# Start the SaaS Platform
pm2 start npm --name "zakibot-platform" -- run dev -- --port 3000

# Verify status
pm2 status
```

## 8. Nginx Reverse Proxy (Optional but Recommended)

To access your platform via a domain on port 80/443:

```bash
sudo apt install -y nginx
```

Create a configuration: `/etc/nginx/sites-available/zakibot`
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/zakibot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 9. Usage

1. Open your browser and navigate to `http://your-server-ip:3000` (or your domain).
2. Register a new user.
3. Configure your **API Keys** (OpenRouter, OpenAI, etc.) in the dashboard.
4. Launch your bot instance!

---
**Note**: Ensure your firewall (UFW) allows traffic on the required ports (3000, 80, 443).
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
```
