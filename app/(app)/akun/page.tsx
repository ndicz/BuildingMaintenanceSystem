import { changeOwnPassword } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";

export const metadata = { title: "Akun" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const { ok } = await searchParams;
  return (
    <>
      <div className="page-head">
        <h1>Akun Saya</h1>
      </div>
      <div className="card narrow">
        <p>
          <strong>{user.name}</strong> ({user.username}) — {user.role === "ADMIN" ? "Admin" : "Teknisi"}
        </p>
        {ok && <div className="alert alert-ok">Password berhasil diganti.</div>}
        <h2>Ganti password</h2>
        <ActionForm action={changeOwnPassword} className="stack">
          <Field label="Password lama">
            <input name="current" type="password" autoComplete="current-password" required />
          </Field>
          <Field label="Password baru" hint="Minimal 6 karakter.">
            <input name="password" type="password" autoComplete="new-password" required />
          </Field>
          <Field label="Ulangi password baru">
            <input name="confirm" type="password" autoComplete="new-password" required />
          </Field>
          <button className="btn btn-primary">Ganti Password</button>
        </ActionForm>
      </div>
    </>
  );
}
