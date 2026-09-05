import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { displaySettingSchema } from "@/lib/validation";

async function defaultDisplayId() {
  const display = await prisma.display.findFirst({ where: { isDefault: true }, orderBy: { createdAt: "asc" } });
  return display?.id;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const displayId = await defaultDisplayId();
  if (!displayId) return NextResponse.json({ error: "Default display not found." }, { status: 404 });
  const setting = await prisma.displaySetting.upsert({
    where: { displayId },
    update: {},
    create: { displayId }
  });
  return NextResponse.json({ setting, displayId });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const displayId = await defaultDisplayId();
  if (!displayId) return NextResponse.json({ error: "Default display not found." }, { status: 404 });
  const parsed = displaySettingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const setting = await prisma.displaySetting.upsert({
    where: { displayId },
    update: parsed.data,
    create: { displayId, ...parsed.data }
  });
  return NextResponse.json({ setting });
}
