import { GenericFilter } from "@repo/core/types";
import { CategoryFilterTypeAdmin } from "@repo/core/models";

const filterFetch: Record<CategoryFilterTypeAdmin, () => Promise<GenericFilter>> = {

    [CategoryFilterTypeAdmin.STATE]: async () => ({key: CategoryFilterTypeAdmin.STATE, text: "État"
        , values: [
            {id: 1, name: "Actif"},
            {id: 0, name: "Inactif"},
        ]}),
}

export const getAdminCategoryFilters = async (): Promise<GenericFilter[]> => {
    const filter = await Promise.all(Object.values(filterFetch).map(fetch => fetch()));

    return filter;
}


