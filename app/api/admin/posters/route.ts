import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { posterFormSchema } from "@/lib/validation";
import { savePosterImage } from "@/lib/upload";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;
  const posters = await prisma.poster.findMany({
    include: { displayPosters: { include: { display: true }, orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });
  return NextResponse.json({ posters });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Poster image is required." }, { status: 400 });
  }

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

  const upload = await savePosterImage(file);
  const poster = await prisma.poster.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      sortOrder: parsed.data.sortOrder,
      duration: parsed.data.duration,
      fitMode: parsed.data.fitMode,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      imageUrl: upload.imageUrl,
      thumbnailUrl: upload.thumbnailUrl,
      orientation: upload.orientation,
      displayPosters: {
        create: parsed.data.displayIds.map((displayId, index) => ({
          displayId,
          sortOrder: parsed.data.sortOrder || index
        }))
      }
    }
  });

  return NextResponse.json({ poster }, { status: 201 });
}
