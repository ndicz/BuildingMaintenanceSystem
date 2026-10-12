import Link from "next/link";
import { Wrench } from "lucide-react";

export function Brand({ withSub = true }: { withSub?: boolean }) {
  return (
    <Link href="/" className="brand">
      <span className="brand-mark">
        <Wrench size={16} strokeWidth={2} />
      </span>
      <span className="brand-name">
        Maintenance
        {withSub && <span>Gedung</span>}
      </span>
    </Link>
  );
}
