#!/bin/bash
set -e

echo "🚀 Deploying latest changes to OpenClaw Host..."

# Go to project root (directory of this script)
cd "$(dirname "$0")"

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "🔨 Rebuilding backend with updated code..."
docker compose -f docker-compose.prod.yml build backend

echo "🔄 Restarting backend container..."
docker compose -f docker-compose.prod.yml restart backend

echo "✅ Deployment complete!"
echo ""
echo "Check logs with: docker compose -f docker-compose.prod.yml logs -f backend"
