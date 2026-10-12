import Link from "next/link";
import { createEquipment } from "@/app/actions/equipment";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { EquipmentFields } from "@/components/EquipmentFields";
import { Field } from "@/components/Field";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Tambah mesin" };

export default async function NewEquipmentPage() {
  await requireAdmin();
  const sources = await prisma.equipment.findMany({
    where: { items: { some: {} } },
    select: { id: true, code: true, name: true, _count: { select: { items: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <>
      <PageHeader crumbs={[{ href: "/mesin", label: "Mesin" }]} title="Tambah mesin" />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={createEquipment} className="form-stack">
            <EquipmentFields />
            {sources.length > 0 && (
              <Field label="Salin item perawatan dari" hint="Untuk mesin sejenis. Itemnya tetap bisa diubah setelah disimpan.">
                <select name="copyFromId" defaultValue="">
                  <option value="">Jangan salin</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name} ({s._count.items} item)
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <div className="form-actions">
              <button className="btn btn-primary">Simpan mesin</button>
              <Link href="/mesin" className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
