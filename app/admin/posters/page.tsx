import { AdminShell } from "@/components/AdminShell";
import { PosterManager } from "@/components/PosterManager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PostersPage() {
  const [posters, displays] = await Promise.all([
    prisma.poster.findMany({
      include: { displayPosters: { include: { display: true }, orderBy: { sortOrder: "asc" } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    }),
    prisma.display.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" } })
  ]);
  return (
    <AdminShell>
      <PosterManager initialPosters={JSON.parse(JSON.stringify(posters))} displays={displays} />
    </AdminShell>
  );
}
