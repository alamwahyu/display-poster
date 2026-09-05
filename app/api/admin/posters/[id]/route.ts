import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { posterFormSchema } from "@/lib/validation";
import { savePosterImage } from "@/lib/upload";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const poster = await prisma.poster.findUnique({
    where: { id },
    include: { displayPosters: { include: { display: true } } }
  });
  if (!poster) return NextResponse.json({ error: "Poster not found." }, { status: 404 });
  return NextResponse.json({ poster });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  const form = await request.formData();
  const parsed = posterFormSchema.safeParse({
    title: form.get("title"),
    description: form.get("description") || null,
    status: form.get("status") || "ACTIVE",
    sortOrder: form.get("sortOrder") || 0,
    duration: form.get("duration") || 10,
    fitMode: form.get("fitMode") || "CONTAIN",
    startDate: form.get("startDate") || null,
    endDate: form.get("endDate") || null,
    displayIds: form.getAll("displayIds").map(String)
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const file = form.get("image");
  const upload = file instanceof File && file.size > 0 ? await savePosterImage(file) : null;

    const poster = await prisma.$transaction(async (tx) => {
    await tx.displayPoster.deleteMany({ where: { posterId: id } });
    return tx.poster.update({
      where: { id },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        status: parsed.data.status,
        sortOrder: parsed.data.sortOrder,
        duration: parsed.data.duration,
        fitMode: parsed.data.fitMode,
        startDate: parsed.data.startDate,
        endDate: parsed.data.endDate,
        ...(upload
          ? {
              imageUrl: upload.imageUrl,
              thumbnailUrl: upload.thumbnailUrl,
              orientation: upload.orientation
            }
          : {}),
        displayPosters: {
          create: parsed.data.displayIds.map((displayId, index) => ({
            displayId,
            sortOrder: parsed.data.sortOrder || index
          }))
        }
      }
    });
  });

  return NextResponse.json({ poster });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const { id } = await params;
  await prisma.poster.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
