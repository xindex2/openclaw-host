# 🚀 Migration & Backup Guide

This guide explains how to back up your OpenClaw Host platform and move it to a completely new server while preserving all users, agents, and data.

---

## 📦 Phase 1: On the OLD Server (Backup)

### 1. Stop the Services
To ensure data consistency during the backup:
```bash
pm2 stop all
```

### 2. Backup the Database
Dump the PostgreSQL database to a file:
```bash
# Defaults: DB_NAME=openclaw_host, DB_USER=postgres
pg_dump -U postgres -d openclaw_host > openclaw_backup.sql
```
*(You may be prompted for the database password.)*

### 3. Backup Agent Data
Agents store their state (sessions, media, logs) in `/opt/openclaw-instances`. Compress this directory:
```bash
sudo tar -czvf agents_data_backup.tar.gz /opt/openclaw-instances
```

### 4. Backup Configuration & Code
Download the `.env` file and any custom logs if needed.
```bash
# Don't forget your .env secrets!
cp .env env_backup
```

---

## 🚚 Phase 2: Moving Files
Transfer these files to your **NEW server** using `scp` or SFTP:
- `openclaw_backup.sql`
- `agents_data_backup.tar.gz`
- `env_backup`

---

## 🛠️ Phase 3: On the NEW Server (Restore)

### 1. Prerequisites
Follow the basic installation steps on the new server:
- Install **Node.js 20+**
- Install **Docker**
- Install **PostgreSQL**
- Install **PM2**: `npm install -g pm2`

### 2. Prepare the Code
Clone your repository and install dependencies:
```bash
git clone <your-repo-url> vps
cd vps
npm install
cd frontend && npm install && npm run build && cd ..
```

### 3. Restore the Database
Create the database and restore the dump:
```bash
# Create the database first
sudo -u postgres psql -c "CREATE DATABASE openclaw_host;"

# Restore the dump
sudo -u postgres psql openclaw_host < /path/to/openclaw_backup.sql
```

### 4. Restore Agent Data
Recreate the data directory and extract:
```bash
sudo mkdir -p /opt/openclaw-instances
sudo tar -xzvf agents_data_backup.tar.gz -C /
# Ensure the permissions allow the backend to read/write
sudo chmod -R 777 /opt/openclaw-instances
```

### 5. Final Setup
Restore your `.env` file and update any new IP addresses or domains:
```bash
cp env_backup .env
nano .env  # Update BASE_DOMAIN, BACKEND_URL, etc.
```

### 6. Start the App
```bash
pm2 start ecosystem.config.js # or your usual start command
# Or simply:
pm2 start src/server.js --name "openclaw-backend"
```

---

## 🔍 Verification
1. Log in to your new dashboard.
2. Verify all your previous agents are listed.
3. Start an agent and check the terminal to ensure its data (WhatsApp sessions) persists.
