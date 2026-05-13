import { ListQuotations } from "./list-quotations";
import { HeadingComponent } from "./heading-component";
import { SearchParams } from "@repo/core/types";
import { getAdminQuotationFiltersAction } from "@repo/actions/quotation";

export default async function Quotations({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminQuotationFiltersAction();

  return (
    <div className="container">
      <HeadingComponent />
      <ListQuotations filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
  );
}
