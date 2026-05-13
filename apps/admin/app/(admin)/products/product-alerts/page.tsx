import { Heading } from "~/components/ui";
import { AlertList } from "./alert-list";
import { SearchParams } from "@repo/core/types";
import { getAdminFilters } from "@repo/actions/product-alerts";

export default async function ProductAlertPage({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminFilters();

  return (
    <div className="container">
      <Heading heading="2">Alertes produit</Heading>
      <AlertList filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
  );
}

