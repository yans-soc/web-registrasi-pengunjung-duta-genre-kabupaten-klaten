#!/bin/bash
set -euo pipefail

APP_NAME="web-ticketing-prod"
APP_DIR="/var/www/genreklaten.web.id"
BRANCH="main"

echo "===== Deploying to PRODUCTION ====="

# 1. Pull latest code (force reset to avoid conflicts)
echo "[1] Pulling latest $BRANCH branch..."
git fetch origin
git checkout -f $BRANCH
git reset --hard origin/$BRANCH

# 2. Install dependencies
echo "[2] Installing dependencies..."
npm install --legacy-peer-deps

# 3. Generate Prisma client
echo "[3] Generating Prisma client..."
npx prisma generate

# 4. Sync database schema
echo "[4] Syncing database schema..."
npx dotenv-cli -e .env.production -- npx prisma db push

# 5. Build application
echo "[5] Building application..."
npx dotenv-cli -e .env.production -- npm run build

# 6. Restart PM2 process
echo "[6] Restarting PM2 process..."
pm2 startOrReload ecosystem.config.js --only $APP_NAME

# 7. Reload Nginx configuration
echo "[7] Reloading Nginx..."
systemctl reload nginx || true

echo "===== Deploy to PRODUCTION complete ====="
