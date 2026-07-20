#!/bin/bash
set -euo pipefail

APP_NAME="web-ticketing-staging"
APP_DIR="/var/www/stag.genreklaten.web.id"
BRANCH="staging"

echo "===== Deploying to STAGING ====="

# 1. Pull latest code
echo "[1] Pulling latest $BRANCH branch..."
git checkout $BRANCH
git pull origin $BRANCH

# 2. Install dependencies
echo "[2] Installing dependencies..."
npm ci --legacy-peer-deps

# 3. Generate Prisma client
echo "[3] Generating Prisma client..."
npx prisma generate

# 4. Run database migrations
echo "[4] Running migrations..."
dotenv -e .env.staging -- npx prisma migrate deploy

# 5. Build application (skip ESLint for CI/CD)
echo "[5] Building application..."
export DISABLE_ESLINT_PLUGIN=true
dotenv -e .env.staging -- npm run build

# 6. Restart PM2 process
echo "[6] Restarting PM2 process..."
pm2 startOrReload ecosystem.config.js --only $APP_NAME

echo "===== Deploy to STAGING complete ====="