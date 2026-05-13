import { getAdminFilters } from "@repo/actions/categories";
import { ListingComponent } from "./list-component";
import { SearchParams } from "@repo/core/types";

export default async function Category({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const filters = await getAdminFilters();
  
  return (
    <div className="container "> 
      <ListingComponent filters={filters} defaultPage={page ? parseInt(page) : 1} /> 
    </div>
  );
}