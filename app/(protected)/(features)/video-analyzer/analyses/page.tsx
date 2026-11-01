import { redirect } from "next/navigation";

/** The analyses list now lives on the analyzer page itself. */
export default function VideoAnalysesPage() {
  redirect("/video-analyzer");
}
