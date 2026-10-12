export type FormState = { error?: string } | void;

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Angka dari input form; menerima koma sebagai pemisah desimal. */
export function num(fd: FormData, key: string): number | null {
  const raw = str(fd, key).replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function int(fd: FormData, key: string): number | null {
  const n = num(fd, key);
  return n !== null && Number.isInteger(n) ? n : null;
}

export function bool(fd: FormData, key: string): boolean {
  return fd.get(key) === "on";
}
