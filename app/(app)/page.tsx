import Link from "next/link";
import { ChevronRight, Gauge, MapPin } from "lucide-react";
import { getAttentionByEquipment, getEquipmentOverview } from "@/lib/queries";
import { fmtDateLong, fmtHours, fmtRelative, fmtRemaining } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { Meter, Status } from "@/components/Status";

export const metadata = { title: "Ringkasan" };

const STALE_DAYS = 7;

export default async function DashboardPage() {
  const [groups, equipment] = await Promise.all([getAttentionByEquipment(), getEquipmentOverview()]);
  const all = groups.flatMap((g) => g.items);
  const due = all.filter((i) => i.info.status === "due").length;
  const soon = all.length - due;
  const staleBefore = Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000;
  const stale = equipment.filter((e) => !e.hoursUpdatedAt || e.hoursUpdatedAt.getTime() < staleBefore);

  let desc: string;
  if (equipment.length === 0) desc = "Belum ada mesin terdaftar.";
  else if (all.length === 0) desc = `Semua perawatan di ${equipment.length} mesin masih aman.`;
  else {
    const parts = [due > 0 && `${due} pekerjaan harus dikerjakan`, soon > 0 && `${soon} segera jatuh tempo`].filter(Boolean);
    desc = `${parts.join(" dan ")} di ${groups.length} mesin.`;
  }

  return (
    <>
      <PageHeader
        eyebrow={fmtDateLong(new Date())}
        title="Ringkasan"
        desc={desc}
        actions={
          <Link href="/input" className="btn btn-primary">
            <Gauge size={16} />
            Input jam mesin
          </Link>
        }
      />

      <section className="panel summary">
        <div className="is-due">
          <div className="summary-num">{due}</div>
          <div className="summary-label">Harus dikerjakan</div>
        </div>
        <div className="is-soon">
          <div className="summary-num">{soon}</div>
          <div className="summary-label">Segera</div>
        </div>
        <div>
          <div className="summary-num">{equipment.length}</div>
          <div className="summary-label">Mesin</div>
        </div>
        <div>
          <div className="summary-num">{stale.length}</div>
          <div className="summary-label">Belum input &gt; {STALE_DAYS} hari</div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section className="panel">
          <div className="empty">
            <strong>Tidak ada pekerjaan yang menunggu</strong>
            Item yang mendekati jatuh tempo akan muncul di sini setelah jam mesin diinput.
          </div>
        </section>
      ) : (
        groups.map(({ equipment: eq, items }) => (
          <section className="panel" key={eq.id}>
            <div className="group-head">
              <div>
                <Link href={`/mesin/${eq.id}`} className="group-title">
                  <span className="mono">{eq.code}</span>
                  {eq.name}
                </Link>
                {eq.location && (
                  <div className="group-sub">
                    <MapPin size={13} />
                    {eq.location}
                  </div>
                )}
              </div>
              <Link href={`/mesin/${eq.id}`} className="hours-chip">
                <span className="mono">{fmtHours(eq.currentHours)}</span> jam <ChevronRight size={14} style={{ verticalAlign: "-2px" }} />
              </Link>
            </div>
            <ul className="rows">
              {items.map((it) => (
                <li key={it.id} className="task">
                  <div>
                    <div className="task-name">{it.name}</div>
                    <div className="task-meta">tiap {fmtHours(it.intervalHours)} jam</div>
                  </div>
                  <div className="task-state">
                    <Status status={it.info.status} />
                    <span className="remaining">{fmtRemaining(it.info.remaining)}</span>
                  </div>
                  <Meter used={it.info.used} interval={it.intervalHours} status={it.info.status} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {stale.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h2>Belum input jam lebih dari {STALE_DAYS} hari</h2>
          </div>
          <ul className="log">
            {stale.map((e) => (
              <li key={e.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span>
                  <span className="mono muted">{e.code}</span> {e.name}
                  <div className="sub">terakhir {fmtRelative(e.hoursUpdatedAt)}</div>
                </span>
                <Link href={`/input?mesin=${e.id}`} className="small nowrap">
                  Input jam
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
