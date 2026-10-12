import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getEquipmentOverview } from "@/lib/queries";
import { fmtHours, fmtRelative } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Status } from "@/components/Status";

export const metadata = { title: "Mesin" };

export default async function EquipmentListPage() {
  const user = await requireUser();
  const list = await getEquipmentOverview();

  return (
    <>
      <PageHeader
        title="Mesin"
        desc={`${list.length} mesin terdaftar.`}
        actions={
          user.role === "ADMIN" && (
            <Link href="/mesin/baru" className="btn btn-primary">
              <Plus size={16} />
              Tambah mesin
            </Link>
          )
        }
      />
      <section className="panel">
        {list.length === 0 ? (
          <div className="empty">
            <strong>Belum ada mesin</strong>
            {user.role === "ADMIN" ? "Tambahkan mesin pertama untuk mulai mencatat." : "Minta admin menambahkan mesin."}
          </div>
        ) : (
          <ul className="rows">
            {list.map((e) => (
              <li key={e.id}>
                <Link href={`/mesin/${e.id}`} className="machine">
                  <div>
                    <div className="machine-name">
                      <span className="mono">{e.code}</span>
                      {e.name}
                    </div>
                    <div className="faint small">{[e.category, e.location].filter(Boolean).join(" · ") || "—"}</div>
                  </div>
                  <div className="machine-hours">
                    <span>
                      <span className="mono">{fmtHours(e.currentHours)}</span> jam
                    </span>
                    <div className="faint small">{fmtRelative(e.hoursUpdatedAt)}</div>
                  </div>
                  <div className="machine-state">
                    {e.dueCount > 0 && <Status status="due" label={`${e.dueCount} harus dikerjakan`} />}
                    {e.soonCount > 0 && <Status status="soon" label={`${e.soonCount} segera`} />}
                    {e.dueCount === 0 && e.soonCount === 0 && <Status status={e.itemCount > 0 ? "ok" : null} label={e.itemCount > 0 ? "Semua aman" : undefined} />}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
