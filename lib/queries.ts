import { prisma } from "./db";
import { type ItemStatus, type StatusInfo, compareStatus, computeStatus, soonThresholdPercent, worstStatus } from "./status";

export type ItemWithStatus = {
  id: number;
  name: string;
  intervalHours: number;
  lastDoneHours: number;
  description: string;
  active: boolean;
  info: StatusInfo;
};

export async function getEquipmentOverview() {
  const percent = soonThresholdPercent();
  const list = await prisma.equipment.findMany({
    include: { items: { where: { active: true } } },
    orderBy: { code: "asc" },
  });
  return list.map((eq) => {
    const statuses = eq.items.map((it) => computeStatus(it.intervalHours, it.lastDoneHours, eq.currentHours, percent).status);
    const count = (s: ItemStatus) => statuses.filter((x) => x === s).length;
    return {
      id: eq.id,
      code: eq.code,
      name: eq.name,
      location: eq.location,
      category: eq.category,
      currentHours: eq.currentHours,
      hoursUpdatedAt: eq.hoursUpdatedAt,
      itemCount: eq.items.length,
      dueCount: count("due"),
      soonCount: count("soon"),
      worst: worstStatus(statuses),
    };
  });
}

/** Semua item aktif yang berstatus "Harus dikerjakan" atau "Segera", paling mendesak dulu. */
export async function getAttentionItems() {
  const percent = soonThresholdPercent();
  const items = await prisma.maintenanceItem.findMany({
    where: { active: true },
    include: { equipment: true },
  });
  return items
    .map((it) => ({
      id: it.id,
      name: it.name,
      intervalHours: it.intervalHours,
      equipment: {
        id: it.equipment.id,
        code: it.equipment.code,
        name: it.equipment.name,
        location: it.equipment.location,
        currentHours: it.equipment.currentHours,
      },
      info: computeStatus(it.intervalHours, it.lastDoneHours, it.equipment.currentHours, percent),
    }))
    .filter((it) => it.info.status !== "ok")
    .sort((a, b) => compareStatus(a.info, b.info));
}

export async function getEquipmentDetail(id: number) {
  const eq = await prisma.equipment.findUnique({
    where: { id },
    include: {
      items: { orderBy: [{ intervalHours: "asc" }, { name: "asc" }] },
      hourLogs: { orderBy: { createdAt: "desc" }, take: 10, include: { user: true } },
      maintenanceLogs: { orderBy: { createdAt: "desc" }, take: 20, include: { user: true } },
    },
  });
  if (!eq) return null;
  const percent = soonThresholdPercent();
  const items: ItemWithStatus[] = eq.items.map((it) => ({
    id: it.id,
    name: it.name,
    intervalHours: it.intervalHours,
    lastDoneHours: it.lastDoneHours,
    description: it.description,
    active: it.active,
    info: computeStatus(it.intervalHours, it.lastDoneHours, eq.currentHours, percent),
  }));
  // Item aktif diurutkan paling mendesak dulu; item nonaktif di bawah.
  items.sort((a, b) => Number(b.active) - Number(a.active) || compareStatus(a.info, b.info));
  return { ...eq, items };
}

export async function getEquipmentOptions() {
  return prisma.equipment.findMany({
    select: { id: true, code: true, name: true, currentHours: true },
    orderBy: { code: "asc" },
  });
}

/** Item yang perlu perhatian, dikelompokkan per mesin (mesin paling mendesak di atas). */
export async function getAttentionByEquipment() {
  const items = await getAttentionItems();
  const groups = new Map<number, { equipment: (typeof items)[number]["equipment"]; items: typeof items }>();
  for (const it of items) {
    const g = groups.get(it.equipment.id);
    if (g) g.items.push(it);
    else groups.set(it.equipment.id, { equipment: it.equipment, items: [it] });
  }
  return [...groups.values()];
}
