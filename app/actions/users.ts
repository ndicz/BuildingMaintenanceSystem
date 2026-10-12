"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { type Role, requireAdmin } from "@/lib/auth";
import { type FormState, bool, str } from "@/lib/form";

function readRole(fd: FormData): Role {
  return str(fd, "role") === "ADMIN" ? "ADMIN" : "TEKNISI";
}

function validUsername(u: string): boolean {
  return /^[a-z0-9._-]{3,32}$/.test(u);
}

export async function createUser(fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = str(fd, "name");
  const username = str(fd, "username").toLowerCase();
  const password = str(fd, "password");
  if (!name) return { error: "Nama wajib diisi." };
  if (!validUsername(username)) return { error: "Username 3-32 karakter: huruf kecil, angka, titik, - atau _." };
  if (password.length < 6) return { error: "Password minimal 6 karakter." };

  try {
    await prisma.user.create({
      data: { name, username, role: readRole(fd), passwordHash: await bcrypt.hash(password, 10) },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: `Username "${username}" sudah dipakai.` };
    }
    throw e;
  }
  revalidatePath("/pengguna");
  redirect("/pengguna");
}

export async function updateUser(id: number, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const name = str(fd, "name");
  const password = str(fd, "password");
  const role = readRole(fd);
  const active = bool(fd, "active");
  if (!name) return { error: "Nama wajib diisi." };
  if (password && password.length < 6) return { error: "Password baru minimal 6 karakter." };
  if (id === admin.id && (role !== "ADMIN" || !active)) {
    return { error: "Anda tidak bisa menurunkan peran atau menonaktifkan akun sendiri." };
  }

  await prisma.user.update({
    where: { id },
    data: { name, role, active, ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {}) },
  });
  revalidatePath("/pengguna");
  redirect("/pengguna");
}
