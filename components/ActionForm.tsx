"use client";

import { type FormEvent, type ReactNode, useState, useTransition } from "react";
import type { FormState } from "@/lib/form";

type Props = {
  action: (fd: FormData) => Promise<FormState>;
  children: ReactNode;
  className?: string;
  /** Jika diisi, minta konfirmasi sebelum mengirim (mis. untuk hapus). */
  confirm?: string;
};

/**
 * Form yang memanggil server action tanpa mengosongkan isian saat ada error,
 * dan menampilkan pesan error dari server di atas form.
 */
export function ActionForm({ action, children, className, confirm }: Props) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (confirm && !window.confirm(confirm)) return;
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await action(fd);
      setError(result?.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className={className} aria-busy={pending}>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      <fieldset disabled={pending} className="plain">
        {children}
      </fieldset>
    </form>
  );
}
