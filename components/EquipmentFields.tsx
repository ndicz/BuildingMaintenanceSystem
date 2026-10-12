import { Field } from "./Field";

type Defaults = { code?: string; name?: string; location?: string; category?: string; currentHours?: number };

export function EquipmentFields({ d = {}, hoursHint }: { d?: Defaults; hoursHint?: string }) {
  return (
    <>
      <div className="grid-2">
        <Field label="Kode" hint="Singkat dan unik, mis. GEN-01">
          <input name="code" defaultValue={d.code} required maxLength={30} autoCapitalize="characters" spellCheck={false} />
        </Field>
        <Field label="Nama mesin">
          <input name="name" defaultValue={d.name} required placeholder="Genset Utama 500 kVA" />
        </Field>
        <Field label="Kategori">
          <input name="category" defaultValue={d.category} placeholder="Genset, Chiller, Pompa…" />
        </Field>
        <Field label="Lokasi">
          <input name="location" defaultValue={d.location} placeholder="Basement, Ruang Genset" />
        </Field>
      </div>
      <Field label="Jam mesin saat ini" hint={hoursHint ?? "Angka yang tertera di hour meter sekarang."}>
        <div className="input-suffix">
          <input name="currentHours" type="number" inputMode="decimal" step="0.1" min="0" defaultValue={d.currentHours ?? 0} required />
          <span>jam</span>
        </div>
      </Field>
    </>
  );
}
