import { type ItemStatus, STATUS_LABEL } from "@/lib/status";

export function Status({ status, label }: { status: ItemStatus | null; label?: string }) {
  if (!status) return <span className="status status-none">{label ?? "Belum ada item"}</span>;
  return <span className={`status status-${status}`}>{label ?? STATUS_LABEL[status]}</span>;
}

/** Bar kecil yang menunjukkan seberapa dekat item ke jatuh tempo. */
export function Meter({ used, interval, status }: { used: number; interval: number; status: ItemStatus }) {
  const pct = Math.max(0, Math.min(100, (used / interval) * 100));
  return (
    <div className={`meter ${status}`} role="presentation">
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
