import Link from "next/link";
import { notFound } from "next/navigation";
import { completeItems, recordHours } from "@/app/actions/hours";
import { requireUser } from "@/lib/auth";
import { getEquipmentDetail } from "@/lib/queries";
import { fmtDateTime, fmtHours, fmtRemaining } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata = { title: "Detail Mesin" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; n?: string }> };

export default async function EquipmentDetailPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const id = Number((await params).id);
  const eq = Number.isInteger(id) ? await getEquipmentDetail(id) : null;
  if (!eq) notFound();
  const { ok, n } = await searchParams;

  const activeItems = eq.items.filter((it) => it.active);
  const dueCount = activeItems.filter((it) => it.info.status === "due").length;
  const soonCount = activeItems.filter((it) => it.info.status === "soon").length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {eq.code} · {eq.name}
          </h1>
          <p className="muted">{[eq.category, eq.location].filter(Boolean).join(" — ") || " "}</p>
        </div>
        {isAdmin && (
          <div className="actions">
            <Link href={`/mesin/${eq.id}/edit`} className="btn btn-secondary">
              Edit Mesin
            </Link>
            <Link href={`/mesin/${eq.id}/item/baru`} className="btn btn-secondary">
              + Item Perawatan
            </Link>
          </div>
        )}
      </div>

      {ok === "jam" && (
        <div className={`alert ${dueCount > 0 ? "alert-error" : soonCount > 0 ? "alert-warn" : "alert-ok"}`}>
          Jam mesin tersimpan: <strong>{fmtHours(eq.currentHours)} jam</strong>.{" "}
          {dueCount > 0
            ? `Ada ${dueCount} item yang HARUS dikerjakan${soonCount > 0 ? ` dan ${soonCount} item segera` : ""}. Lihat daftar di bawah.`
            : soonCount > 0
              ? `Ada ${soonCount} item yang segera jatuh tempo.`
              : "Semua item perawatan masih aman."}
        </div>
      )}
      {ok === "selesai" && <div className="alert alert-ok">{n ?? "Beberapa"} item ditandai selesai. Hitungan intervalnya dimulai ulang.</div>}

      <section className="hours-box card">
        <div>
          <div className="muted small">Jam mesin saat ini</div>
          <div className="big-num">{fmtHours(eq.currentHours)} jam</div>
          <div className="muted small">Update terakhir: {fmtDateTime(eq.hoursUpdatedAt)}</div>
        </div>
        <ActionForm action={recordHours} className="inline-form">
          <input type="hidden" name="equipmentId" value={eq.id} />
          <Field label="Input jam baru">
            <input name="reading" type="number" inputMode="decimal" step="0.1" min={eq.currentHours} required placeholder={String(eq.currentHours)} />
          </Field>
          <button className="btn btn-primary">Simpan</button>
        </ActionForm>
      </section>

      <section className="card">
        <h2>Item perawatan</h2>
        {eq.items.length === 0 ? (
          <p className="empty">
            Belum ada item perawatan.{" "}
            {isAdmin ? <Link href={`/mesin/${eq.id}/item/baru`}>Tambah item</Link> : "Minta admin menambahkan item."}
          </p>
        ) : (
          <ActionForm action={completeItems.bind(null, eq.id)}>
            <div className="table-wrap">
              <table className="cards">
                <thead>
                  <tr>
                    <th className="check-col">Selesai</th>
                    <th>Pekerjaan</th>
                    <th className="num">Interval</th>
                    <th className="num">Terakhir di jam</th>
                    <th className="num">Jatuh tempo di jam</th>
                    <th>Status</th>
                    {isAdmin && <th />}
                  </tr>
                </thead>
                <tbody>
                  {eq.items.map((it) => (
                    <tr key={it.id} className={it.active ? `row-${it.info.status}` : "row-inactive"}>
                      <td className="check-col">
                        {it.active && <input type="checkbox" name="itemId" value={it.id} aria-label={`Tandai ${it.name} selesai`} />}
                      </td>
                      <td className="primary">
                        {it.name}
                        {it.description && <div className="muted small pre">{it.description}</div>}
                      </td>
                      <td className="num" data-label="Interval">tiap {fmtHours(it.intervalHours)} jam</td>
                      <td className="num" data-label="Terakhir di jam">{fmtHours(it.lastDoneHours)}</td>
                      <td className="num" data-label="Jatuh tempo di jam">{fmtHours(it.info.dueAt)}</td>
                      <td data-label="Status">
                        {it.active ? (
                          <div>
                            <StatusBadge status={it.info.status} />
                            <div className="small">{fmtRemaining(it.info.remaining)}</div>
                          </div>
                        ) : (
                          <span className="badge badge-none">Nonaktif</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td data-label="Admin">
                          <Link href={`/mesin/${eq.id}/item/${it.id}`} className="small">
                            Edit
                          </Link>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeItems.length > 0 && (
              <div className="complete-box">
                <p className="small">Centang item yang sudah dikerjakan, lalu simpan.</p>
                <div className="grid-2">
                  <Field label="Dikerjakan pada jam mesin ke-">
                    <input
                      name="doneHours"
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      max={eq.currentHours}
                      defaultValue={eq.currentHours}
                      required
                    />
                  </Field>
                  <Field label="Catatan (opsional)">
                    <input name="note" placeholder="mis. oli Shell Rimula 18 L, filter Fleetguard" />
                  </Field>
                </div>
                <button className="btn btn-primary">Tandai Selesai</button>
              </div>
            )}
          </ActionForm>
        )}
      </section>

      <div className="grid-2 align-start">
        <section className="card">
          <div className="section-head">
            <h2>Riwayat pekerjaan</h2>
            <Link href={`/riwayat?mesin=${eq.id}`} className="small">
              Lihat semua
            </Link>
          </div>
          {eq.maintenanceLogs.length === 0 ? (
            <p className="empty">Belum ada pekerjaan tercatat.</p>
          ) : (
            <ul className="log-list">
              {eq.maintenanceLogs.map((log) => (
                <li key={log.id}>
                  <strong>{log.itemName}</strong> di jam {fmtHours(log.doneHours)}
                  <div className="muted small">
                    {fmtDateTime(log.createdAt)} · {log.user?.name ?? "-"}
                    {log.note && ` · ${log.note}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <div className="section-head">
            <h2>Riwayat input jam</h2>
            <Link href={`/riwayat?tipe=jam&mesin=${eq.id}`} className="small">
              Lihat semua
            </Link>
          </div>
          {eq.hourLogs.length === 0 ? (
            <p className="empty">Belum ada input jam.</p>
          ) : (
            <ul className="log-list">
              {eq.hourLogs.map((log) => (
                <li key={log.id}>
                  {fmtHours(log.previousHours)} → <strong>{fmtHours(log.reading)} jam</strong>
                  <div className="muted small">
                    {fmtDateTime(log.createdAt)} · {log.user?.name ?? "-"}
                    {log.note && ` · ${log.note}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
