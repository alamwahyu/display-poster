import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const [totalPosters, activePosters, inactivePosters, activeDisplays, latestPoster, latestDisplay] =
    await Promise.all([
      prisma.poster.count(),
      prisma.poster.count({ where: { status: "ACTIVE" } }),
      prisma.poster.count({ where: { status: "INACTIVE" } }),
      prisma.display.count({ where: { status: "ACTIVE" } }),
      prisma.poster.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } }),
      prisma.display.findFirst({ orderBy: { updatedAt: "desc" }, select: { updatedAt: true } })
    ]);

  const lastUpdated = [latestPoster?.updatedAt, latestDisplay?.updatedAt]
    .filter(Boolean)
    .sort((a, b) => Number(b) - Number(a))[0];

  return NextResponse.json({ totalPosters, activePosters, inactivePosters, activeDisplays, lastUpdated });
}
