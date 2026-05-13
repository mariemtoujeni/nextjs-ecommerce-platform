'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminInventoryFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminInventoryFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}