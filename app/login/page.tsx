import { redirect } from "next/navigation";
import { login } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { ActionForm } from "@/components/ActionForm";
import { Brand } from "@/components/Brand";
import { Field } from "@/components/Field";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="login">
      <div className="login-box">
        <Brand />
        <h1>Masuk</h1>
        <p className="desc">Catat jam mesin dan lihat perawatan yang perlu dikerjakan.</p>
        <ActionForm action={login} className="form-stack">
          <Field label="Username">
            <input name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
          </Field>
          <Field label="Password">
            <input name="password" type="password" autoComplete="current-password" required />
          </Field>
          <button className="btn btn-primary btn-block btn-lg">Masuk</button>
        </ActionForm>
        <p className="login-foot">Lupa password? Minta admin untuk mengatur ulang.</p>
      </div>
    </main>
  );
}
