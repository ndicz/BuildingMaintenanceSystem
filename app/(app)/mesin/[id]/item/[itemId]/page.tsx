import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteItem, updateItem } from "@/app/actions/items";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtHours } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { ItemFields } from "@/components/ItemFields";

export const metadata = { title: "Edit Item Perawatan" };

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
      <div className="page-head">
        <h1>Edit Item Perawatan</h1>
      </div>
      <div className="card narrow">
        <p className="muted">
          Mesin: <strong>{item.equipment.code} · {item.equipment.name}</strong> — jam sekarang {fmtHours(item.equipment.currentHours)}
        </p>
        <ActionForm action={updateItem.bind(null, id, itemId)} className="stack">
          <ItemFields d={item} showActive />
          <div className="actions">
            <button className="btn btn-primary">Simpan</button>
            <Link href={`/mesin/${id}`} className="btn btn-secondary">
              Batal
            </Link>
          </div>
        </ActionForm>
      </div>
      <div className="card narrow danger-zone">
        <h2>Hapus item</h2>
        <p className="muted small">Riwayat pekerjaan item ini tetap tersimpan. Jika hanya ingin berhenti memantau, cukup nonaktifkan.</p>
        <ActionForm action={deleteItem.bind(null, id, itemId)} confirm={`Hapus item "${item.name}"?`}>
          <button className="btn btn-danger">Hapus Item</button>
        </ActionForm>
      </div>
    </>
  );
}
