export type ItemStatus = "due" | "soon" | "ok";

export type StatusInfo = {
  status: ItemStatus;
  /** Jam yang sudah terpakai sejak item terakhir dikerjakan. */
  used: number;
  /** Sisa jam sebelum jatuh tempo. Negatif berarti sudah terlambat. */
  remaining: number;
  /** Jam mesin saat item ini jatuh tempo. */
  dueAt: number;
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  due: "Harus dikerjakan",
  soon: "Segera",
  ok: "Aman",
};

const STATUS_RANK: Record<ItemStatus, number> = { due: 0, soon: 1, ok: 2 };

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function soonThresholdPercent(): number {
  const n = Number(process.env.SOON_THRESHOLD_PERCENT);
  return Number.isFinite(n) && n >= 0 ? n : 10;
}

/**
 * Hitung status item perawatan berdasarkan jam mesin saat ini.
 * - due  : jam terpakai sudah mencapai interval
 * - soon : sisa jam <= soonPercent% dari interval
 * - ok   : selain itu
 */
export function computeStatus(
  intervalHours: number,
  lastDoneHours: number,
  currentHours: number,
  soonPercent: number = soonThresholdPercent(),
): StatusInfo {
  const used = round1(Math.max(0, currentHours - lastDoneHours));
  const remaining = round1(intervalHours - used);
  const threshold = (intervalHours * soonPercent) / 100;
  const status: ItemStatus = remaining <= 0 ? "due" : remaining <= threshold ? "soon" : "ok";
  return { status, used, remaining, dueAt: round1(lastDoneHours + intervalHours) };
}

export function worstStatus(statuses: ItemStatus[]): ItemStatus | null {
  if (statuses.length === 0) return null;
  return statuses.reduce((a, b) => (STATUS_RANK[b] < STATUS_RANK[a] ? b : a));
}

export function compareStatus(a: StatusInfo, b: StatusInfo): number {
  return STATUS_RANK[a.status] - STATUS_RANK[b.status] || a.remaining - b.remaining;
}
