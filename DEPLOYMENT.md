# 📋 Panduan Deploy SIAKAD ke Vercel

## ✅ Checklist Persiapan

Pastikan file-file berikut sudah ada:
- [x] `.gitignore` - Untuk mengabaikan file sensitive
- [x] `.env.example` - Contoh environment variables
- [x] `vercel.json` - Konfigurasi Vercel
- [x] `README.md` - Dokumentasi
- [x] Build script sudah benar di `package.json`

## 🚀 Langkah-langkah Deploy

### Step 1: Setup Database PostgreSQL

Pilih salah satu provider PostgreSQL gratis:

#### Option A: Neon (Recommended)
1. Buka https://neon.tech
2. Sign up / Login
3. Klik "Create Project"
4. Pilih region **Singapore** (untuk latency terbaik)
5. Beri nama project: `siakad-mimh02`
6. Copy **Connection String** yang muncul
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

#### Option B: Supabase
1. Buka https://supabase.com
2. Sign up / Login
3. Klik "New Project"
4. Pilih organization atau buat baru
5. Beri nama project: `siakad-mimh02`
6. Pilih region **Southeast Asia**
7. Tunggu database provisioning selesai (±2 menit)
8. Buka **Settings** → **Database**
9. Copy **Connection String** di bagian "Connection string"
10. Ganti `[YOUR-PASSWORD]` dengan password database Anda

#### Option C: Railway
1. Buka https://railway.app
2. Sign up / Login dengan GitHub
3. Klik "New Project" → "Provision PostgreSQL"
4. Klik pada database yang baru dibuat
5. Buka tab **Connect**
6. Copy **Postgres Connection URL**

### Step 2: Setup Git Repository

```bash
# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Buat repository di GitHub terlebih dahulu, lalu:
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY_NAME.git
git push -u origin main
```

### Step 3: Deploy ke Vercel

1. **Buka Vercel Dashboard**
   - https://vercel.com/login
   - Login dengan GitHub

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository GitHub Anda: `SIAKAD-MIMH-02-Papungan-main`
   - Klik "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (otomatis terdetect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (otomatis terdetect)

4. **Setup Environment Variables**
   
   Tambahkan 3 environment variables berikut:
   
   | Name | Value | Contoh |
   |------|-------|--------|
   | `DATABASE_URL` | Connection string dari Step 1 | `postgresql://user:pass@host/db` |
   | `JWT_SECRET` | String rahasia random | `super_rahasia_jwt_2024_mimh02` |
   | `NODE_ENV` | `production` | `production` |

   **Cara menambahkan:**
   - Klik "Environment Variables"
   - Masukkan Name dan Value
   - Klik "Add"
   - Ulangi untuk 3 variables di atas

5. **Deploy!**
   - Klik "Deploy"
   - Tunggu proses build (~2-3 menit)
   - Jika berhasil, akan muncul konfetti 🎉

### Step 4: Setup Database Schema (Migrasi)

Setelah deploy berhasil, jalankan migrasi database:

#### Option A: Menggunakan Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Jalankan migrasi
npx prisma migrate deploy
```

#### Option B: Menggunakan Terminal Lokal
```bash
# Set DATABASE_URL ke production database
# Windows PowerShell:
$env:DATABASE_URL="postgresql://..."

# Windows CMD:
set DATABASE_URL=postgresql://...

# Mac/Linux:
export DATABASE_URL="postgresql://..."

# Jalankan migrasi
npx prisma migrate deploy
```

### Step 5: Buat User Admin Pertama

Ada 2 cara:

#### Option A: Via Prisma Studio
```bash
# Gunakan DATABASE_URL production (dari Step 4)
npx prisma studio
```
- Buka tabel `users`
- Klik "Add record"
- Isi:
  - `username`: admin
  - `password`: (hash bcrypt - lihat Option B untuk generate)
  - `namaLengkap`: Administrator
  - `role`: admin
- Klik "Save"

#### Option B: Via Database langsung (PostgreSQL)
```sql
-- Generate password hash terlebih dahulu dengan bcrypt
-- Contoh untuk password "admin123" → hash: $2a$10$...
-- Gunakan online bcrypt generator atau Node.js

INSERT INTO users (username, password, "namaLengkap", role, "createdAt", "updatedAt")
VALUES (
  'admin',
  '$2a$10$YourBcryptHashHere',
  'Administrator',
  'admin',
  NOW(),
  NOW()
);
```

**Generate Password Hash dengan Node.js:**
```bash
node -e "console.log(require('bcryptjs').hashSync('admin123', 10))"
```

### Step 6: Test Aplikasi

1. Buka URL Vercel Anda: `https://your-project.vercel.app`
2. Akan redirect ke `/login`
3. Login dengan user admin yang dibuat di Step 5
4. Jika berhasil login → **SELAMAT! 🎉**

## 🔧 Troubleshooting

### Build Failed: "DATABASE_URL is not defined"
- Pastikan environment variable `DATABASE_URL` sudah diset di Vercel Dashboard
- Redeploy dengan klik "Redeploy" di Vercel

### Error: "Migration failed"
- Pastikan database PostgreSQL bisa diakses (cek firewall)
- Pastikan connection string benar (test dengan `psql` atau Prisma Studio)
- Jalankan `npx prisma migrate reset` (HATI-HATI: ini akan hapus semua data)

### Cannot Connect to Database
- Cek apakah database PostgreSQL masih aktif
- Cek apakah IP whitelisted (untuk Supabase/Railway)
- Cek connection string format sudah benar

### Login Gagal
- Pastikan user admin sudah dibuat di database
- Cek password hash sudah benar (gunakan bcrypt)
- Cek JWT_SECRET sudah diset di environment variables

## 📝 Update Aplikasi di Vercel

Setiap kali Anda push ke GitHub, Vercel akan otomatis rebuild dan redeploy:

```bash
# Setelah edit code
git add .
git commit -m "Update fitur X"
git push origin main
```

Vercel akan:
1. Detect push baru
2. Trigger build otomatis
3. Deploy versi baru (jika build sukses)
4. URL tetap sama

## 🎯 Tips

1. **Environment Variables**: Jangan commit file `.env` ke GitHub!
2. **Database Backup**: Backup database secara berkala
3. **Custom Domain**: Anda bisa tambahkan domain custom di Vercel Settings
4. **Monitoring**: Cek Vercel Analytics untuk monitoring performa
5. **Logs**: Jika error, cek logs di Vercel Dashboard → Logs

## 📞 Bantuan

Jika ada masalah:
1. Cek Vercel Logs terlebih dahulu
2. Cek dokumentasi Vercel: https://vercel.com/docs
3. Cek Prisma docs: https://www.prisma.io/docs

---

**Good luck! 🚀**
