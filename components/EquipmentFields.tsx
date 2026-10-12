import { Field } from "./Field";

type Defaults = { code?: string; name?: string; location?: string; category?: string; currentHours?: number };

export function EquipmentFields({ d = {} }: { d?: Defaults }) {
  return (
    <>
      <div className="grid-2">
        <Field label="Kode mesin" hint="Singkat & unik, mis. GEN-01">
          <input name="code" defaultValue={d.code} required maxLength={30} />
        </Field>
        <Field label="Nama mesin">
          <input name="name" defaultValue={d.name} required placeholder="mis. Genset Utama 500 kVA" />
        </Field>
        <Field label="Lokasi">
          <input name="location" defaultValue={d.location} placeholder="mis. Basement – Ruang Genset" />
        </Field>
        <Field label="Kategori">
          <input name="category" defaultValue={d.category} placeholder="mis. Genset, Chiller, Pompa" />
        </Field>
      </div>
      <Field label="Jam mesin saat ini (hour meter)">
        <input name="currentHours" type="number" inputMode="decimal" step="0.1" min="0" defaultValue={d.currentHours ?? 0} required />
      </Field>
    </>
  );
}
