import { ReturnAll, SearchParams } from "@repo/core/types";
import { ReturnPresenter } from "@repo/core/models";
import { getAdminReturnFiltersAction, listReturnsAction } from "@repo/actions/orders";
import { HeaderComponent } from "./heading-component";
import { ListReturnsView } from "./list-returns";


export default async function Returns({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;  
    const returns : ReturnAll<ReturnPresenter> = await listReturnsAction({limit: 10, offset: 0, sort: "asc"});
    const filters = await getAdminReturnFiltersAction();
    return <div className="container w-full">
        <HeaderComponent />
        <ListReturnsView returns={returns} filters={filters}/>
    </div>;
}