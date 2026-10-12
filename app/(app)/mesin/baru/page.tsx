import Link from "next/link";
import { createEquipment } from "@/app/actions/equipment";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { EquipmentFields } from "@/components/EquipmentFields";
import { Field } from "@/components/Field";

export const metadata = { title: "Tambah Mesin" };

export default async function NewEquipmentPage() {
  await requireAdmin();
  const sources = await prisma.equipment.findMany({
    where: { items: { some: {} } },
    select: { id: true, code: true, name: true, _count: { select: { items: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <>
      <div className="page-head">
        <h1>Tambah Mesin</h1>
      </div>
      <div className="card narrow">
        <ActionForm action={createEquipment} className="stack">
          <EquipmentFields />
          {sources.length > 0 && (
            <Field label="Salin item perawatan dari mesin lain (opsional)" hint="Cocok untuk mesin sejenis. Item bisa diubah setelahnya.">
              <select name="copyFromId" defaultValue="">
                <option value="">— Tidak menyalin —</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} · {s.name} ({s._count.items} item)
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="actions">
            <button className="btn btn-primary">Simpan</button>
            <Link href="/mesin" className="btn btn-secondary">
              Batal
            </Link>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
