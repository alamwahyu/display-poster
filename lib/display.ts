import { prisma } from "@/lib/prisma";

export async function getDisplayPlaylist(slug?: string) {
  const now = new Date();
  const display = slug
    ? await prisma.display.findUnique({ where: { slug }, include: { setting: true } })
    : await prisma.display.findFirst({ where: { isDefault: true }, include: { setting: true } });

  if (!display || display.status !== "ACTIVE") return null;

  const rows = await prisma.displayPoster.findMany({
    where: {
      displayId: display.id,
      poster: {
        status: "ACTIVE",
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] }
        ]
      }
    },
    include: { poster: true },
    orderBy: [{ sortOrder: "asc" }, { poster: { sortOrder: "asc" } }]
  });

  return {
    display,
    posters: rows.map((row) => ({
      ...row.poster,
      displaySortOrder: row.sortOrder
    }))
  };
}
