#!/bin/bash
set -euo pipefail

# Script untuk setup server (staging & production)
# Jalankan script ini SEKALI di server Anda

echo "=========================================="
echo "  Server Setup for CI/CD Auto Deploy"
echo "=========================================="
echo ""

# Warna untuk output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Cek apakah script dijalankan sebagai root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: Script ini harus dijalankan sebagai root (sudo)${NC}"
  echo "Jalankan: sudo bash setup-server.sh"
  exit 1
fi

# Input dari user
read -p "Masukkan environment (staging/production): " ENV
if [[ "$ENV" != "staging" && "$ENV" != "production" ]]; then
  echo -e "${RED}Error: Environment harus 'staging' atau 'production'${NC}"
  exit 1
fi

# Set variabel berdasarkan environment
if [ "$ENV" = "staging" ]; then
  APP_DIR="/var/www/stag.genreklaten.web.id"
  APP_NAME="web-ticketing-staging"
  BRANCH="staging"
  DEPLOY_KEY_NAME="deploy_key_staging"
else
  APP_DIR="/var/www/genreklaten.web.id"
  APP_NAME="web-ticketing-prod"
  BRANCH="main"
  DEPLOY_KEY_NAME="deploy_key_prod"
fi

REPO_URL="git@github.com:yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten.git"

echo ""
echo -e "${YELLOW}Konfigurasi:${NC}"
echo "  Environment: $ENV"
echo "  App Directory: $APP_DIR"
echo "  App Name: $APP_NAME"
echo "  Branch: $BRANCH"
echo ""

# 1. Install dependencies
echo -e "${GREEN}[1/6] Installing system dependencies...${NC}"
apt-get update
apt-get install -y git curl nodejs npm

# Install Node.js versi terbaru jika perlu
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  echo "Installing Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 globally
echo "Installing PM2..."
npm install -g pm2

# Install dotenv-cli globally
echo "Installing dotenv-cli..."
npm install -g dotenv-cli

# 2. Generate SSH Deploy Key
echo -e "${GREEN}[2/6] Generating SSH deploy key...${NC}"
SSH_DIR="/root/.ssh"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

if [ -f "$SSH_DIR/$DEPLOY_KEY_NAME" ]; then
  echo -e "${YELLOW}Deploy key sudah ada. Menggunakan yang existing.${NC}"
else
  ssh-keygen -t ed25519 -C "github-actions-$ENV" -f "$SSH_DIR/$DEPLOY_KEY_NAME" -N ""
  echo -e "${GREEN}Deploy key berhasil dibuat.${NC}"
fi

# 3. Setup SSH config untuk GitHub
echo -e "${GREEN}[3/6] Configuring SSH for GitHub...${NC}"
cat >> "$SSH_DIR/config" << EOF

Host github.com
  HostName github.com
  User git
  IdentityFile $SSH_DIR/$DEPLOY_KEY_NAME
  IdentitiesOnly yes
EOF

chmod 600 "$SSH_DIR/config"

# 4. Clone repository
echo -e "${GREEN}[4/6] Cloning repository...${NC}"
if [ -d "$APP_DIR" ]; then
  echo -e "${YELLOW}Directory $APP_DIR sudah ada. Skipping clone.${NC}"
  cd "$APP_DIR"
  git fetch origin
else
  mkdir -p "$(dirname "$APP_DIR")"
  cd "$(dirname "$APP_DIR")"
  git clone -b "$BRANCH" "$REPO_URL" "$(basename "$APP_DIR")"
  cd "$APP_DIR"
fi

# 5. Setup application
echo -e "${GREEN}[5/6] Setting up application...${NC}"
cd "$APP_DIR"

# Install dependencies
npm ci --only=production

# Generate Prisma client
npx prisma generate

# Create logs directory
mkdir -p logs

# Set permissions
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"

# 6. Setup PM2
echo -e "${GREEN}[6/6] Setting up PM2...${NC}"
pm2 startOrReload ecosystem.config.js --only "$APP_NAME"
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "=========================================="
echo -e "${GREEN}  Setup Selesai!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}LANGKAH SELANJUTNYA (PENTING):${NC}"
echo ""
echo "1. Copy PUBLIC KEY di bawah ini:"
echo ""
echo "----------------------------------------"
cat "$SSH_DIR/$DEPLOY_KEY_NAME.pub"
echo "----------------------------------------"
echo ""
echo "2. Buka GitHub repository Anda:"
echo "   https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten/settings/secrets/actions"
echo ""
echo "3. Tambahkan secrets berikut:"
echo ""
if [ "$ENV" = "staging" ]; then
  echo "   - STAGING_HOST: $(hostname -I | awk '{print $1}')"
  echo "   - STAGING_USERNAME: root"
  echo "   - STAGING_SSH_KEY: (paste PRIVATE KEY dari $SSH_DIR/$DEPLOY_KEY_NAME)"
  echo "   - STAGING_PORT: 22"
else
  echo "   - PROD_HOST: $(hostname -I | awk '{print $1}')"
  echo "   - PROD_USERNAME: root"
  echo "   - PROD_SSH_KEY: (paste PRIVATE KEY dari $SSH_DIR/$DEPLOY_KEY_NAME)"
  echo "   - PROD_PORT: 22"
fi
echo ""
echo "4. Untuk melihat PRIVATE KEY:"
echo "   cat $SSH_DIR/$DEPLOY_KEY_NAME"
echo ""
echo "=========================================="