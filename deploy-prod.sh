#!/bin/bash
set -e

echo "=== Memulai Proses Deployment di Server (genreklaten.web.id) ==="

# 1. Tarik perubahan terbaru dari GitHub
echo "Tarik source code terbaru dari branch main..."
git fetch origin main
git reset --hard origin/main

# 2. Setup environment variables (jika file .env belum ada atau perlu diperbarui)
if [ ! -f .env ]; then
  echo "PERINGATAN: File .env tidak ditemukan! Silakan salin dari .env.production ke .env dan konfigurasi manual."
  if [ -f .env.production ]; then
    cp .env.production .env
    echo "Telah menyalin .env.production ke .env. Silakan periksa kembali nilainya."
  fi
fi

# 3. Instalasi dependensi
echo "Menginstall dependensi Node.js..."
npm install --legacy-peer-deps

# 4. Sinkronisasi Database (Prisma)
echo "Sinkronisasi skema database dengan Prisma..."
npx prisma generate
npx prisma db push --accept-data-loss
echo "Menjalankan database seeding..."
node prisma/seed.js

# 5. Build aplikasi Next.js
echo "Membangun aplikasi untuk mode produksi (Next.js Build)..."
npm run build

# 6. Restart aplikasi menggunakan PM2
echo "Merestart proses aplikasi di PM2..."
if pm2 list | grep -q "web-ticketing"; then
  echo "Merestart proses web-ticketing di PM2..."
  pm2 restart web-ticketing
else
  echo "Memulai proses baru web-ticketing di PM2..."
  pm2 start npm --name "web-ticketing" -- run start:prod
fi

# 7. Simpan konfigurasi PM2
pm2 save

echo "=== Deployment Berhasil Selesai! ==="
