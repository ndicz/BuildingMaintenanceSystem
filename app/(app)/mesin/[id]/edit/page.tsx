import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEquipment, updateEquipment } from "@/app/actions/equipment";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { EquipmentFields } from "@/components/EquipmentFields";

export const metadata = { title: "Edit Mesin" };

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const eq = Number.isInteger(id) ? await prisma.equipment.findUnique({ where: { id } }) : null;
  if (!eq) notFound();

  return (
    <>
      <div className="page-head">
        <h1>Edit Mesin {eq.code}</h1>
      </div>
      <div className="card narrow">
        <ActionForm action={updateEquipment.bind(null, eq.id)} className="stack">
          <EquipmentFields d={eq} />
          <p className="muted small">
            Mengubah jam mesin di sini dianggap koreksi dan tetap dicatat di riwayat input jam. Untuk pencatatan rutin, gunakan menu
            Input Jam.
          </p>
          <div className="actions">
            <button className="btn btn-primary">Simpan</button>
            <Link href={`/mesin/${eq.id}`} className="btn btn-secondary">
              Batal
            </Link>
          </div>
        </ActionForm>
      </div>
      <div className="card narrow danger-zone">
        <h2>Hapus mesin</h2>
        <p className="muted small">Semua item perawatan dan riwayat mesin ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.</p>
        <ActionForm action={deleteEquipment.bind(null, eq.id)} confirm={`Hapus mesin ${eq.code} beserta seluruh riwayatnya?`}>
          <button className="btn btn-danger">Hapus Mesin</button>
        </ActionForm>
      </div>
    </>
  );
}
