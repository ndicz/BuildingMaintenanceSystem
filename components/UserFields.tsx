import { Field } from "./Field";

type Defaults = { name?: string; username?: string; role?: string; active?: boolean };

export function UserFields({ d, isNew }: { d?: Defaults; isNew: boolean }) {
  return (
    <>
      <Field label="Nama lengkap">
        <input name="name" defaultValue={d?.name} required />
      </Field>
      <div className="grid-2">
        <Field label="Username" hint={isNew ? "Huruf kecil, angka, titik, - atau _" : "Tidak bisa diubah."}>
          <input name="username" defaultValue={d?.username} required={isNew} disabled={!isNew} autoCapitalize="none" spellCheck={false} />
        </Field>
        <Field label="Peran">
          <select name="role" defaultValue={d?.role ?? "TEKNISI"}>
            <option value="TEKNISI">Teknisi</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
      </div>
      <Field label={isNew ? "Password" : "Password baru"} hint={isNew ? "Minimal 6 karakter." : "Kosongkan jika tidak ingin mengganti."}>
        <input name="password" type="password" autoComplete="new-password" required={isNew} />
      </Field>
      {!isNew && (
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={d?.active ?? true} />
          <span>
            Akun aktif
            <span className="field-hint" style={{ display: "block" }}>
              Matikan jika teknisi sudah tidak bertugas. Riwayat kerjanya tetap tersimpan.
            </span>
          </span>
        </label>
      )}
    </>
  );
}
