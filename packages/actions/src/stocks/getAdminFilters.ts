'use server';

import { GenericFilter } from "@repo/core/types";
import { getStockFilters } from "@repo/core/usecases";

export const getAdminStockFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getStockFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}