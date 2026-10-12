import Link from "next/link";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/format";
import { Brand } from "@/components/Brand";
import { type NavItem, SideNav, TabBar } from "@/components/Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const roleLabel = isAdmin ? "Admin" : "Teknisi";

  const main: NavItem[] = [
    { href: "/", label: "Ringkasan", icon: "home" },
    { href: "/input", label: "Input jam", short: "Input", icon: "input" },
    { href: "/mesin", label: "Mesin", icon: "machines" },
    { href: "/riwayat", label: "Riwayat", icon: "history" },
  ];
  const side: NavItem[] = isAdmin ? [...main, { href: "/pengguna", label: "Pengguna", icon: "users" }] : main;
  const tabs: NavItem[] = [...main, { href: "/akun", label: "Akun", icon: "account" }];

  return (
    <div className="shell">
      <aside className="sidebar">
        <Brand />
        <SideNav items={side} />
        <div className="side-user">
          <span className="avatar">{initials(user.name)}</span>
          <div className="side-user-name">
            <Link href="/akun">{user.name}</Link>
            <span>{roleLabel}</span>
          </div>
          <form action={logout}>
            <button className="icon-btn" title="Keluar" aria-label="Keluar">
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      <header className="mobile-top">
        <Brand withSub={false} />
        <Link href="/akun" className="avatar" aria-label="Akun">
          {initials(user.name)}
        </Link>
      </header>

      <main className="main">
        <div className="content">{children}</div>
      </main>

      <TabBar items={tabs} />
    </div>
  );
}
