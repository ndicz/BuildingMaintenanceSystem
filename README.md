# Sistem Maintenance Gedung

Aplikasi web untuk mencatat **jam operasi mesin (hour meter) secara manual** oleh teknisi.
Setelah jam diisi, aplikasi langsung menampilkan **item perawatan yang sudah waktunya dikerjakan**.
Contohnya: genset sudah jalan 100 jam, maka muncul "Ganti oli mesin & filter oli".

Tidak memakai sensor. Semua angka diisi teknisi lewat browser di HP atau komputer.

## Fitur

- **Input jam mesin**: teknisi memilih mesin dan mengetik angka hour meter. Sebelum disimpan sudah terlihat
  item apa saja yang akan jatuh tempo. Angka tidak boleh mundur.
- **Status otomatis** per item perawatan:
  - 🔴 **Harus dikerjakan**: jam terpakai sudah mencapai interval
  - 🟡 **Segera**: sisa jam ≤ 10% dari interval (diatur lewat `SOON_THRESHOLD_PERCENT`)
  - 🟢 **Aman**
- **Tandai selesai**: centang item yang sudah dikerjakan, lalu hitungan intervalnya mulai dari nol lagi.
- **Dashboard** berisi semua item 🔴/🟡 di semua mesin dan daftar mesin yang belum diinput jamnya lebih dari 7 hari.
- **Kelola mesin dan item** (admin): tambah, ubah, hapus mesin dan item perawatan, ubah interval, salin item dari mesin sejenis, koreksi jam mesin.
- **Riwayat** pekerjaan selesai dan input jam, bisa difilter per mesin dan tanggal, serta bisa dicetak.
- **Pengguna** dengan dua peran: **Admin** dan **Teknisi**. Teknisi yang sudah tidak bertugas cukup dinonaktifkan.
- Tampilan ramah HP: menu di bawah layar dan tombol "Tandai selesai" yang menempel saat item dicentang.

Cara hitung: `jam terpakai = jam mesin sekarang − jam saat item terakhir dikerjakan`.

## Menjalankan di komputer lokal

Kebutuhan:
- **Node.js 20 atau lebih baru** ([nodejs.org](https://nodejs.org))
- **Database PostgreSQL**. Pilih salah satu:
  - Database gratis di [Neon](https://neon.tech): buat project, lalu salin *connection string*-nya (paling mudah).
  - Postgres di komputer sendiri, misalnya `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=maintenance postgres:16`

```bash
# 1. Install dependency
npm install

# 2. Buat file pengaturan
cp .env.example .env          # Windows: copy .env.example .env
#    Lalu buka .env, isi DATABASE_URL, dan ganti AUTH_SECRET dengan teks acak panjang:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Buat tabel database + isi data awal
npm run db:setup

# 4. Jalankan
npm run dev
```

Buka <http://localhost:3000>.

### Akun awal

| Username  | Password     | Peran   |
|-----------|--------------|---------|
| `admin`   | `admin123`   | Admin   |
| `teknisi` | `teknisi123` | Teknisi |

**Segera ganti password** lewat menu **Akun** setelah login, atau atur password awal lewat
`SEED_ADMIN_PASSWORD` / `SEED_TEKNISI_PASSWORD` sebelum `db:setup`.

Data contoh (genset, chiller, pompa) ikut dibuat agar alurnya langsung terlihat.
Untuk instalasi bersih tanpa data contoh, set `SEED_DEMO=false` (hanya akun `admin` yang dibuat).
Data contoh juga bisa dihapus dari menu **Mesin**.

### Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode pengembangan |
| `npm run build && npm start` | Jalankan mode produksi (build juga menjalankan migrasi database) |
| `npm test` | Tes perhitungan status & alamat database |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run db:migrate` | Buat migrasi baru setelah mengubah `prisma/schema.prisma` |
| `npm run db:studio` | Lihat/ubah isi database lewat browser (Prisma Studio) |
| `npm run db:reset` | **Hapus semua data** lalu isi ulang data awal |

## Cara pakai singkat

1. **Admin** menambahkan mesin di menu **Mesin → + Tambah Mesin**, lalu menambahkan **item perawatan** beserta intervalnya, misalnya "Ganti oli" tiap 100 jam.
2. **Teknisi** membuka **Input Jam**, memilih mesin, lalu mengetik angka hour meter.
3. Aplikasi menampilkan item yang 🔴 harus dikerjakan atau 🟡 segera.
4. Setelah dikerjakan, teknisi mencentang item tersebut lalu klik **Tandai Selesai**.
5. Admin memantau semuanya di **Dashboard** dan **Riwayat**.

## Struktur kode

```
app/
  (app)/            halaman setelah login (dashboard, input, mesin, riwayat, pengguna, akun)
  actions/          server action: simpan data + validasi
  login/            halaman login
components/         komponen UI (form, badge status, navigasi)
lib/
  status.ts         rumus status 🔴/🟡/🟢 (+ status.test.ts)
  queries.ts        query database untuk halaman
  auth.ts           login & sesi (cookie JWT)
prisma/
  schema.prisma     struktur database
  seed.ts           data awal
```

Teknologi: Next.js 15 (App Router), Prisma ORM, PostgreSQL, bcrypt untuk password,
font IBM Plex dan ikon Lucide (semua terpasang lewat npm, tidak butuh internet saat dijalankan).

## Deploy ke Vercel (demo)

Aplikasi ini berdiri sendiri. Bisa ditaruh di akun Vercel yang sama dengan aplikasi lain (mis. HRIS)
sebagai **project terpisah**, dengan database sendiri, tanpa menyentuh aplikasi lain.

1. **Vercel → Add New → Project**, lalu import repo `ndicz/BuildingMaintenanceSystem`.
   Framework otomatis terdeteksi sebagai Next.js; build command tidak perlu diubah.
2. Sebelum klik Deploy, buka **Environment Variables** dan isi:
   - `AUTH_SECRET`: teks acak panjang (lihat perintah di atas)
   - `DEMO_MODE` = `true` agar akun demo tampil di halaman login (hapus untuk pemakaian sungguhan)
3. Klik **Deploy**. Deploy pertama akan **gagal** karena database belum ada; itu normal.
4. Di project tersebut buka **Storage → Create Database → Neon**, lalu hubungkan ke project ini.
   Vercel otomatis mengisi `DATABASE_URL`.
   Pastikan ini database **baru**, bukan database HRIS.
5. Buka **Deployments → Redeploy**. Saat build, tabel dibuat dan data awal diisi otomatis.

Setiap push ke branch produksi akan otomatis di-deploy ulang. Migrasi database ikut berjalan,
dan data yang sudah ada tidak diubah.

Catatan: paket gratis Vercel (Hobby) menurut aturannya hanya untuk pemakaian non-komersial.
Paket Neon gratis membatasi jumlah project/database. Cek kuota keduanya di akun yang dipakai.
