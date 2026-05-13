'use server';

import { GenericFilter } from "@repo/core/types";
import { getAdminDiscountFilters } from "@repo/core/usecases";

export const getAdminFilters = async (): Promise<GenericFilter[]> => {
    try {
        return await getAdminDiscountFilters();
    } catch (error) {
        console.error(error);
    }

    return [];
}