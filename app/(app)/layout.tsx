import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/input", label: "Input Jam" },
    { href: "/mesin", label: "Mesin" },
    { href: "/riwayat", label: "Riwayat" },
    ...(user.role === "ADMIN" ? [{ href: "/pengguna", label: "Pengguna" }] : []),
    { href: "/akun", label: "Akun" },
  ];
  return (
    <>
      <header className="topbar no-print">
        <div className="topbar-inner">
          <span className="brand">Maintenance Gedung</span>
          <div className="user">
            <span>
              {user.name} <span className="role">{user.role === "ADMIN" ? "Admin" : "Teknisi"}</span>
            </span>
            <form action={logout}>
              <button className="link-btn">Keluar</button>
            </form>
          </div>
        </div>
        <Nav items={items} />
      </header>
      <main className="container">{children}</main>
    </>
  );
}
