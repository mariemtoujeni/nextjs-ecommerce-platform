import { ReturnAll } from "@repo/core/types";
import { HeaderComponent } from "./heading-component";
import { Client } from "@repo/core/models";
import { getAllClientAction } from "@repo/actions/clients";

import { ListGiftCardsView } from "./list-gift-cards";
import { SearchParams } from "@repo/core/types";
import { getAdminGiftCardFilters } from "@repo/core/usecases";

export default async function GiftCards({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const clients : ReturnAll<Client> = await getAllClientAction({limit: 100, offset: 0, sort: "asc"});
    const filters = await getAdminGiftCardFilters();
    
    return <div className="container w-full">
        <HeaderComponent clients={clients} />
        <ListGiftCardsView filters={filters} page={page ? parseInt(page) : 1} />
    </div>;
}