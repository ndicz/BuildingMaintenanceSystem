"use client";

import { useState } from "react";
import type { FormState } from "@/lib/form";
import { fmtHours, fmtRemaining } from "@/lib/format";
import { compareStatus, computeStatus } from "@/lib/status";
import { ActionForm } from "./ActionForm";
import { Field } from "./Field";
import { Meter, Status } from "./Status";

export type EntryMachine = {
  id: number;
  code: string;
  name: string;
  currentHours: number;
  updatedLabel: string;
  items: { id: number; name: string; intervalHours: number; lastDoneHours: number }[];
};

type Props = {
  machines: EntryMachine[];
  defaultId?: number;
  soonPercent: number;
  action: (fd: FormData) => Promise<FormState>;
};

export function HourEntry({ machines, defaultId, soonPercent, action }: Props) {
  const [id, setId] = useState(defaultId ? String(defaultId) : "");
  const [reading, setReading] = useState("");
  const machine = machines.find((m) => String(m.id) === id);

  const raw = reading.replace(",", ".").trim();
  const value = raw === "" ? null : Number(raw);
  const valid = value !== null && Number.isFinite(value) && value >= 0;
  const tooLow = machine && valid && value < machine.currentHours;
  const diff = machine && valid && !tooLow ? Math.round((value - machine.currentHours) * 10) / 10 : null;

  const preview =
    machine && valid && !tooLow
      ? machine.items
          .map((it) => ({ ...it, info: computeStatus(it.intervalHours, it.lastDoneHours, value, soonPercent) }))
          .filter((it) => it.info.status !== "ok")
          .sort((a, b) => compareStatus(a.info, b.info))
      : null;

  return (
    <ActionForm action={action} className="form-stack">
      <Field label="Mesin">
        <select name="equipmentId" value={id} onChange={(e) => setId(e.target.value)} required>
          <option value="" disabled>
            Pilih mesin…
          </option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} — {m.name}
            </option>
          ))}
        </select>
        {machine && (
          <span className="field-hint">
            Terakhir tercatat {fmtHours(machine.currentHours)} jam · {machine.updatedLabel}
          </span>
        )}
      </Field>

      <Field label="Angka hour meter">
        <div className="input-suffix reading-input">
          <input
            name="reading"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            required
            value={reading}
            onChange={(e) => setReading(e.target.value)}
            placeholder={machine ? String(machine.currentHours) : "0"}
          />
          <span>jam</span>
        </div>
        <span className={`diff${tooLow ? " bad" : ""}`}>
          {tooLow
            ? `Lebih kecil dari angka terakhir (${fmtHours(machine.currentHours)} jam). Hour meter tidak bisa mundur.`
            : diff !== null
              ? `+${fmtHours(diff)} jam sejak input terakhir`
              : ""}
        </span>
      </Field>

      {machine && (
        <div className="preview">
          <div className="preview-head">
            {preview ? "Yang perlu dikerjakan setelah disimpan" : "Ketik angka hour meter untuk melihat item yang akan jatuh tempo."}
          </div>
          {preview &&
            (preview.length === 0 ? (
              <div className="empty">
                {machine.items.length === 0 ? "Mesin ini belum punya item perawatan." : "Belum ada item yang jatuh tempo pada angka ini."}
              </div>
            ) : (
              <ul className="rows">
                {preview.map((it) => (
                  <li key={it.id} className="task">
                    <div>
                      <div className="task-name">{it.name}</div>
                      <div className="task-meta">tiap {fmtHours(it.intervalHours)} jam</div>
                    </div>
                    <div className="task-state">
                      <Status status={it.info.status} />
                      <span className="remaining">{fmtRemaining(it.info.remaining)}</span>
                    </div>
                    <Meter used={it.info.used} interval={it.intervalHours} status={it.info.status} />
                  </li>
                ))}
              </ul>
            ))}
        </div>
      )}

      <Field label="Catatan" hint="Opsional. Misalnya kondisi mesin saat dicek.">
        <textarea name="note" rows={2} placeholder="Mis. suara mesin kasar, oli rembes sedikit" />
      </Field>

      <button className="btn btn-primary btn-block btn-lg">Simpan jam</button>
    </ActionForm>
  );
}
