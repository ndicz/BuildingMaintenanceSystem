import Link from "next/link";
import { createUser } from "@/app/actions/users";
import { requireAdmin } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { PageHeader } from "@/components/PageHeader";
import { UserFields } from "@/components/UserFields";

export const metadata = { title: "Tambah pengguna" };

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader crumbs={[{ href: "/pengguna", label: "Pengguna" }]} title="Tambah pengguna" />
      <section className="panel panel-narrow">
        <div className="panel-body">
          <ActionForm action={createUser} className="form-stack">
            <UserFields isNew />
            <div className="form-actions">
              <button className="btn btn-primary">Simpan pengguna</button>
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
