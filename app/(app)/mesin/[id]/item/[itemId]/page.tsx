import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteItem, updateItem } from "@/app/actions/items";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtHours } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { ItemFields } from "@/components/ItemFields";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Ubah item perawatan" };

export default async function EditItemPage({ params }: { params: Promise<{ id: string; itemId: string }> }) {
  await requireAdmin();
  const p = await params;
  const id = Number(p.id);
  const itemId = Number(p.itemId);
  const item =
    Number.isInteger(id) && Number.isInteger(itemId)
      ? await prisma.maintenanceItem.findFirst({ where: { id: itemId, equipmentId: id }, include: { equipment: true } })
      : null;
  if (!item) notFound();

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/mesin", label: "Mesin" },
          { href: `/mesin/${id}`, label: item.equipment.code },
        ]}
        title="Ubah item perawatan"
        desc={
          <>
            {item.equipment.name} · sekarang <span className="mono">{fmtHours(item.equipment.currentHours)} jam</span>
          </>
        }
      />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={updateItem.bind(null, id, itemId)} className="form-stack">
            <ItemFields d={item} showActive />
            <div className="form-actions">
              <button className="btn btn-primary">Simpan perubahan</button>
              <Link href={`/mesin/${id}`} className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </ActionForm>
        </div>
      </section>
      <section className="panel panel-narrow panel-danger">
        <div className="panel-head">
          <h2>Hapus item</h2>
        </div>
        <div className="panel-body">
          <p className="muted small" style={{ marginBottom: 12 }}>
            Riwayat pekerjaan item ini tetap tersimpan. Kalau hanya ingin berhenti memantau, cukup matikan pilihan “Aktif”.
          </p>
          <ActionForm action={deleteItem.bind(null, id, itemId)} confirm={`Hapus item "${item.name}"?`}>
            <button className="btn btn-danger">Hapus item</button>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
