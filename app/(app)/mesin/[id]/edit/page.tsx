import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEquipment, updateEquipment } from "@/app/actions/equipment";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { EquipmentFields } from "@/components/EquipmentFields";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Ubah mesin" };

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const eq = Number.isInteger(id) ? await prisma.equipment.findUnique({ where: { id } }) : null;
  if (!eq) notFound();

  return (
    <>
      <PageHeader
        crumbs={[
          { href: "/mesin", label: "Mesin" },
          { href: `/mesin/${eq.id}`, label: eq.code },
        ]}
        title="Ubah mesin"
      />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={updateEquipment.bind(null, eq.id)} className="form-stack">
            <EquipmentFields d={eq} hoursHint="Mengubah angka ini dianggap koreksi dan tetap tercatat di riwayat input jam." />
            <div className="form-actions">
              <button className="btn btn-primary">Simpan perubahan</button>
              <Link href={`/mesin/${eq.id}`} className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </ActionForm>
        </div>
      </section>
      <section className="panel panel-narrow panel-danger">
        <div className="panel-head">
          <h2>Hapus mesin</h2>
        </div>
        <div className="panel-body">
          <p className="muted small" style={{ marginBottom: 12 }}>
            Semua item perawatan dan riwayat mesin ini ikut terhapus dan tidak bisa dikembalikan.
          </p>
          <ActionForm action={deleteEquipment.bind(null, eq.id)} confirm={`Hapus mesin ${eq.code} beserta seluruh riwayatnya?`}>
            <button className="btn btn-danger">Hapus mesin</button>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
