import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getEquipmentOverview } from "@/lib/queries";
import { fmtDateTime, fmtHours } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "Mesin" };

export default async function EquipmentListPage() {
  const user = await requireUser();
  const list = await getEquipmentOverview();

  return (
    <>
      <div className="page-head">
        <h1>Daftar Mesin</h1>
        {user.role === "ADMIN" && (
          <Link href="/mesin/baru" className="btn btn-primary">
            + Tambah Mesin
          </Link>
        )}
      </div>
      <div className="card">
        {list.length === 0 ? (
          <p className="empty">Belum ada mesin terdaftar.</p>
        ) : (
          <div className="table-wrap">
            <table className="cards">
              <thead>
                <tr>
                  <th>Mesin</th>
                  <th>Lokasi</th>
                  <th className="num">Jam sekarang</th>
                  <th>Update terakhir</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((e) => (
                  <tr key={e.id}>
                    <td className="primary">
                      <Link href={`/mesin/${e.id}`}>
                        <strong>{e.code}</strong> · {e.name}
                      </Link>
                      {e.category && <div className="muted small">{e.category}</div>}
                    </td>
                    <td data-label="Lokasi">{e.location || "-"}</td>
                    <td className="num" data-label="Jam sekarang">{fmtHours(e.currentHours)}</td>
                    <td className="small" data-label="Update terakhir">{fmtDateTime(e.hoursUpdatedAt)}</td>
                    <td data-label="Status">
                      <div>
                        <StatusBadge status={e.worst} />
                        {(e.dueCount > 0 || e.soonCount > 0) && (
                          <div className="muted small">
                            {e.dueCount > 0 && `${e.dueCount} harus`}
                            {e.dueCount > 0 && e.soonCount > 0 && ", "}
                            {e.soonCount > 0 && `${e.soonCount} segera`}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
