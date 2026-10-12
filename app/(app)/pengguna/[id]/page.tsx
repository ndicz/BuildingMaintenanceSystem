import Link from "next/link";
import { notFound } from "next/navigation";
import { updateUser } from "@/app/actions/users";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { PageHeader } from "@/components/PageHeader";
import { UserFields } from "@/components/UserFields";

export const metadata = { title: "Ubah pengguna" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const user = Number.isInteger(id) ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) notFound();

  return (
    <>
      <PageHeader crumbs={[{ href: "/pengguna", label: "Pengguna" }]} title={user.name} />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={updateUser.bind(null, user.id)} className="form-stack">
            <UserFields d={user} isNew={false} />
            <div className="form-actions">
              <button className="btn btn-primary">Simpan perubahan</button>
              <Link href="/pengguna" className="btn btn-secondary">
                Batal
              </Link>
            </div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
