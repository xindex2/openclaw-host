#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting OpenClaw Host Update...${NC}"

# Check for .git directory
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository. Please run this from the project root.${NC}"
    exit 1
fi

# 1. Pull latest code
echo -e "${BLUE}📥 Pulling latest code from GitHub...${NC}"
git pull origin main

# 2. Install dependencies
echo -e "${BLUE}📦 Installing host dependencies...${NC}"
npm install

# 3. Build frontend
echo -e "${BLUE}🏗️ Rebuilding frontend...${NC}"
rm -rf frontend/dist
npm run build --workspace=frontend

# 4. Restart services via PM2
if command -v pm2 &> /dev/null; then
    echo -e "${BLUE}🔄 Restarting backend services...${NC}"
    # Stop any old/mismatched processes to avoid port conflicts
    pm2 delete openclaw-backend openclaw 2>/dev/null || true
    pm2 start ecosystem.config.cjs
else
    echo -e "${RED}⚠️ PM2 not found. Skipping restart. Please restart the backend manually.${NC}"
fi

echo -e "${GREEN}✅ Update complete! The Admin area should now be updated.${NC}"
echo -e "${BLUE}Check logs with: pm2 log openclaw-backend${NC}"
