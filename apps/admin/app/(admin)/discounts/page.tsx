import { ListDiscounts } from "./table";
import { SearchParams } from "@repo/core/types";
import { getAdminFilters } from "@repo/actions/discounts";
import { Heading } from "~/components/ui";
import { DiscountSelect } from "./select-discount";

export default async function Discounts({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const filters = await getAdminFilters();

  return (
    <div className="container">
      <div className="flex flex-row justify-between w-full">
        <Heading heading={"2"} className="text-gray-700">Réductions</Heading>
        <DiscountSelect />
      </div>
      <ListDiscounts filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
  );
}
