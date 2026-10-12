import Link from "next/link";
import { ChevronRight, LogOut, Users } from "lucide-react";
import { changeOwnPassword, logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";
import { Notice } from "@/components/Notice";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Akun" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const { ok } = await searchParams;
  return (
    <>
      <PageHeader title="Akun" />

      <section className="panel panel-narrow">
        <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="avatar" style={{ width: 42, height: 42, fontSize: "1rem" }}>
            {initials(user.name)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div className="faint small">
              <span className="mono">{user.username}</span> · {user.role === "ADMIN" ? "Admin" : "Teknisi"}
            </div>
          </div>
          <form action={logout}>
            <button className="btn btn-secondary">
              <LogOut size={15} />
              Keluar
            </button>
          </form>
        </div>
        {user.role === "ADMIN" && (
          <Link href="/pengguna" className="machine" style={{ gridTemplateColumns: "auto 1fr auto", borderTop: "1px solid var(--line)" }}>
            <Users size={17} className="faint" />
            <span>Kelola pengguna</span>
            <ChevronRight size={16} className="faint" />
          </Link>
        )}
      </section>

      <section className="panel panel-narrow">
        <div className="panel-head">
          <h2>Ganti password</h2>
        </div>
        <div className="panel-body">
          {ok && <Notice tone="ok">Password berhasil diganti.</Notice>}
          <ActionForm action={changeOwnPassword} className="form-stack">
            <Field label="Password lama">
              <input name="current" type="password" autoComplete="current-password" required />
            </Field>
            <div className="grid-2">
              <Field label="Password baru" hint="Minimal 6 karakter.">
                <input name="password" type="password" autoComplete="new-password" required />
              </Field>
              <Field label="Ulangi password baru">
                <input name="confirm" type="password" autoComplete="new-password" required />
              </Field>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary">Ganti password</button>
            </div>
          </ActionForm>
        </div>
      </section>
    </>
  );
}
