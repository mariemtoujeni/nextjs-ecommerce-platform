'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminEventFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminEventFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}