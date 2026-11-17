"use client";
import MediaExplorer from "@/features/media/components/MediaExplorer";
import { LibraryPage } from "@/features/ads-studio/components/library/LibraryPage";
import { ADS_MODEL } from "@/features/ads-studio/components/composer/AdsComposer";

/** Ads Studio → All media: the ads this user made (running jobs show first). */
export default function AdsStudioMediaPage() {
  return (
    <LibraryPage
      title="All media"
      description="Every ad you've made in Ads Studio."
    >
      <MediaExplorer defaultModel={ADS_MODEL} jobsDomain="ads-studio" />
    </LibraryPage>
  );
}
