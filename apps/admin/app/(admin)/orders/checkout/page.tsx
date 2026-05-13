import { ReturnAll, SearchParams } from "@repo/core/types";
import { HeaderComponent } from "./heading-component";
import { ListCheckoutsView } from "./list-caisses";
import { getAdminFilters, listCheckoutsAction } from "@repo/actions/orders";
import { CheckoutPresenter, Shop } from "@repo/core/models";

export default async function Caisse({ searchParams }: { searchParams: SearchParams }) {
  const { page } = await searchParams;
  const checkouts : ReturnAll<CheckoutPresenter> = await listCheckoutsAction({limit: 50, offset: page ? parseInt(page) : 0, sort: "desc"});
  const filters = await getAdminFilters();
  const shops : ReturnAll<Shop> = {
    total: 0,
    count: 0,
    items: []
  }

  return <div className="container w-full">
      <HeaderComponent />
      <ListCheckoutsView shops={shops} filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
}