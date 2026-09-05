import { NextResponse } from "next/server";
import { getDisplayPlaylist } from "@/lib/display";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const playlist = await getDisplayPlaylist(slug);
  if (!playlist) return NextResponse.json({ display: null, posters: [], settings: null }, { status: 404 });
  return NextResponse.json({
    display: playlist.display,
    settings: playlist.display.setting,
    posters: playlist.posters
  });
}
