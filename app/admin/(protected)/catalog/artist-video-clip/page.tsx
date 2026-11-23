import { ArtistClipContentEditor } from "@/features/admin/artist-clip/ArtistClipContentEditor";

/** Catalog → Artist video clip: its picks (location, weather, time) and ready-made videos. */
export default function ArtistVideoClipContentPage() {
  return (
    <div className="p-6">
      <ArtistClipContentEditor />
    </div>
  );
}
