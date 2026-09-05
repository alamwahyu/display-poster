import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { reorderSchema } from "@/lib/validation";

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const parsed = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.$transaction(
    parsed.data.items.map((item) =>
      prisma.poster.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
    )
  );
  return NextResponse.json({ ok: true });
}
