'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminClientFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminClientFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}