import { GenericFilter } from "@repo/core/types";
import { EventFilterTypeAdmin } from "@repo/core/models";

const filterFetch: Record<EventFilterTypeAdmin, () => Promise<GenericFilter>> = {

    [EventFilterTypeAdmin.STATE]: async () => ({key: EventFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: 0, name: "Brouillon"},
            {id: 1, name: "Publié"},
            {id: 2, name: "Dépublié"},
            {id: 3, name: "A venir"},
        ]}),
}

export const getAdminEventFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}


