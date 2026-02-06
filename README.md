# SIAKAD MIMH 02 Papungan

Sistem Informasi Akademik untuk Madrasah Ibtidaiyah Miftahul Huda 02 Papungan.

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - Authentication

## Setup untuk Deployment di Vercel

### 1. Persiapan Database

Anda memerlukan PostgreSQL database. Bisa menggunakan:
- [Neon](https://neon.tech) (Gratis)
- [Supabase](https://supabase.com) (Gratis)
- [Railway](https://railway.app) (Gratis untuk awal)

Setelah membuat database, copy connection string yang berbentuk:
```
postgresql://username:password@host:port/database?schema=public
```

### 2. Deploy ke Vercel

1. **Push code ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import Project di Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Klik "Import Project"
   - Pilih repository GitHub Anda
   - Vercel akan otomatis detect Next.js

3. **Setup Environment Variables di Vercel**
   Tambahkan environment variables berikut di Vercel Dashboard:
   
   - `DATABASE_URL`: Connection string PostgreSQL Anda
   - `JWT_SECRET`: String rahasia untuk JWT (gunakan string random yang aman)
   - `NODE_ENV`: `production`

4. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai

5. **Setup Database Schema**
   Setelah deploy pertama kali, Anda perlu menjalankan migration:
   - Buka terminal di komputer lokal
   - Set environment variable `DATABASE_URL` ke production database
   - Jalankan:
   ```bash
   npx prisma migrate deploy
   ```

### 3. Membuat Admin User Pertama

Setelah database ter-setup, buat user admin pertama melalui Prisma Studio atau psql:

```sql
INSERT INTO users (username, password, "namaLengkap", role, "createdAt", "updatedAt")
VALUES (
  'admin',
  '$2a$10$... ', -- Hash dari password menggunakan bcrypt
  'Administrator',
  'admin',
  NOW(),
  NOW()
);
```

Atau gunakan API register jika tersedia.

## Development Lokal

1. Clone repository
   ```bash
   git clone YOUR_REPO_URL
   cd SIAKAD-MIMH-02-Papungan-main
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Setup environment variables
   - Copy `.env.example` ke `.env`
   - Isi dengan database URL lokal Anda

4. Setup database
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Run development server
   ```bash
   npm run dev
   ```

6. Buka [http://localhost:3000](http://localhost:3000)

## Fitur Utama

- ✅ Manajemen Data Siswa
- ✅ Manajemen Data Guru
- ✅ Import/Export Excel
- ✅ Autentikasi & Otorisasi
- ✅ Dashboard dengan Glassmorphism UI
- ✅ Notifikasi System
- ✅ Session Timeout (10 menit)
- ✅ Print-friendly Reports
- ✅ Responsive Design

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build untuk production
- `npm start` - Jalankan production server
- `npm run lint` - Lint code

## License

Private - For MIMH 02 Papungan use only
