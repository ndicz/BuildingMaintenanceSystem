import { Field } from "./Field";

type Defaults = { name?: string; intervalHours?: number; lastDoneHours?: number; description?: string; active?: boolean };

export function ItemFields({ d = {}, showActive = false }: { d?: Defaults; showActive?: boolean }) {
  return (
    <>
      <Field label="Nama pekerjaan">
        <input name="name" defaultValue={d.name} required placeholder="mis. Ganti oli mesin & filter oli" />
      </Field>
      <div className="grid-2">
        <Field label="Interval (tiap berapa jam)" hint="mis. 100, 250, 500">
          <input name="intervalHours" type="number" inputMode="decimal" step="0.1" min="0.1" defaultValue={d.intervalHours} required />
        </Field>
        <Field label="Terakhir dikerjakan pada jam ke-" hint="Hitungan interval dimulai dari angka ini.">
          <input name="lastDoneHours" type="number" inputMode="decimal" step="0.1" min="0" defaultValue={d.lastDoneHours ?? 0} required />
        </Field>
      </div>
      <Field label="Keterangan / langkah kerja (opsional)">
        <textarea name="description" rows={3} defaultValue={d.description} placeholder="mis. Oli SAE 15W-40, 18 liter" />
      </Field>
      {showActive && (
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={d.active ?? true} /> Aktif (nonaktifkan bila tidak dipakai lagi)
        </label>
      )}
    </>
  );
}
