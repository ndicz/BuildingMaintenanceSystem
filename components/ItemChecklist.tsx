"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import type { FormState } from "@/lib/form";
import { fmtHours, fmtRemaining } from "@/lib/format";
import type { ItemWithStatus } from "@/lib/queries";
import { ActionForm } from "./ActionForm";
import { Field } from "./Field";
import { Meter, Status } from "./Status";

type Props = {
  equipmentId: number;
  currentHours: number;
  isAdmin: boolean;
  items: ItemWithStatus[];
  action: (fd: FormData) => Promise<FormState>;
};

export function ItemChecklist({ equipmentId, currentHours, isAdmin, items, action }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const active = items.filter((it) => it.active);
  const inactive = items.filter((it) => !it.active);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const editLink = (id: number) =>
    isAdmin && (
      <Link href={`/mesin/${equipmentId}/item/${id}`} className="task-edit" title="Ubah item" aria-label="Ubah item">
        <Pencil size={13} />
      </Link>
    );

  return (
    <ActionForm action={action}>
      <ul className="rows">
        {active.map((it) => (
          <li key={it.id}>
            <label className={`task task-check${selected.has(it.id) ? " selected" : ""}`}>
              <input type="checkbox" name="itemId" value={it.id} checked={selected.has(it.id)} onChange={() => toggle(it.id)} />
              <div>
                <div className="task-name">
                  {it.name}
                  {editLink(it.id)}
                </div>
                <div className="task-meta">
                  tiap {fmtHours(it.intervalHours)} jam · terakhir di {fmtHours(it.lastDoneHours)} · jatuh tempo di {fmtHours(it.info.dueAt)}
                </div>
                {it.description && <div className="task-meta pre">{it.description}</div>}
              </div>
              <div className="task-state">
                <Status status={it.info.status} />
                <span className="remaining">{fmtRemaining(it.info.remaining)}</span>
              </div>
              <Meter used={it.info.used} interval={it.intervalHours} status={it.info.status} />
            </label>
          </li>
        ))}
        {inactive.map((it) => (
          <li key={it.id} className="task inactive">
            <div>
              <div className="task-name">
                {it.name}
                {editLink(it.id)}
              </div>
              <div className="task-meta">tiap {fmtHours(it.intervalHours)} jam</div>
            </div>
            <div className="task-state">
              <span className="status status-none">Nonaktif</span>
            </div>
          </li>
        ))}
      </ul>

      {active.length > 0 && (
        <div className={`action-bar${selected.size > 0 ? " sticky" : ""}`}>
          {selected.size === 0 && <span className="hint">Centang item yang sudah dikerjakan, lalu simpan.</span>}
          <Field label="Dikerjakan di jam">
            <input name="doneHours" type="number" inputMode="decimal" step="0.1" min="0" max={currentHours} defaultValue={currentHours} required />
          </Field>
          <Field label="Catatan">
            <input name="note" placeholder="Mis. oli 18 L, filter Fleetguard" />
          </Field>
          <button className="btn btn-primary" disabled={selected.size === 0}>
            {selected.size > 0 ? `Tandai ${selected.size} item selesai` : "Tandai selesai"}
          </button>
        </div>
      )}
    </ActionForm>
  );
}
