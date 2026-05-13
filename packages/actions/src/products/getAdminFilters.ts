'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminProductFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminProductFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}