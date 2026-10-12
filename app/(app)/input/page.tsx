import Link from "next/link";
import { recordHours } from "@/app/actions/hours";
import { prisma } from "@/lib/db";
import { fmtRelative } from "@/lib/format";
import { soonThresholdPercent } from "@/lib/status";
import { type EntryMachine, HourEntry } from "@/components/HourEntry";
import { PageHeader } from "@/components/PageHeader";

export const metadata = { title: "Input jam" };

export default async function InputPage({ searchParams }: { searchParams: Promise<{ mesin?: string }> }) {
  const { mesin } = await searchParams;
  const list = await prisma.equipment.findMany({
    include: { items: { where: { active: true }, select: { id: true, name: true, intervalHours: true, lastDoneHours: true } } },
    orderBy: { code: "asc" },
  });
  const machines: EntryMachine[] = list.map((e) => ({
    id: e.id,
    code: e.code,
    name: e.name,
    currentHours: e.currentHours,
    updatedLabel: fmtRelative(e.hoursUpdatedAt),
    items: e.items,
  }));
  const defaultId = machines.find((m) => String(m.id) === mesin)?.id;

  return (
    <>
      <PageHeader title="Input jam mesin" desc="Lihat angka di hour meter mesin, lalu ketik di sini." />
      <section className="panel panel-narrow">
        <div className="panel-body">
          {machines.length === 0 ? (
            <div className="empty">
              <strong>Belum ada mesin</strong>
              <Link href="/mesin/baru">Tambahkan mesin</Link> terlebih dahulu (khusus admin).
            </div>
          ) : (
            <HourEntry machines={machines} defaultId={defaultId} soonPercent={soonThresholdPercent()} action={recordHours} />
          )}
        </div>
      </section>
    </>
  );
}
