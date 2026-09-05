import { AdminShell } from "@/components/AdminShell";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalPosters, activePosters, inactivePosters, activeDisplays, latestPoster, latestDisplay] =
    await Promise.all([
      prisma.poster.count(),
      prisma.poster.count({ where: { status: "ACTIVE" } }),
      prisma.poster.count({ where: { status: "INACTIVE" } }),
      prisma.display.count({ where: { status: "ACTIVE" } }),
      prisma.poster.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
      prisma.display.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } })
    ]);
  const lastUpdated = [latestPoster?.updatedAt, latestDisplay?.updatedAt].filter(Boolean).sort((a, b) => Number(b) - Number(a))[0];

  const stats = [
    ["Total Posters", totalPosters],
    ["Active Posters", activePosters],
    ["Inactive Posters", inactivePosters],
    ["Display Status", activeDisplays > 0 ? "Online" : "No Active Display"]
  ];

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan status signage dan konten.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-line bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Last Updated</p>
        <p className="mt-2 font-medium">{formatDate(lastUpdated as Date | undefined)}</p>
      </div>
    </AdminShell>
  );
}
