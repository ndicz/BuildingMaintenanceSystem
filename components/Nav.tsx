"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

export function Nav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <nav className="nav">
      {items.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} className={active ? "active" : undefined}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
