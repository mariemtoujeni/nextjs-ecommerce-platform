import { SearchParams } from "@repo/core/types";
import { ListEvents } from "./event-list";
import { getAdminFilters } from "@repo/actions/events";


export default async function Events({ searchParams }: { searchParams: SearchParams }) {
    const { page } = await searchParams;
    const filters = await getAdminFilters();

    return <div className="container">                
        <ListEvents filters={filters} defaultPage={page ? parseInt(page) : 1} /> 
    </div>
}