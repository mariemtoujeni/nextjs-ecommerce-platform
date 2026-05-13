'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminCategoryFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminCategoryFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}