import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { initials } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Pengguna" };

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <>
      <PageHeader
        title="Pengguna"
        desc="Akun admin dan teknisi yang bisa masuk ke aplikasi."
        actions={
          <Link href="/pengguna/baru" className="btn btn-primary">
            <Plus size={16} />
            Tambah pengguna
          </Link>
        }
      />
      <section className="panel">
        <div className="table-wrap">
          <table className="cards">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Username</th>
                <th>Peran</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.active ? undefined : "inactive"}>
                  <td className="primary">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                      <span className="avatar">{initials(u.name)}</span>
                      {u.name}
                    </span>
                  </td>
                  <td data-label="Username" className="mono">
                    {u.username}
                  </td>
                  <td data-label="Peran">{u.role === "ADMIN" ? "Admin" : "Teknisi"}</td>
                  <td data-label="Status">
                    <span className={`status ${u.active ? "status-ok" : "status-none"}`}>{u.active ? "Aktif" : "Nonaktif"}</span>
                  </td>
                  <td data-label="">
                    <Link href={`/pengguna/${u.id}`}>Ubah</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
