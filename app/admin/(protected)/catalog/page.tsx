import { CatalogManager } from "@/features/admin/catalog/CatalogManager";

/** Catalog: what we sell by kind (Smpl generators, models, Smpl compute) and studios. */
export default function CatalogPage() {
  return (
    <div className="p-6">
      <CatalogManager />
    </div>
  );
}
