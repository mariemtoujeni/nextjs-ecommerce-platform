
import { InventoryTable } from "./table";
import { SearchParams } from "@repo/core/types";
import { getAdminFilters } from "@repo/actions/inventory";

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const filters = await getAdminFilters();

  return (
    <div className="container">
      <InventoryTable filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
  );
}

