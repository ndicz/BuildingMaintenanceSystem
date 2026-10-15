// Neon memberi dua jenis alamat: "pooled" (lewat PgBouncer, host berakhiran "-pooler")
// untuk aplikasi, dan "direct" (host yang sama tanpa "-pooler") untuk migrasi.
// Dengan menurunkan alamat direct dari DATABASE_URL, cukup satu variabel yang perlu diisi.

export function isPooled(url: string): boolean {
  return /-pooler\./.test(new URL(url).hostname);
}

/** Alamat langsung (tanpa PgBouncer) untuk `prisma migrate deploy`. */
export function directUrl(url: string): string {
  const u = new URL(url);
  u.hostname = u.hostname.replace(/-pooler(?=\.)/, "");
  u.searchParams.delete("pgbouncer");
  return u.toString();
}

/** Alamat untuk aplikasi; lewat PgBouncer Prisma perlu `pgbouncer=true`. */
export function runtimeUrl(url: string): string {
  if (!isPooled(url)) return url;
  const u = new URL(url);
  u.searchParams.set("pgbouncer", "true");
  return u.toString();
}
