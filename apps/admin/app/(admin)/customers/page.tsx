import { ListClients } from "./list-clients";
import { HeadingComponent } from "./heading-component";
import { SearchParams } from "@repo/core/types";
import { getAdminClientFilters } from "@repo/core/usecases";

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const filters = await getAdminClientFilters();

  return (
    <div className="container">
      <HeadingComponent />
      <ListClients filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
  );
}

