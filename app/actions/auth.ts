"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { type FormState, str } from "@/lib/form";

export async function login(fd: FormData): Promise<FormState> {
  const username = str(fd, "username").toLowerCase();
  const password = str(fd, "password");
  if (!username || !password) return { error: "Username dan password wajib diisi." };

  const user = await prisma.user.findUnique({ where: { username } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) return { error: "Username atau password salah." };
  if (!user.active) return { error: "Akun ini sudah dinonaktifkan. Hubungi admin." };

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function changeOwnPassword(fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const current = str(fd, "current");
  const next = str(fd, "password");
  const confirm = str(fd, "confirm");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, user.passwordHash))) return { error: "Password lama salah." };
  if (next.length < 6) return { error: "Password baru minimal 6 karakter." };
  if (next !== confirm) return { error: "Konfirmasi password tidak sama." };

  await prisma.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
  redirect("/akun?ok=1");
}
