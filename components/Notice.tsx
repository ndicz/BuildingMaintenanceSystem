import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

const ICON = { error: CircleAlert, warn: TriangleAlert, ok: CircleCheck };

export function Notice({ tone, children }: { tone: "error" | "warn" | "ok"; children: ReactNode }) {
  const Icon = ICON[tone];
  return (
    <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={17} />
      <div>{children}</div>
    </div>
  );
}
