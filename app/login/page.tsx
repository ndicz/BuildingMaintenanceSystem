import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="login-wrap">
      <div className="card login-card">
        <h1>Maintenance Gedung</h1>
        <p className="muted">Masuk untuk mencatat jam mesin dan pekerjaan perawatan.</p>
        <ActionForm action={login} className="stack">
          <Field label="Username">
            <input name="username" autoComplete="username" autoCapitalize="none" required autoFocus />
          </Field>
          <Field label="Password">
            <input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <button className="btn btn-primary btn-block">Masuk</button>
        </ActionForm>
      </div>
    </main>
  );
}
