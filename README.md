# Web Ticketing - Registrasi Pengunjung Duta Genre Klaten 2026

Aplikasi web untuk registrasi dan ticketing pengunjung Duta Genre Klaten berbasis Next.js 15 dengan Prisma ORM dan MySQL/MariaDB.

## Fitur

- Pendaftaran pengunjung (form registrasi + pembuatan QR code)
- Scan QR code untuk check-in
- Dashboard admin (statistik, manajemen pengunjung, admin, setting)
- Scanner QR code admin
- Multi-environment (development, staging, production)

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Bahasa**: TypeScript
- **Database**: MySQL / MariaDB
- **ORM**: Prisma 7
- **Autentikasi**: JWT (jose + jsonwebtoken) + bcryptjs
- **QR Code**: qrcode (generate) + html5-qrcode (scan)
- **UI**: Tailwind CSS + Lucide Icons
- **Deploy**: PM2 + GitHub Actions CI/CD

## Struktur Branch

| Branch | Lingkungan | URL |
|--------|-----------|-----|
| `main` | Production | https://genreklaten.web.id |
| `staging` | Staging | https://stag.genreklaten.web.id |
| `dev` | Development | http://localhost:3000 |

## Persyaratan

- Node.js 20+
- npm
- MySQL 8+ atau MariaDB 11+
- PM2 (untuk production/staging)
- Git

## Setup Pengembangan

### 1. Clone & Install

```bash
git clone <repo-url>
cd web-ticketing
npm install
```

### 2. Setup Environment

Salin file environment sesuai kebutuhan:

```bash
# Development (default)
cp .env.dev .env.local

# Atau gunakan dotenv-cli langsung
npx dotenv -e .env.dev -- next dev
```

### 3. Inisialisasi Database

```bash
# Buat database, lalu migrate
npx dotenv -e .env.dev -- npx prisma migrate dev --name init

# Seed data awal
npx dotenv -e .env.dev -- node prisma/seed.js
```

### 4. Jalankan Development Server

```bash
npm run dev:local
# atau
npx dotenv -e .env.dev -- next dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Environment Files

| File | Lingkungan | Database |
|------|-----------|----------|
| `.env.dev` | Development local | `web_ticketing_duta_genre_dev` |
| `.env.staging` | Staging server | `web_ticketing_duta_genre_staging` |
| `.env.production` | Production server | `web_ticketing_duta_genre` |

### Variable Environment

| Variable | Deskripsi | Contoh |
|----------|-----------|--------|
| `DATABASE_URL` | Koneksi database MySQL/MariaDB | `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Secret key untuk JWT | (string acak) |
| `QR_SECRET` | Secret key untuk sign QR code | (string acak) |
| `NEXT_PUBLIC_APP_URL` | URL publik aplikasi | `https://genreklaten.web.id` |
| `NODE_ENV` | Mode Node.js | `development` / `production` |
| `APP_ENV` | Mode aplikasi (custom) | `development` / `staging` / `production` |

## Scripts NPM

### Development
| Script | Perintah |
|--------|---------|
| `npm run dev` | `next dev` (default env) |
| `npm run dev:local` | Development dengan `.env.dev` |
| `npm run build:dev` | Build untuk development |
| `npm run build:staging` | Build untuk staging |
| `npm run build:prod` | Build untuk production |

### Database
| Script | Perintah |
|--------|---------|
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema ke database |
| `npm run db:migrate:dev` | Migrasi development |
| `npm run db:migrate:staging` | Migrasi staging |
| `npm run db:migrate:prod` | Migrasi production |
| `npm run db:seed:dev` | Seed data development |
| `npm run db:seed:staging` | Seed data staging |
| `npm run db:seed:prod` | Seed data production |

### Deploy
| Script | Perintah |
|--------|---------|
| `npm run deploy:staging` | Deploy ke staging server |
| `npm run deploy:prod` | Deploy ke production server |

## Deploy

### Setup PM2

```bash
npm install -g pm2

# Jalankan aplikasi
pm2 start ecosystem.config.js

# Simpan process list
pm2 save

# Setup startup
pm2 startup
```

### Staging

Push ke branch `staging` akan trigger GitHub Actions untuk:

1. Install dependencies
2. Generate Prisma client
3. Lint & Build
4. Deploy ke server staging via SSH

### Production

Push ke branch `main` akan trigger GitHub Actions untuk:

1. Install dependencies
2. Generate Prisma client
3. Lint & Build
4. Deploy ke server production via SSH

### Deploy Manual

```bash
# Staging
bash deploy-staging.sh

# Production
bash deploy-prod.sh
```

## CI/CD Pipeline

Terdapat 3 workflow GitHub Actions:

| Workflow | Trigger | Action |
|----------|---------|--------|
| `dev.yml` | Push/PR ke `dev` | Lint & Build |
| `staging.yml` | Push ke `staging` | Lint, Build, Deploy ke staging |
| `production.yml` | Push ke `main` | Lint, Build, Deploy ke production |

### Secrets GitHub yang Diperlukan

| Secret | Deskripsi |
|--------|-----------|
| `DATABASE_URL_DEV` | DB URL development |
| `DATABASE_URL_STAGING` | DB URL staging |
| `DATABASE_URL_PROD` | DB URL production |
| `JWT_SECRET_DEV/STAGING/PROD` | JWT secret per env |
| `QR_SECRET_DEV/STAGING/PROD` | QR secret per env |
| `NEXT_PUBLIC_APP_URL_DEV/STAGING/PROD` | App URL per env |
| `STAGING_HOST` | Host server staging |
| `STAGING_USER` | User SSH staging |
| `STAGING_SSH_KEY` | SSH key staging |
| `PROD_HOST` | Host server production |
| `PROD_USER` | User SSH production |
| `PROD_SSH_KEY` | SSH key production |

## Login Admin

Default admin setelah seed:
- **Username**: `superadmin`
- **Password**: `admin123`

> **Peringatan**: Ganti password segera setelah deploy production!

## Lisensi

Hak Cipta © Duta Genre Klaten 2026