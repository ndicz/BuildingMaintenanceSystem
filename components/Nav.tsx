"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cog, Gauge, History, House, UserRound, Users } from "lucide-react";

const ICONS = { home: House, input: Gauge, machines: Cog, history: History, users: Users, account: UserRound };

export type NavItem = { href: string; label: string; short?: string; icon: keyof typeof ICONS };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="side-nav">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        return (
          <Link key={it.href} href={it.href} className={isActive(pathname, it.href) ? "active" : undefined}>
            <Icon size={17} strokeWidth={1.8} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="Navigasi utama">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        const active = isActive(pathname, it.href) || (it.href === "/akun" && pathname.startsWith("/pengguna"));
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : undefined}>
            <Icon size={21} strokeWidth={1.8} />
            {it.short ?? it.label}
          </Link>
        );
      })}
    </nav>
  );
}
