import Link from "next/link";
import { getAttentionItems, getEquipmentOverview } from "@/lib/queries";
import { fmtDateTime, fmtHours, fmtRemaining } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "Dashboard" };

const STALE_DAYS = 7;

export default async function DashboardPage() {
  const [items, equipment] = await Promise.all([getAttentionItems(), getEquipmentOverview()]);
  const due = items.filter((i) => i.info.status === "due").length;
  const soon = items.length - due;
  const staleBefore = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const stale = equipment.filter((e) => !e.hoursUpdatedAt || e.hoursUpdatedAt.getTime() < staleBefore);

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <Link href="/input" className="btn btn-primary">
          + Input Jam Mesin
        </Link>
      </div>

      <section className="stats">
        <div className="stat stat-due">
          <span className="stat-num">{due}</span>
          <span>Harus dikerjakan</span>
        </div>
        <div className="stat stat-soon">
          <span className="stat-num">{soon}</span>
          <span>Segera</span>
        </div>
        <div className="stat">
          <span className="stat-num">{equipment.length}</span>
          <span>Mesin terdaftar</span>
        </div>
        <div className="stat">
          <span className="stat-num">{stale.length}</span>
          <span>Belum input jam &gt; {STALE_DAYS} hari</span>
        </div>
      </section>

      <section className="card">
        <h2>Perlu dikerjakan</h2>
        {items.length === 0 ? (
          <p className="empty">Semua item perawatan masih aman. 👍</p>
        ) : (
          <div className="table-wrap">
            <table className="cards">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Pekerjaan</th>
                  <th>Mesin</th>
                  <th className="num">Interval</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id}>
                    <td data-label="Status">
                      <StatusBadge status={it.info.status} />
                    </td>
                    <td className="primary">{it.name}</td>
                    <td data-label="Mesin">
                      <div>
                        <Link href={`/mesin/${it.equipment.id}`}>
                          {it.equipment.code} · {it.equipment.name}
                        </Link>
                        {it.equipment.location && <div className="muted small">{it.equipment.location}</div>}
                      </div>
                    </td>
                    <td className="num" data-label="Interval">tiap {fmtHours(it.intervalHours)} jam</td>
                    <td data-label="Keterangan">{fmtRemaining(it.info.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {stale.length > 0 && (
        <section className="card">
          <h2>Belum input jam lebih dari {STALE_DAYS} hari</h2>
          <ul className="plain-list">
            {stale.map((e) => (
              <li key={e.id}>
                <Link href={`/input?mesin=${e.id}`}>
                  {e.code} · {e.name}
                </Link>{" "}
                <span className="muted small">
                  — terakhir {fmtDateTime(e.hoursUpdatedAt)} ({fmtHours(e.currentHours)} jam)
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
