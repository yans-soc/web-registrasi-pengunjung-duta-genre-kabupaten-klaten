# Tutorial Lengkap Setup CI/CD Auto Deploy

## Daftar Isi
1. [Persiapan](#persiapan)
2. [Setup Server Staging](#setup-server-staging)
3. [Setup Server Production](#setup-server-production)
4. [Konfigurasi GitHub Secrets](#konfigurasi-github-secrets)
5. [Cara Deploy](#cara-deploy)
6. [Troubleshooting](#troubleshooting)

---

## Persiapan

### Yang Anda Butuhkan:
- ✅ Server VPS (staging & production) dengan akses SSH root
- ✅ Akun GitHub dengan akses ke repository
- ✅ Domain yang sudah diarahkan ke server (opsional)

### Informasi Server:
Catat informasi berikut sebelum mulai:

| Item | Staging | Production |
|------|---------|------------|
| IP Server | `___.___.___.___` | `___.___.___.___` |
| Username SSH | `root` | `root` |
| Port SSH | `22` | `22` |
| Domain | `stag.genreklaten.web.id` | `genreklaten.web.id` |

---

## Setup Server Staging

### Langkah 1: Login ke Server Staging

```bash
ssh root@IP_SERVER_STAGING_ANDA
```

Contoh:
```bash
ssh root@103.123.45.67
```

### Langkah 2: Download Script Setup

```bash
cd /var/www
git clone https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten.git stag.genreklaten.web.id
cd stag.genreklaten.web.id
```

### Langkah 3: Jalankan Script Setup

```bash
sudo bash setup-server.sh
```

Saat diminta, ketik: `staging` lalu tekan Enter.

### Langkah 4: Catat Output Script

Script akan menampilkan informasi penting. **CATAT SEMUA!**

```
==========================================
  Setup Selesai!
==========================================

LANGKAH SELANJUTNYA (PENTING):

1. Copy PUBLIC KEY di bawah ini:

----------------------------------------
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... github-actions-staging
----------------------------------------

2. Buka GitHub repository Anda:
   https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten/settings/secrets/actions

3. Tambahkan secrets berikut:

   - STAGING_HOST: 103.123.45.67
   - STAGING_USERNAME: root
   - STAGING_SSH_KEY: (paste PRIVATE KEY dari /root/.ssh/deploy_key_staging)
   - STAGING_PORT: 22

4. Untuk melihat PRIVATE KEY:
   cat /root/.ssh/deploy_key_staging

==========================================
```

### Langkah 5: Lihat Private Key

```bash
cat /root/.ssh/deploy_key_staging
```

Output akan seperti ini (copy semuanya):
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACB...
...
...
-----END OPENSSH PRIVATE KEY-----
```

**COPY SEMUA ISI FILE TERSEBUT** (dari `-----BEGIN` sampai `-----END`)

---

## Setup Server Production

### Langkah 1: Login ke Server Production

```bash
ssh root@IP_SERVER_PRODUCTION_ANDA
```

### Langkah 2: Download Script Setup

```bash
cd /var/www
git clone -b main https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten.git genreklaten.web.id
cd genreklaten.web.id
```

### Langkah 3: Jalankan Script Setup

```bash
sudo bash setup-server.sh
```

Saat diminta, ketik: `production` lalu tekan Enter.

### Langkah 4: Catat Output & Lihat Private Key

```bash
cat /root/.ssh/deploy_key_prod
```

**COPY SEMUA ISI FILE PRIVATE KEY**

---

## Konfigurasi GitHub Secrets

### Langkah 1: Buka Halaman Secrets

Buka browser, kunjungi:
```
https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten/settings/secrets/actions
```

### Langkah 2: Tambahkan Secret untuk Staging

Klik **"New repository secret"** dan isi:

#### Secret 1: STAGING_HOST
- **Name:** `STAGING_HOST`
- **Value:** IP server staging Anda (contoh: `103.123.45.67`)
- Klik **"Add secret"**

#### Secret 2: STAGING_USERNAME
- **Name:** `STAGING_USERNAME`
- **Value:** `root`
- Klik **"Add secret"**

#### Secret 3: STAGING_SSH_KEY
- **Name:** `STAGING_SSH_KEY`
- **Value:** Paste SELURUH isi private key dari server staging
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  ... (semua isi) ...
  -----END OPENSSH PRIVATE KEY-----
  ```
- Klik **"Add secret"**

#### Secret 4: STAGING_PORT
- **Name:** `STAGING_PORT`
- **Value:** `22`
- Klik **"Add secret"**

### Langkah 3: Tambahkan Secret untuk Production

Ulangi langkah yang sama untuk production:

| Secret Name | Value |
|-------------|-------|
| `PROD_HOST` | IP server production |
| `PROD_USERNAME` | `root` |
| `PROD_SSH_KEY` | Private key dari `/root/.ssh/deploy_key_prod` |
| `PROD_PORT` | `22` |

### Langkah 4: Verifikasi Secrets

Setelah semua ditambahkan, halaman Secrets Anda harus terlihat seperti ini:

```
Repository secrets
├── PROD_HOST
├── PROD_PORT
├── PROD_SSH_KEY
├── PROD_USERNAME
├── STAGING_HOST
├── STAGING_PORT
├── STAGING_SSH_KEY
└── STAGING_USERNAME
```

---

## Cara Deploy

### Deploy ke Staging

```bash
# Di komputer lokal Anda
git checkout staging
git add .
git commit -m "fitur baru untuk testing"
git push origin staging
```

**Otomatis:** GitHub Actions akan menjalankan deploy ke server staging dalam ~2-3 menit.

### Deploy ke Production

```bash
# Di komputer lokal Anda
git checkout main
git merge staging  # Merge dari staging ke main
git push origin main
```

**Otomatis:** GitHub Actions akan menjalankan deploy ke server production dalam ~2-3 menit.

### Monitoring Deploy

Cek status deploy di:
```
https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten/actions
```

---

## Troubleshooting

### Deploy Gagal: "Permission denied (publickey)"

**Penyebab:** SSH key belum ditambahkan ke GitHub Secrets atau format salah.

**Solusi:**
1. Pastikan Anda copy SELURUH isi private key (dari `-----BEGIN` sampai `-----END`)
2. Pastikan tidak ada spasi tambahan di awal/akhir
3. Re-upload secret di GitHub

### Deploy Gagal: "Connection refused"

**Penyebab:** SSH server tidak berjalan atau port salah.

**Solusi:**
```bash
# Di server, cek SSH
sudo systemctl status sshd

# Jika tidak berjalan
sudo systemctl start sshd
sudo systemctl enable sshd
```

### Deploy Gagal: "No such file or directory"

**Penyebab:** Folder aplikasi belum ada.

**Solusi:**
```bash
# Di server
mkdir -p /var/www/stag.genreklaten.web.id
# atau
mkdir -p /var/www/genreklaten.web.id
```

### Aplikasi Error Setelah Deploy

**Cek logs:**
```bash
# Di server
pm2 logs web-ticketing-staging   # untuk staging
pm2 logs web-ticketing-prod      # untuk production
```

**Restart manual:**
```bash
pm2 restart web-ticketing-staging
# atau
pm2 restart web-ticketing-prod
```

### Database Migration Error

**Jalankan manual:**
```bash
cd /var/www/stag.genreklaten.web.id
dotenv -e .env.staging -- npx prisma migrate deploy

# atau untuk production
cd /var/www/genreklaten.web.id
dotenv -e .env.production -- npx prisma migrate deploy
```

---

## Checklist Akhir

- [ ] Server staging sudah di-setup dengan `setup-server.sh`
- [ ] Server production sudah di-setup dengan `setup-server.sh`
- [ ] Private key staging sudah ditambahkan ke GitHub Secrets (`STAGING_SSH_KEY`)
- [ ] Private key production sudah ditambahkan ke GitHub Secrets (`PROD_SSH_KEY`)
- [ ] IP server staging sudah ditambahkan (`STAGING_HOST`)
- [ ] IP server production sudah ditambahkan (`PROD_HOST`)
- [ ] Username sudah ditambahkan (`STAGING_USERNAME`, `PROD_USERNAME`)
- [ ] Port sudah ditambahkan (`STAGING_PORT`, `PROD_PORT`)
- [ ] Test deploy ke staging berhasil
- [ ] Test deploy ke production berhasil

---

## Bantuan Lebih Lanjut

Jika mengalami masalah:
1. Cek GitHub Actions logs: https://github.com/yans-soc/web-registrasi-pengunjung-duta-genre-kabupaten-klaten/actions
2. Cek PM2 logs di server: `pm2 logs`
3. Cek SSH connection: `ssh -v root@IP_SERVER`