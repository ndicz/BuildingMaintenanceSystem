import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { completeItems, recordHours } from "@/app/actions/hours";
import { requireUser } from "@/lib/auth";
import { getEquipmentDetail } from "@/lib/queries";
import { fmtDateTime, fmtHours, fmtRelative } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";
import { ItemChecklist } from "@/components/ItemChecklist";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Detail mesin" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; n?: string }> };

export default async function EquipmentDetailPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const id = Number((await params).id);
  const eq = Number.isInteger(id) ? await getEquipmentDetail(id) : null;
  if (!eq) notFound();
  const { ok, n } = await searchParams;

  const active = eq.items.filter((it) => it.active);
  const dueCount = active.filter((it) => it.info.status === "due").length;
  const soonCount = active.filter((it) => it.info.status === "soon").length;
  const lastLog = eq.hourLogs[0];

  return (
    <>
      <PageHeader
        crumbs={[{ href: "/mesin", label: "Mesin" }]}
        title={eq.name}
        desc={
          <>
            <span className="mono">{eq.code}</span>
            {[eq.category, eq.location].filter(Boolean).map((t) => ` · ${t}`)}
          </>
        }
        actions={
          isAdmin && (
            <>
              <Link href={`/mesin/${eq.id}/edit`} className="btn btn-secondary">
                <Pencil size={15} />
                Ubah mesin
              </Link>
              <Link href={`/mesin/${eq.id}/item/baru`} className="btn btn-secondary">
                <Plus size={16} />
                Item perawatan
              </Link>
            </>
          )
        }
      />

      {ok === "jam" && (
        <Notice tone={dueCount > 0 ? "error" : soonCount > 0 ? "warn" : "ok"}>
          Jam mesin tersimpan: <strong>{fmtHours(eq.currentHours)} jam</strong>.{" "}
          {dueCount > 0
            ? `${dueCount} item harus dikerjakan${soonCount > 0 ? `, ${soonCount} segera` : ""}.`
            : soonCount > 0
              ? `${soonCount} item segera jatuh tempo.`
              : "Semua item masih aman."}
        </Notice>
      )}
      {ok === "selesai" && <Notice tone="ok">{n ?? "Beberapa"} item ditandai selesai. Hitungan intervalnya dimulai lagi dari jam ini.</Notice>}

      <section className="panel meter-panel">
        <div>
          <div className="faint small">Jam mesin saat ini</div>
          <div className="reading">
            {fmtHours(eq.currentHours)}
            <small>jam</small>
          </div>
          <div className="faint small">
            Diperbarui {fmtRelative(eq.hoursUpdatedAt)}
            {lastLog?.user && ` oleh ${lastLog.user.name}`}
          </div>
        </div>
        <ActionForm action={recordHours} className="inline-form">
          <input type="hidden" name="equipmentId" value={eq.id} />
          <Field label="Input jam baru">
            <input name="reading" type="number" inputMode="decimal" step="0.1" min={eq.currentHours} required placeholder={String(eq.currentHours)} />
          </Field>
          <button className="btn btn-primary">Simpan</button>
        </ActionForm>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Item perawatan</h2>
          <span className="meta">
            {dueCount > 0 && <span className="status status-due">{dueCount} harus</span>}
            {dueCount > 0 && soonCount > 0 && "  "}
            {soonCount > 0 && <span className="status status-soon">{soonCount} segera</span>}
            {dueCount === 0 && soonCount === 0 && `${active.length} item`}
          </span>
        </div>
        {eq.items.length === 0 ? (
          <div className="empty">
            <strong>Belum ada item perawatan</strong>
            {isAdmin ? <Link href={`/mesin/${eq.id}/item/baru`}>Tambah item pertama</Link> : "Minta admin menambahkan item untuk mesin ini."}
          </div>
        ) : (
          <ItemChecklist
            key={`${eq.currentHours}-${eq.items.map((i) => i.lastDoneHours).join(",")}`}
            equipmentId={eq.id}
            currentHours={eq.currentHours}
            isAdmin={isAdmin}
            items={eq.items}
            action={completeItems.bind(null, eq.id)}
          />
        )}
      </section>

      <div className="cols">
        <section className="panel">
          <div className="panel-head">
            <h2>Pekerjaan terakhir</h2>
            <Link href={`/riwayat?mesin=${eq.id}`} className="small">
              Semua
            </Link>
          </div>
          {eq.maintenanceLogs.length === 0 ? (
            <div className="empty">Belum ada pekerjaan tercatat.</div>
          ) : (
            <ul className="log">
              {eq.maintenanceLogs.map((log) => (
                <li key={log.id}>
                  {log.itemName} <span className="faint">di jam</span> <span className="mono">{fmtHours(log.doneHours)}</span>
                  <div className="sub">
                    {fmtDateTime(log.createdAt)} · {log.user?.name ?? "—"}
                    {log.note && ` · ${log.note}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Input jam terakhir</h2>
            <Link href={`/riwayat?tipe=jam&mesin=${eq.id}`} className="small">
              Semua
            </Link>
          </div>
          {eq.hourLogs.length === 0 ? (
            <div className="empty">Belum ada input jam.</div>
          ) : (
            <ul className="log">
              {eq.hourLogs.map((log) => (
                <li key={log.id}>
                  <span className="mono">
                    {fmtHours(log.previousHours)} → {fmtHours(log.reading)}
                  </span>
                  <div className="sub">
                    {fmtDateTime(log.createdAt)} · {log.user?.name ?? "—"}
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
