'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminShopFilters } from "@repo/core/usecases";

export const getAdminShopFiltersAction = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminShopFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}