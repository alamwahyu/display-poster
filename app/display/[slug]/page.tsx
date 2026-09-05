import { DisplayPlayer } from "@/components/DisplayPlayer";
import { getDisplayPlaylist } from "@/lib/display";

export const dynamic = "force-dynamic";

function fitParam(value?: string) {
  if (value === "contain") return "CONTAIN";
  if (value === "cover") return "COVER";
  if (value === "stretch") return "STRETCH";
  return undefined;
}

export default async function DisplaySlugPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const playlist = await getDisplayPlaylist(slug);
  const payload = playlist
    ? { display: playlist.display, settings: playlist.display.setting, posters: playlist.posters }
    : { display: null, settings: null, posters: [] };
  return (
    <DisplayPlayer
      slug={slug}
      initialPayload={JSON.parse(JSON.stringify(payload))}
      forceFit={fitParam(query.fit)}
      debug={query.debug === "true"}
      autoFullscreen={query.fullscreen === "true"}
    />
  );
}
