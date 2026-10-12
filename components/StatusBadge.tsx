import { type ItemStatus, STATUS_LABEL } from "@/lib/status";

export function StatusBadge({ status }: { status: ItemStatus | null }) {
  if (!status) return <span className="badge badge-none">Belum ada item</span>;
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}
