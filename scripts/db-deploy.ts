// Jalankan migrasi database lalu isi data awal (aman dijalankan berulang).
// Dipakai saat build di Vercel dan untuk setup lokal (`npm run db:setup`).
import { execSync } from "node:child_process";
import { directUrl } from "../lib/dburl";

// Lokal: baca .env bila ada. Di Vercel variabel sudah tersedia di environment.
try {
  process.loadEnvFile(".env");
} catch {}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL belum diisi. Lihat .env.example.");
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: directUrl(url) };
execSync("prisma migrate deploy", { stdio: "inherit", env });
execSync("tsx prisma/seed.ts", { stdio: "inherit", env });
