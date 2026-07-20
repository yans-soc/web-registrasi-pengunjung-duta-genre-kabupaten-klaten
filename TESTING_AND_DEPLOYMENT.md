# Alur Kerja Pengujian & Deployment

Dokumen ini menjelaskan alur kerja standar untuk pengembangan, pengujian, dan deployment aplikasi dari lingkungan development hingga production.

## Struktur Branch

Aplikasi ini menggunakan strategi Git Flow sederhana dengan tiga branch utama:

| Branch | Lingkungan | URL | Tujuan |
|---|---|---|---|
| `main` | **Production** | `https://genreklaten.web.id` | Kode stabil yang berjalan untuk pengguna akhir. |
| `staging` | **Staging** | `https://stag.genreklaten.web.id` | Lingkungan pra-produksi untuk User Acceptance Testing (UAT). |
| `dev` | **Development** | `http://localhost:3000` | Branch integrasi utama untuk pengembangan fitur baru. |

---

## Alur Kerja Formal

### Tahap 1: Development (Lokal)

1.  **Buat Branch Fitur**: Selalu buat branch baru dari `dev` untuk setiap fitur atau perbaikan.
    ```bash
    git checkout dev
    git pull origin dev
    git checkout -b feature/nama-fitur-baru
    ```
2.  **Pengembangan Lokal**: Lakukan perubahan kode di branch ini. Gunakan skrip `npm run dev:local` untuk menjalankan server pengembangan dengan koneksi ke database development.
3.  **Pengujian Lokal**: Lakukan pengujian mandiri untuk memastikan fitur berjalan tanpa masalah.
4.  **Commit & Push**: Commit perubahan secara berkala dan push branch fitur ke GitHub.
    ```bash
    git commit -m "feat: Menambahkan fitur X"
    git push origin feature/nama-fitur-baru
    ```
5.  **Pull Request (PR)**: Setelah fitur selesai, buat Pull Request dari branch fitur Anda ke branch `dev`.

### Tahap 2: Integrasi (CI di Branch `dev`)

1.  **Review & Merge**: Tim akan me-review kode pada Pull Request. Setelah disetujui, PR akan di-*merge* ke `dev`.
2.  **Continuous Integration (CI)**: Proses *merge* ini secara otomatis memicu workflow `dev.yml` di GitHub Actions. Workflow ini akan menjalankan:
    *   **Linting**: Memastikan kualitas dan konsistensi kode.
    *   **Build**: Memastikan aplikasi dapat di-build tanpa error.
    *   Jika salah satu langkah gagal, tim akan mendapatkan notifikasi untuk segera memperbaikinya.

### Tahap 3: Staging (UAT & Pra-Produksi)

1.  **Promosi ke Staging**: Ketika satu atau beberapa fitur di `dev` sudah siap untuk pengujian lebih lanjut, *merge* branch `dev` ke `staging`.
    ```bash
    git checkout staging
    git pull origin staging
    git merge dev
    git push origin staging
    ```
2.  **Continuous Deployment (CD)**: Push ke `staging` akan memicu workflow `staging.yml`, yang secara otomatis akan:
    *   Menjalankan `lint` dan `build`.
    *   Men-deploy aplikasi ke server staging.
    *   Menjalankan migrasi database di server staging.
    *   Me-restart aplikasi menggunakan PM2.
3.  **User Acceptance Testing (UAT)**: Tim atau *tester* melakukan pengujian menyeluruh di `https://stag.genreklaten.web.id` untuk memastikan semua berfungsi dengan baik di lingkungan yang identik dengan produksi.

### Tahap 4: Production (Rilis)

1.  **Promosi ke Produksi**: Setelah UAT di `staging` berhasil dan disetujui, *merge* branch `staging` ke `main`.
    ```bash
    git checkout main
    git pull origin main
    git merge staging
    git push origin main
    ```
2.  **Continuous Deployment (CD)**: Push ke `main` akan memicu workflow `production.yml`, yang akan men-deploy versi terbaru ke server produksi (`https://genreklaten.web.id`).
3.  **Verifikasi**: Lakukan verifikasi cepat di URL produksi untuk memastikan deployment berhasil dan aplikasi berjalan normal.

---

## Rekomendasi Perbaikan

Sistem CI/CD yang ada sudah sangat baik. Namun, untuk meningkatkan keandalan, direkomendasikan untuk menambahkan langkah **Testing Otomatis**.

*   **Apa**: Menambahkan *framework testing* seperti **Jest** (untuk unit/API test) atau **Playwright/Cypress** (untuk End-to-End test).
*   **Bagaimana**: Buat skrip `npm test` dan tambahkan langkah untuk menjalankan skrip ini di dalam workflow CI (`dev.yml` dan `staging.yml`) setelah instalasi dependensi.
*   **Mengapa**: Untuk menangkap *bug* dan regresi fungsionalitas secara otomatis, sehingga mengurangi risiko error sampai ke tangan pengguna.