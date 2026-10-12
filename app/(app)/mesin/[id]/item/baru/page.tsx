import Link from "next/link";
import { notFound } from "next/navigation";
import { createItem } from "@/app/actions/items";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fmtHours } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { ItemFields } from "@/components/ItemFields";

export const metadata = { title: "Tambah Item Perawatan" };

export default async function NewItemPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const eq = Number.isInteger(id) ? await prisma.equipment.findUnique({ where: { id } }) : null;
  if (!eq) notFound();

  return (
    <>
      <div className="page-head">
        <h1>Tambah Item Perawatan</h1>
      </div>
      <div className="card narrow">
        <p className="muted">
          Mesin: <strong>{eq.code} · {eq.name}</strong> — jam sekarang {fmtHours(eq.currentHours)}
        </p>
        <ActionForm action={createItem.bind(null, eq.id)} className="stack">
          <ItemFields d={{ lastDoneHours: eq.currentHours }} />
          <div className="actions">
            <button className="btn btn-primary">Simpan</button>
            <Link href={`/mesin/${eq.id}`} className="btn btn-secondary">
              Batal
            </Link>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
