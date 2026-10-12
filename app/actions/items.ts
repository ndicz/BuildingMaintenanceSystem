"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { type FormState, bool, num, str } from "@/lib/form";

type ItemInput = { name: string; intervalHours: number; lastDoneHours: number; description: string };

function readItem(fd: FormData): ItemInput | { error: string } {
  const name = str(fd, "name");
  const intervalHours = num(fd, "intervalHours");
  const lastDoneHours = num(fd, "lastDoneHours");
  if (!name) return { error: "Nama pekerjaan wajib diisi." };
  if (intervalHours === null || intervalHours <= 0) return { error: "Interval jam harus lebih dari 0." };
  if (lastDoneHours === null || lastDoneHours < 0) return { error: "Jam terakhir dikerjakan harus angka 0 atau lebih." };
  return { name, intervalHours, lastDoneHours, description: str(fd, "description") };
}

export async function createItem(equipmentId: number, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const input = readItem(fd);
  if ("error" in input) return input;
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) return { error: "Mesin tidak ditemukan." };
  if (input.lastDoneHours > equipment.currentHours) {
    return { error: "Jam terakhir dikerjakan tidak boleh melebihi jam mesin saat ini." };
  }

  await prisma.maintenanceItem.create({ data: { ...input, equipmentId } });
  revalidatePath("/", "layout");
  redirect(`/mesin/${equipmentId}`);
}

export async function updateItem(equipmentId: number, itemId: number, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const input = readItem(fd);
  if ("error" in input) return input;
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) return { error: "Mesin tidak ditemukan." };
  if (input.lastDoneHours > equipment.currentHours) {
    return { error: "Jam terakhir dikerjakan tidak boleh melebihi jam mesin saat ini." };
  }

  await prisma.maintenanceItem.update({
    where: { id: itemId, equipmentId },
    data: { ...input, active: bool(fd, "active") },
  });
  revalidatePath("/", "layout");
  redirect(`/mesin/${equipmentId}`);
}

export async function deleteItem(equipmentId: number, itemId: number): Promise<FormState> {
  await requireAdmin();
  await prisma.maintenanceItem.delete({ where: { id: itemId, equipmentId } });
  revalidatePath("/", "layout");
  redirect(`/mesin/${equipmentId}`);
}
