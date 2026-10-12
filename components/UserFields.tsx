import { Field } from "./Field";

type Defaults = { name?: string; username?: string; role?: string; active?: boolean };

export function UserFields({ d, isNew }: { d?: Defaults; isNew: boolean }) {
  return (
    <>
      <Field label="Nama lengkap">
        <input name="name" defaultValue={d?.name} required />
      </Field>
      <Field label="Username" hint={isNew ? "Huruf kecil, angka, titik, - atau _" : "Username tidak bisa diubah."}>
        <input name="username" defaultValue={d?.username} required={isNew} disabled={!isNew} autoCapitalize="none" />
      </Field>
      <Field label="Peran">
        <select name="role" defaultValue={d?.role ?? "TEKNISI"}>
          <option value="TEKNISI">Teknisi</option>
          <option value="ADMIN">Admin</option>
        </select>
      </Field>
      <Field label={isNew ? "Password" : "Password baru"} hint={isNew ? "Minimal 6 karakter." : "Kosongkan jika tidak ingin mengganti."}>
        <input name="password" type="password" autoComplete="new-password" required={isNew} />
      </Field>
      {!isNew && (
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={d?.active ?? true} /> Akun aktif (nonaktifkan bila teknisi sudah tidak bertugas)
        </label>
      )}
    </>
  );
}
