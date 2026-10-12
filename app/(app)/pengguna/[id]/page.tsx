import Link from "next/link";
import { notFound } from "next/navigation";
import { updateUser } from "@/app/actions/users";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ActionForm } from "@/components/ActionForm";
import { UserFields } from "@/components/UserFields";

export const metadata = { title: "Edit Pengguna" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const id = Number((await params).id);
  const user = Number.isInteger(id) ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) notFound();

  return (
    <>
      <div className="page-head">
        <h1>Edit Pengguna</h1>
      </div>
      <div className="card narrow">
        <ActionForm action={updateUser.bind(null, user.id)} className="stack">
          <UserFields d={user} isNew={false} />
          <div className="actions">
            <button className="btn btn-primary">Simpan</button>
            <Link href="/pengguna" className="btn btn-secondary">
              Batal
            </Link>
          </div>
        </ActionForm>
      </div>
    </>
  );
}
