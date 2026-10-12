import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Data contoh agar alur aplikasi langsung terlihat. Nonaktifkan dengan SEED_DEMO=false.
const DEMO_EQUIPMENT = [
  {
    code: "GEN-01",
    name: "Genset Utama 500 kVA",
    location: "Basement – Ruang Genset",
    category: "Genset",
    currentHours: 1205,
    items: [
      { name: "Ganti oli mesin & filter oli", intervalHours: 100, lastDoneHours: 1100, description: "Oli SAE 15W-40" },
      { name: "Cek & tambah air radiator", intervalHours: 50, lastDoneHours: 1200, description: "" },
      { name: "Cek tegangan & air aki", intervalHours: 100, lastDoneHours: 1150, description: "" },
      { name: "Ganti filter udara", intervalHours: 250, lastDoneHours: 960, description: "" },
      { name: "Ganti filter solar", intervalHours: 250, lastDoneHours: 1000, description: "" },
      { name: "Tune up / servis besar", intervalHours: 1000, lastDoneHours: 500, description: "Dikerjakan vendor resmi" },
    ],
  },
  {
    code: "CH-01",
    name: "Chiller Atap",
    location: "Lantai Atap",
    category: "Chiller / AC",
    currentHours: 3420,
    items: [
      { name: "Cek & kencangkan belt", intervalHours: 300, lastDoneHours: 3100, description: "" },
      { name: "Cek tekanan freon", intervalHours: 250, lastDoneHours: 3180, description: "" },
      { name: "Bersihkan kondensor", intervalHours: 500, lastDoneHours: 3000, description: "" },
      { name: "Ganti oli kompresor", intervalHours: 2000, lastDoneHours: 2000, description: "" },
    ],
  },
  {
    code: "PMP-01",
    name: "Pompa Air Bersih",
    location: "Basement – Ruang Pompa",
    category: "Pompa",
    currentHours: 860,
    items: [
      { name: "Cek panel kontrol pompa", intervalHours: 100, lastDoneHours: 790, description: "" },
      { name: "Lumasi bearing", intervalHours: 200, lastDoneHours: 700, description: "Grease lithium" },
      { name: "Cek mechanical seal", intervalHours: 500, lastDoneHours: 500, description: "" },
    ],
  },
];

async function upsertUser(username: string, name: string, role: "ADMIN" | "TEKNISI", password: string) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return existing;
  console.log(`  + pengguna ${username} / ${password} (${role})`);
  return prisma.user.create({ data: { username, name, role, passwordHash: await bcrypt.hash(password, 10) } });
}

async function main() {
  console.log("Mengisi data awal...");
  const admin = await upsertUser("admin", "Administrator", "ADMIN", "admin123");

  if (process.env.SEED_DEMO === "false") return;

  await upsertUser("teknisi", "Teknisi Contoh", "TEKNISI", "teknisi123");
  if ((await prisma.equipment.count()) > 0) {
    console.log("  Mesin sudah ada, data contoh dilewati.");
    return;
  }
  for (const { items, ...eq } of DEMO_EQUIPMENT) {
    await prisma.equipment.create({
      data: {
        ...eq,
        hoursUpdatedAt: new Date(),
        items: { create: items },
        hourLogs: { create: { userId: admin.id, previousHours: 0, reading: eq.currentHours, note: "Data awal" } },
      },
    });
    console.log(`  + mesin ${eq.code} (${items.length} item)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
