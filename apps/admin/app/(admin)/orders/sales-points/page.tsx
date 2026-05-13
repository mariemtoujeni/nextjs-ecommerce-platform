import { ReturnAll, SearchParams } from "@repo/core/types";
import { Shop } from "@repo/core/models";
import { getAdminShopFiltersAction, getAllShopsAction } from "@repo/actions/orders";
import { HeaderComponent } from "./(common)/heading-component";
import { ListShopsView } from "./list-shops";

export default async function Shops({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const shops : ReturnAll<Shop> = await getAllShopsAction({limit: 50, offset: page ? parseInt(page) : 0, sort: "desc"});
    const filters = await getAdminShopFiltersAction();    

    return <div className="container w-full">
        <HeaderComponent state="list" />
        <ListShopsView shops={shops} filters={filters} defaultPage={page ? parseInt(page) : 1} />
    </div>
}