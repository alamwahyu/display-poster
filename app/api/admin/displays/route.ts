import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { displaySchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const displays = await prisma.display.findMany({
    include: { setting: true, _count: { select: { displayPosters: true } } },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }]
  });
  return NextResponse.json({ displays });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const parsed = displaySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const display = await prisma.$transaction(async (tx) => {
    const created = await tx.display.create({
      data: {
        ...parsed.data,
        setting: { create: {} }
      },
      include: { setting: true }
    });
    if (created.isDefault) {
      await tx.display.updateMany({ where: { id: { not: created.id } }, data: { isDefault: false } });
    }
    return created;
  });

  return NextResponse.json({ display }, { status: 201 });
}
