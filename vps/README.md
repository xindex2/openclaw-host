# 🦞 OpenClaw Host

A SaaS platform that allows users to register and get their own hosted OpenClaw instances with web-based terminal access and automated provisioning.

![OpenClaw Host](https://img.shields.io/badge/OpenClaw-Host-purple?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

## ✨ Features

- 🚀 **One-Click Deployment** - Create OpenClaw instances instantly
- 💻 **Web Terminal** - Full shell access through your browser
- 🔒 **Isolated Containers** - Each user gets their own Docker container
- 🌐 **Custom Subdomains** - Unique URL for each instance (e.g., `username.openclaw-host.com`)
- 💾 **Persistent Storage** - Data persists across container restarts
- 🤖 **Multi-Instance Support** - Run multiple OpenClaw agents simultaneously
- 🎨 **Modern UI** - Beautiful, responsive interface with glassmorphism design

## 🏗️ Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- Docker + Dockerode
- Socket.io
- JWT Authentication

**Frontend:**
- React + Vite
- xterm.js for web terminal
- Modern CSS with custom design system

**Infrastructure:**
- PM2 (process manager)
- Caddy (web server & SSL)
- Node.js (Backend)
- React (Frontend)
- PostgreSQL & Redis

## 📦 Fresh Server Installation (Ubuntu/Debian)

Follow these steps to deploy OpenClaw Host using PM2 and Caddy.

### 1. System Preparation
Update your package list and install basic utilities:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget tar zip unzip build-essential
```

### 3. Install Caddy (Web Server & SSL)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

### 3. Install Node.js & PM2
We recommend using NVM to manage Node versions:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
npm install -g pm2
```

### 4. Setup PostgreSQL
Create the database and user:
```bash
sudo -u postgres psql -c "CREATE USER openclaw WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "CREATE DATABASE openclaw_host OWNER openclaw;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE openclaw_host TO openclaw;"
```

### 5. Clone & Install OpenClaw Host
```bash
git clone https://github.com/your-username/openclaw-host.git vps
cd vps
npm install
```

### 6. Configuration
Create your `.env` file and fill in your details:
```bash
cp .env.example .env
nano .env
```
Key values to set:
- `DB_PASSWORD`: The password you set in step 4.
- `BASE_DOMAIN`: Your domain (e.g., `openclaw.com`).
- `GOOGLE_CLIENT_ID/SECRET`: For Google login.
- `WHOP_API_KEY`: For subscription management.

### 7. Start Services
```bash
# Start Backend
pm2 start ecosystem.config.cjs
pm2 save

# Setup Caddy Frontend
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

---

## 🔑 Admin User Setup

By default, all new registrations have the `user` role. To promote yourself to Admin:

1. **Register** an account through the website UI.
2. **Open the Database Console** on your server:
   ```bash
   sudo -u postgres psql -d openclaw_host
   ```
3. **Run the Promotion Command**:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   \q
   ```
4. **Log in again**. You will now see the "Admin" icon in the top header and have access to:
   - User Management
   - Agent Management
   - System Maintenance & Updates
   - Subscription Plan Config

---

## 🔧 Usage & Monitoring

### Environment Variables

Key environment variables in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=openclaw_host
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Domain
BASE_DOMAIN=openclaw-host.com
PROTOCOL=https

# Docker
DOCKER_SOCKET=/var/run/docker.sock
\`\`\`

### Database Schema

The database is automatically initialized with the following tables:
- `users` - User accounts
- `instances` - OpenClaw container instances
- `subscriptions` - User subscription plans
- `activity_logs` - Activity tracking

## 📖 Usage

### Creating an Instance

1. Register or login to your account
2. Click "New Instance" on the dashboard
3. Choose a subdomain (e.g., `mybot`)
4. Click "Create Instance"
5. Wait for the container to start
6. Click "Open Terminal"

### Installing OpenClaw

In the web terminal, run:

\`\`\`bash
curl -fsSL https://openclaw.ai/install.sh | bash
\`\`\`

Follow the onboarding prompts to:
- Add your API keys (Anthropic, OpenAI, etc.)
- Configure your preferred chat platform (WhatsApp, Telegram, etc.)
- Set up your OpenClaw personality

### Managing Instances

- **Start/Stop** - Control instance lifecycle
- **Terminal Access** - Full shell access via browser
- **View Logs** - Check container logs
- **Delete** - Remove instances permanently

## 🏭 Production Deployment

### Docker Compose Production

1. **Build production images:**
   \`\`\`bash
   docker-compose -f docker-compose.prod.yml build
   \`\`\`

2. **Start services:**
   \`\`\`bash
   docker-compose -f docker-compose.prod.yml up -d
   \`\`\`

### SSL/TLS Setup

Configure Traefik with Let's Encrypt for automatic SSL certificates. Update `traefik/traefik.yml` with your email:

\`\`\`yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your@email.com
      storage: /letsencrypt/acme.json
\`\`\`

### DNS Configuration

Set up wildcard DNS for your domain:

\`\`\`
*.openclaw-host.com  →  YOUR_SERVER_IP
openclaw-host.com    →  YOUR_SERVER_IP
\`\`\`

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting on API endpoints
- Helmet.js for security headers
- Container isolation
- Resource limits per container

## 🚀 API Documentation

### Authentication

**Register:**
\`\`\`
POST /api/auth/register
{
  "username": "string",
  "email": "string",
  "password": "string"
}
\`\`\`

**Login:**
\`\`\`
POST /api/auth/login
{
  "email": "string",
  "password": "string"
}
\`\`\`

### Instances

**Create Instance:**
\`\`\`
POST /api/instances
Authorization: Bearer <token>
{
  "subdomain": "string"
}
\`\`\`

**List Instances:**
\`\`\`
GET /api/instances
Authorization: Bearer <token>
\`\`\`

**Start Instance:**
\`\`\`
POST /api/instances/:id/start
Authorization: Bearer <token>
\`\`\`

## 💾 Backup & Migration

To move OpenClaw Host to a new server or take a backup, please refer to the [Migration Guide](file:///Users/pro/Desktop/vps/MIGRATION.md).

Quick Backup Commands:
- **Database**: `pg_dump -U postgres -d openclaw_host > openclaw_backup.sql`
- **Agent Data**: `sudo tar -czvf agents_data_backup.tar.gz /opt/openclaw-instances`

## 🎨 Design System

The application uses a custom design system with:
- Vibrant color palette
- Gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Dark theme optimized
- Responsive design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

- [OpenClaw](https://openclaw.ai) - The amazing AI assistant
- xterm.js - Web terminal emulation
- Docker - Container platform

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Join our community Discord

---

**Built with ❤️ for the OpenClaw community** 🦞
