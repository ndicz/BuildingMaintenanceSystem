import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { href: string; label: string };

export function PageHeader({
  title,
  desc,
  crumbs,
  eyebrow,
  actions,
}: {
  title: ReactNode;
  desc?: ReactNode;
  crumbs?: Crumb[];
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {crumbs && (
          <div className="eyebrow">
            {crumbs.map((c) => (
              <span key={c.href} style={{ display: "contents" }}>
                <Link href={c.href}>{c.label}</Link>
                <ChevronRight size={14} />
              </span>
            ))}
          </div>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {desc && <p className="desc">{desc}</p>}
      </div>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
}
