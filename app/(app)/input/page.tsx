import Link from "next/link";
import { recordHours } from "@/app/actions/hours";
import { getEquipmentOptions } from "@/lib/queries";
import { fmtHours } from "@/lib/format";
import { ActionForm } from "@/components/ActionForm";
import { Field } from "@/components/Field";

export const metadata = { title: "Input Jam" };

export default async function InputPage({ searchParams }: { searchParams: Promise<{ mesin?: string }> }) {
  const { mesin } = await searchParams;
  const options = await getEquipmentOptions();
  const selected = options.find((o) => String(o.id) === mesin);

  return (
    <>
      <div className="page-head">
        <h1>Input Jam Mesin</h1>
      </div>
      <div className="card narrow">
        {options.length === 0 ? (
          <p className="empty">
            Belum ada mesin. <Link href="/mesin/baru">Tambahkan mesin</Link> terlebih dahulu (khusus admin).
          </p>
        ) : (
          <ActionForm action={recordHours} className="stack">
            <Field label="Mesin">
              <select name="equipmentId" defaultValue={selected?.id ?? ""} required>
                <option value="" disabled>
                  — Pilih mesin —
                </option>
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} · {o.name} (sekarang {fmtHours(o.currentHours)} jam)
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Angka hour meter (jam)" hint="Lihat angka di hour meter mesin, lalu ketik di sini.">
              <input name="reading" type="number" inputMode="decimal" step="0.1" min="0" required placeholder="mis. 1250" />
            </Field>
            <Field label="Catatan (opsional)">
              <textarea name="note" rows={2} placeholder="mis. mesin bunyi kasar, oli rembes" />
            </Field>
            <button className="btn btn-primary btn-block">Simpan &amp; lihat item yang harus dikerjakan</button>
          </ActionForm>
        )}
      </div>
    </>
  );
}
