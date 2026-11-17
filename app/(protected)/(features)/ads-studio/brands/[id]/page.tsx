import { BrandPage } from "@/features/brands/components/BrandPage";

/** One brand kit: extraction progress, then review and edit. */
export default async function AdsStudioBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BrandPage id={id} />;
}
