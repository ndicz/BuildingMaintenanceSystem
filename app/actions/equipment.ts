"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { type FormState, int, num, str } from "@/lib/form";

type EquipmentInput = { code: string; name: string; location: string; category: string; currentHours: number };

function readEquipment(fd: FormData): EquipmentInput | { error: string } {
  const code = str(fd, "code").toUpperCase();
  const name = str(fd, "name");
  const currentHours = num(fd, "currentHours");
  if (!code) return { error: "Kode mesin wajib diisi." };
  if (!name) return { error: "Nama mesin wajib diisi." };
  if (currentHours === null || currentHours < 0) return { error: "Jam mesin saat ini harus angka 0 atau lebih." };
  return { code, name, location: str(fd, "location"), category: str(fd, "category"), currentHours };
}

function isDuplicateCode(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
}

export async function createEquipment(fd: FormData): Promise<FormState> {
  await requireAdmin();
  const input = readEquipment(fd);
  if ("error" in input) return input;
  const copyFromId = int(fd, "copyFromId");

  let id: number;
  try {
    id = await prisma.$transaction(async (tx) => {
      const eq = await tx.equipment.create({ data: { ...input, hoursUpdatedAt: new Date() } });
      if (copyFromId) {
        const source = await tx.maintenanceItem.findMany({ where: { equipmentId: copyFromId } });
        // Item salinan dihitung mulai dari jam mesin baru saat ini.
        await tx.maintenanceItem.createMany({
          data: source.map((it) => ({
            equipmentId: eq.id,
            name: it.name,
            intervalHours: it.intervalHours,
            description: it.description,
            active: it.active,
            lastDoneHours: input.currentHours,
          })),
        });
      }
      return eq.id;
    });
  } catch (e) {
    if (isDuplicateCode(e)) return { error: `Kode "${input.code}" sudah dipakai mesin lain.` };
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(`/mesin/${id}`);
}

export async function updateEquipment(id: number, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const input = readEquipment(fd);
  if ("error" in input) return input;

  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) return { error: "Mesin tidak ditemukan." };
  const hoursChanged = existing.currentHours !== input.currentHours;

  try {
    await prisma.$transaction([
      prisma.equipment.update({
        where: { id },
        data: { ...input, ...(hoursChanged ? { hoursUpdatedAt: new Date() } : {}) },
      }),
      // Koreksi jam oleh admin tetap dicatat di riwayat input jam.
      ...(hoursChanged
        ? [
            prisma.hourLog.create({
              data: {
                equipmentId: id,
                userId: admin.id,
                previousHours: existing.currentHours,
                reading: input.currentHours,
                note: "Koreksi oleh admin",
              },
            }),
          ]
        : []),
    ]);
  } catch (e) {
    if (isDuplicateCode(e)) return { error: `Kode "${input.code}" sudah dipakai mesin lain.` };
    throw e;
  }

  revalidatePath("/", "layout");
  redirect(`/mesin/${id}`);
}

export async function deleteEquipment(id: number): Promise<FormState> {
  await requireAdmin();
  await prisma.equipment.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/mesin");
}
