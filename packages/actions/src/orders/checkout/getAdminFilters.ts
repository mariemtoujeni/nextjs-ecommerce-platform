'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminCheckoutFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminCheckoutFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}