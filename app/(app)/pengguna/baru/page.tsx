import Link from "next/link";
import { createUser } from "@/app/actions/users";
import { requireAdmin } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { UserFields } from "@/components/UserFields";

export const metadata = { title: "Tambah Pengguna" };

export default async function NewUserPage() {
  await requireAdmin();
  return (
    <>
      <div className="page-head">
        <h1>Tambah Pengguna</h1>
      </div>
      <div className="card narrow">
        <ActionForm action={createUser} className="stack">
          <UserFields isNew />
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
