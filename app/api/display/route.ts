import { NextResponse } from "next/server";
import { getDisplayPlaylist } from "@/lib/display";

export const dynamic = "force-dynamic";

export async function GET() {
  const playlist = await getDisplayPlaylist();
  if (!playlist) return NextResponse.json({ display: null, posters: [], settings: null });
  return NextResponse.json({
    display: playlist.display,
    settings: playlist.display.setting,
    posters: playlist.posters
  });
}
