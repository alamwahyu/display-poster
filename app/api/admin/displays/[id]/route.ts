import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { displaySchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const display = await prisma.display.findUnique({
    where: { id },
    include: { setting: true, displayPosters: { include: { poster: true } } }
  });
  if (!display) return NextResponse.json({ error: "Display not found." }, { status: 404 });
  return NextResponse.json({ display });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = displaySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const display = await prisma.$transaction(async (tx) => {
    const updated = await tx.display.update({ where: { id }, data: parsed.data, include: { setting: true } });
    if (updated.isDefault) {
      await tx.display.updateMany({ where: { id: { not: updated.id } }, data: { isDefault: false } });
    }
    return updated;
  });

  return NextResponse.json({ display });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  await prisma.display.delete({ where: { id } });
  const hasDefault = await prisma.display.findFirst({ where: { isDefault: true } });
  if (!hasDefault) {
    const first = await prisma.display.findFirst({ orderBy: { createdAt: "asc" } });
    if (first) await prisma.display.update({ where: { id: first.id }, data: { isDefault: true } });
  }
  return NextResponse.json({ ok: true });
}
