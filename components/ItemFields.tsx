import { Field } from "./Field";

type Defaults = { name?: string; intervalHours?: number; lastDoneHours?: number; description?: string; active?: boolean };

export function ItemFields({ d = {}, showActive = false }: { d?: Defaults; showActive?: boolean }) {
  return (
    <>
      <Field label="Nama pekerjaan">
        <input name="name" defaultValue={d.name} required placeholder="Ganti oli mesin & filter oli" />
      </Field>
      <div className="grid-2">
        <Field label="Dikerjakan tiap" hint="Mis. 100, 250, atau 500 jam.">
          <div className="input-suffix">
            <input name="intervalHours" type="number" inputMode="decimal" step="0.1" min="0.1" defaultValue={d.intervalHours} required />
            <span>jam</span>
          </div>
        </Field>
        <Field label="Terakhir dikerjakan di jam" hint="Hitungan interval dimulai dari angka ini.">
          <div className="input-suffix">
            <input name="lastDoneHours" type="number" inputMode="decimal" step="0.1" min="0" defaultValue={d.lastDoneHours ?? 0} required />
            <span>jam</span>
          </div>
        </Field>
      </div>
      <Field label="Keterangan" hint="Opsional. Mis. jenis oli, jumlah, atau langkah kerja.">
        <textarea name="description" rows={3} defaultValue={d.description} placeholder="Oli SAE 15W-40, 18 liter" />
      </Field>
      {showActive && (
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={d.active ?? true} />
          <span>
            Aktif
            <span className="field-hint" style={{ display: "block" }}>
              Matikan jika item ini tidak dipantau lagi. Riwayatnya tetap tersimpan.
            </span>
          </span>
        </label>
      )}
    </>
  );
}
