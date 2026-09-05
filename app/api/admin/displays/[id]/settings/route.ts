import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { displaySettingSchema } from "@/lib/validation";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const setting = await prisma.displaySetting.upsert({
    where: { displayId: id },
    update: {},
    create: { displayId: id }
  });
  return NextResponse.json({ setting });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const parsed = displaySettingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const setting = await prisma.displaySetting.upsert({
    where: { displayId: id },
    update: parsed.data,
    create: { displayId: id, ...parsed.data }
  });
  return NextResponse.json({ setting });
}
