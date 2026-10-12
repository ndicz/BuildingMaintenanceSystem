"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { fmtHours } from "@/lib/format";
import { type FormState, int, num, str } from "@/lib/form";

/** Teknisi mengisi angka hour meter mesin. */
export async function recordHours(fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const equipmentId = int(fd, "equipmentId");
  const reading = num(fd, "reading");
  const note = str(fd, "note");

  if (!equipmentId) return { error: "Pilih mesin terlebih dahulu." };
  if (reading === null || reading < 0) return { error: "Isi angka jam mesin dengan benar." };

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) return { error: "Mesin tidak ditemukan." };
  if (reading < equipment.currentHours) {
    return {
      error: `Angka jam tidak boleh lebih kecil dari jam terakhir (${fmtHours(equipment.currentHours)} jam). Jika salah input sebelumnya, minta admin mengoreksi di menu Edit Mesin.`,
    };
  }

  await prisma.$transaction([
    prisma.hourLog.create({
      data: { equipmentId, userId: user.id, previousHours: equipment.currentHours, reading, note },
    }),
    prisma.equipment.update({
      where: { id: equipmentId },
      data: { currentHours: reading, hoursUpdatedAt: new Date() },
    }),
  ]);

  revalidatePath("/", "layout");
  redirect(`/mesin/${equipmentId}?ok=jam`);
}

/** Tandai satu atau beberapa item perawatan sudah dikerjakan. */
export async function completeItems(equipmentId: number, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const itemIds = fd
    .getAll("itemId")
    .map((v) => Number(v))
    .filter((n) => Number.isInteger(n));
  const doneHours = num(fd, "doneHours");
  const note = str(fd, "note");

  if (itemIds.length === 0) return { error: "Centang minimal satu item yang sudah dikerjakan." };

  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment) return { error: "Mesin tidak ditemukan." };
  if (doneHours === null || doneHours < 0) return { error: "Isi jam mesin saat pekerjaan dilakukan." };
  if (doneHours > equipment.currentHours) {
    return {
      error: `Jam pengerjaan tidak boleh melebihi jam mesin saat ini (${fmtHours(equipment.currentHours)} jam). Input jam mesin terbaru dulu.`,
    };
  }

  const items = await prisma.maintenanceItem.findMany({ where: { id: { in: itemIds }, equipmentId } });
  if (items.length !== itemIds.length) return { error: "Ada item yang tidak valid. Muat ulang halaman." };

  await prisma.$transaction(
    items.flatMap((item) => [
      prisma.maintenanceLog.create({
        data: { equipmentId, itemId: item.id, userId: user.id, itemName: item.name, doneHours, note },
      }),
      prisma.maintenanceItem.update({ where: { id: item.id }, data: { lastDoneHours: doneHours } }),
    ]),
  );

  revalidatePath("/", "layout");
  redirect(`/mesin/${equipmentId}?ok=selesai&n=${items.length}`);
}
