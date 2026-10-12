import Link from "next/link";
import { prisma } from "@/lib/db";
import { fmtDateTime, fmtHours, startOfDayWib } from "@/lib/format";
import { getEquipmentOptions } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";

export const metadata = { title: "Riwayat" };

const LIMIT = 300;

type Search = { tipe?: string; mesin?: string; dari?: string; sampai?: string };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const tipe = sp.tipe === "jam" ? "jam" : "pekerjaan";
  const mesin = Number(sp.mesin) || undefined;
  const from = sp.dari ? startOfDayWib(sp.dari) : null;
  const toStart = sp.sampai ? startOfDayWib(sp.sampai) : null;
  // "sampai" bersifat inklusif: ambil sampai akhir hari tersebut.
  const to = toStart ? new Date(toStart.getTime() + 24 * 60 * 60 * 1000) : null;

  const where = {
    ...(mesin ? { equipmentId: mesin } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } } : {}),
  };
  const include = { equipment: true, user: true } as const;
  const orderBy = { createdAt: "desc" } as const;

  const [options, workLogs, hourLogs] = await Promise.all([
    getEquipmentOptions(),
    tipe === "pekerjaan" ? prisma.maintenanceLog.findMany({ where, include, orderBy, take: LIMIT }) : [],
    tipe === "jam" ? prisma.hourLog.findMany({ where, include, orderBy, take: LIMIT }) : [],
  ]);
  const rows = tipe === "jam" ? hourLogs.length : workLogs.length;
  const tabHref = (t: string) => {
    const q = new URLSearchParams({ tipe: t });
    if (mesin) q.set("mesin", String(mesin));
    if (sp.dari) q.set("dari", sp.dari);
    if (sp.sampai) q.set("sampai", sp.sampai);
    return `/riwayat?${q}`;
  };

  return (
    <>
      <PageHeader
        title="Riwayat"
        desc={tipe === "jam" ? "Semua angka hour meter yang pernah diinput." : "Semua pekerjaan perawatan yang sudah ditandai selesai."}
        actions={<PrintButton />}
      />

      <div className="segmented no-print">
        <Link href={tabHref("pekerjaan")} className={tipe === "pekerjaan" ? "active" : undefined}>
          Pekerjaan selesai
        </Link>
        <Link href={tabHref("jam")} className={tipe === "jam" ? "active" : undefined}>
          Input jam
        </Link>
      </div>

      <form className="panel filters no-print" method="get">
        <input type="hidden" name="tipe" value={tipe} />
        <label className="field">
          <span className="field-label">Mesin</span>
          <select name="mesin" defaultValue={mesin ?? ""}>
            <option value="">Semua mesin</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.code} — {o.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Dari</span>
          <input type="date" name="dari" defaultValue={sp.dari} />
        </label>
        <label className="field">
          <span className="field-label">Sampai</span>
          <input type="date" name="sampai" defaultValue={sp.sampai} />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary">Terapkan</button>
          {(mesin || sp.dari || sp.sampai) && (
            <Link href={`/riwayat?tipe=${tipe}`} className="btn btn-secondary">
              Reset
            </Link>
          )}
        </div>
      </form>

      <section className="panel">
        {rows === 0 ? (
          <div className="empty">Tidak ada data untuk filter ini.</div>
        ) : (
          <div className="table-wrap">
            {tipe === "pekerjaan" ? (
              <table className="cards">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Mesin</th>
                    <th>Pekerjaan</th>
                    <th className="num">Di jam</th>
                    <th>Teknisi</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {workLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="small nowrap" data-label="Waktu">{fmtDateTime(l.createdAt)}</td>
                      <td data-label="Mesin">
                        <Link href={`/mesin/${l.equipmentId}`} className="mono">
                          {l.equipment.code}
                        </Link>
                      </td>
                      <td className="primary">{l.itemName}</td>
                      <td className="num" data-label="Di jam">{fmtHours(l.doneHours)}</td>
                      <td data-label="Oleh">{l.user?.name ?? "—"}</td>
                      <td className="small" data-label="Catatan">{l.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="cards">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Mesin</th>
                    <th className="num">Sebelumnya</th>
                    <th className="num">Jam baru</th>
                    <th>Diinput oleh</th>
                    <th>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {hourLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="small nowrap" data-label="Waktu">{fmtDateTime(l.createdAt)}</td>
                      <td data-label="Mesin">
                        <Link href={`/mesin/${l.equipmentId}`} className="mono">
                          {l.equipment.code}
                        </Link>
                      </td>
                      <td className="num" data-label="Sebelumnya">{fmtHours(l.previousHours)}</td>
                      <td className="num" data-label="Jam baru">{fmtHours(l.reading)}</td>
                      <td data-label="Oleh">{l.user?.name ?? "—"}</td>
                      <td className="small" data-label="Catatan">{l.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {rows === LIMIT && <p className="faint small" style={{ padding: "10px 16px" }}>Menampilkan {LIMIT} data terbaru. Persempit filter tanggal untuk melihat data lama.</p>}
      </section>
    </>
  );
}
