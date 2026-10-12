import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata = { title: "Pengguna" };

export default async function UsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <>
      <div className="page-head">
        <h1>Pengguna</h1>
        <Link href="/pengguna/baru" className="btn btn-primary">
          + Tambah Pengguna
        </Link>
      </div>
      <div className="card">
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
                <tr key={u.id} className={u.active ? undefined : "row-inactive"}>
                  <td className="primary">{u.name}</td>
                  <td data-label="Username">{u.username}</td>
                  <td data-label="Peran">{u.role === "ADMIN" ? "Admin" : "Teknisi"}</td>
                  <td data-label="Status">{u.active ? "Aktif" : "Nonaktif"}</td>
                  <td data-label="Aksi">
                    <Link href={`/pengguna/${u.id}`} className="small">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
