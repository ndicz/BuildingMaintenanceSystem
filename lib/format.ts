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
