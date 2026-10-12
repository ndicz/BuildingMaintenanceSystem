import Link from "next/link";
import { notFound } from "next/navigation";
import { createItem } from "@/app/actions/items";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtHours } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { ItemFields } from "@/components/ItemFields";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Tambah item perawatan" };

export default async function NewItemPage({ params }: { params: Promise<{ id: string }> }) {
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
        title="Tambah item perawatan"
        desc={
          <>
            {eq.name} · sekarang <span className="mono">{fmtHours(eq.currentHours)} jam</span>
          </>
        }
      />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={createItem.bind(null, eq.id)} className="form-stack">
            <ItemFields d={{ lastDoneHours: eq.currentHours }} />
            <div className="form-actions">
              <button className="btn btn-primary">Simpan item</button>
              <Link href={`/mesin/${eq.id}`} className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
