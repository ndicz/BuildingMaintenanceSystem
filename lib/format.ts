export const TIME_ZONE = "Asia/Jakarta";

const hoursFmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
const dateTimeFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export function fmtHours(n: number): string {
  return hoursFmt.format(n);
}

export function fmtDateTime(d: Date | null | undefined): string {
  return d ? dateTimeFmt.format(d) : "-";
}

/** Teks sisa jam yang mudah dibaca, mis. "sisa 20 jam" atau "terlambat 5 jam". */
export function fmtRemaining(remaining: number): string {
  if (remaining > 0) return `sisa ${fmtHours(remaining)} jam`;
  if (remaining === 0) return "jatuh tempo sekarang";
  return `terlambat ${fmtHours(-remaining)} jam`;
}

/** Ubah "2026-10-01" menjadi awal hari itu di zona waktu WIB. */
export function startOfDayWib(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T00:00:00+07:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

const dateLongFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE });

export function fmtDateLong(d: Date): string {
  return dateLongFmt.format(d);
}

/** Waktu relatif singkat, mis. "3 jam lalu", "kemarin", "5 hari lalu". */
export function fmtRelative(d: Date | null | undefined, now: Date = new Date()): string {
  if (!d) return "belum pernah";
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "kemarin";
  if (days < 30) return `${days} hari lalu`;
  return dateTimeFmt.format(d);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}
