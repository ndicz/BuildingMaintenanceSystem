# Sistem Maintenance Gedung

Aplikasi web untuk mencatat **jam operasi mesin (hour meter) secara manual** oleh teknisi.
Setelah jam diisi, aplikasi langsung menampilkan **item perawatan yang sudah waktunya dikerjakan**.
Contohnya: genset sudah jalan 100 jam, maka muncul "Ganti oli mesin & filter oli".

Tidak memakai sensor. Semua angka diisi teknisi lewat browser di HP atau komputer.

## Fitur

- **Input jam mesin**: teknisi memilih mesin dan mengetik angka hour meter. Angka tidak boleh mundur.
- **Status otomatis** per item perawatan:
  - 🔴 **Harus dikerjakan**: jam terpakai sudah mencapai interval
  - 🟡 **Segera**: sisa jam ≤ 10% dari interval (diatur lewat `SOON_THRESHOLD_PERCENT`)
  - 🟢 **Aman**
- **Tandai selesai**: centang item yang sudah dikerjakan, lalu hitungan intervalnya mulai dari nol lagi.
- **Dashboard** berisi semua item 🔴/🟡 di semua mesin dan daftar mesin yang belum diinput jamnya lebih dari 7 hari.
- **Kelola mesin dan item** (admin): tambah, ubah, hapus mesin dan item perawatan, ubah interval, salin item dari mesin sejenis, koreksi jam mesin.
- **Riwayat** pekerjaan selesai dan input jam, bisa difilter per mesin dan tanggal, serta bisa dicetak.
- **Pengguna** dengan dua peran: **Admin** dan **Teknisi**. Teknisi yang sudah tidak bertugas cukup dinonaktifkan.
- Tampilan ramah HP.

Cara hitung: `jam terpakai = jam mesin sekarang − jam saat item terakhir dikerjakan`.

## Menjalankan di komputer lokal

Kebutuhan: **Node.js 20 atau lebih baru** ([nodejs.org](https://nodejs.org)).

```bash
# 1. Install dependency
npm install

# 2. Buat file pengaturan
cp .env.example .env          # Windows: copy .env.example .env
#    Lalu buka .env dan ganti AUTH_SECRET dengan teks acak panjang, contoh membuat:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Buat database + isi data awal
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

**Segera ganti password** lewat menu **Akun** setelah login.

Data contoh (genset, chiller, pompa) ikut dibuat agar alurnya langsung terlihat.
Untuk instalasi bersih tanpa data contoh, jalankan `SEED_DEMO=false npm run db:setup`
(hanya akun `admin` yang dibuat). Data contoh juga bisa dihapus dari menu **Mesin**.

### Perintah lain

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode pengembangan |
| `npm run build && npm start` | Jalankan mode produksi |
| `npm test` | Tes perhitungan status |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run db:studio` | Lihat/ubah isi database lewat browser (Prisma Studio) |
| `npm run db:reset` | **Hapus semua data** lalu isi ulang data awal |

Database lokal tersimpan di `prisma/dev.db`. Untuk backup cukup salin file tersebut.

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

Teknologi: Next.js 15 (App Router), Prisma ORM, SQLite (lokal), bcrypt untuk password.

## Rencana pindah ke Vercel (nanti)

Vercel tidak bisa menyimpan file database SQLite, jadi database dipindah ke Postgres online
(mis. Supabase atau Neon, keduanya punya paket gratis):

1. Buat database Postgres di Supabase/Neon, salin connection string-nya.
2. Di `prisma/schema.prisma` ubah `provider = "sqlite"` menjadi `provider = "postgresql"`.
3. Hapus folder `prisma/migrations`, isi `DATABASE_URL` di `.env` dengan connection string Postgres,
   lalu jalankan `npx prisma migrate dev --name init` dan `npx prisma db seed`.
4. Push ke GitHub, import repo di Vercel, lalu isi environment variable `DATABASE_URL` dan `AUTH_SECRET`.

Kode aplikasi lainnya tidak perlu diubah.
