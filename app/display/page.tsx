import { DisplayPlayer } from "@/components/DisplayPlayer";
import { getDisplayPlaylist } from "@/lib/display";

export const dynamic = "force-dynamic";

function fitParam(value?: string) {
  if (value === "contain") return "CONTAIN";
  if (value === "cover") return "COVER";
  if (value === "stretch") return "STRETCH";
  return undefined;
}

export default async function DisplayPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const playlist = await getDisplayPlaylist();
  const payload = playlist
    ? { display: playlist.display, settings: playlist.display.setting, posters: playlist.posters }
    : { display: null, settings: null, posters: [] };
  return (
    <DisplayPlayer
      initialPayload={JSON.parse(JSON.stringify(payload))}
      forceFit={fitParam(query.fit)}
      debug={query.debug === "true"}
      autoFullscreen={query.fullscreen === "true"}
    />
  );
}
